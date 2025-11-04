# Task Management

Task management application built with React frontend and Fastify microservices. Uses Nx monorepo for better code sharing and build optimization.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL (Master + 2 Replicas)

Start databases:

```bash
docker compose up -d

```

This starts:
- Master DB: `localhost:5432` (writes)
- Replica 1: `localhost:5433` (reads)
- Replica 2: `localhost:5434` (reads)
- Redis Master: `localhost:6379` (cache writes)
- Redis Replica: `localhost:6380` (cache reads)
- Sentinels: `localhost:26379-26381` (monitoring)
- RabbitMQ: `localhost:5672` (message broker)
- RabbitMQ UI: `localhost:15672` (management)
- Prometheus: `localhost:9090` (metrics collection)
- Grafana: `localhost:3001` (metrics visualization)

Wait ~15 seconds for replicas and sentinels to sync.

### 3. Run migrations

Create database tables:

```bash
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 4. Add test user

```bash
npx prisma studio
```

This opens Prisma Studio in your browser. Create a user:
- email: `admin@test.com`
- password: `admin123`
- name: `Admin User`

### 5. Run all services

```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:4200
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3002
- Users Service: http://localhost:3003
- Email Worker: http://localhost:3005 (background + metrics)

Each service exposes metrics at `/metrics` endpoint.

Login with:
- Email: `admin@test.com`
- Password: `admin123`

## Architecture

```
React Frontend (:4200)
    |
    v
API Gateway (:3000)
    |
    +---> Auth Service (:3001) ────┐
    +---> Users Service (:3002) ───┤
              |                    │
              v                    v
    ┌──────────────────────────────────────────┐
    │         RabbitMQ (:5672)                 │
    │   Management UI: :15672                  │
    │   Queues:                                │
    │   • user.registered ──┐                  │
    │   • user.updated ─────┤                  │
    │   • user.deleted ─────┤                  │
    └───────────────────────┼──────────────────┘
                            │
                            v
                   Email Worker (:3003)
                   [Sends notifications]
    
    ┌─────────────────┐       ┌──┴──────────────────┐
    │ Redis Sentinel  │       │                     │
    │ [:26379-26381]  │       ▼                     ▼
    │ [Auto Failover] │ Master DB (:5432)     Read Replicas
    └────────┬────────┘ [Writes]              [:5433, :5434]
             │              │                 [Reads - Load Balanced]
             v              └──────────┬──────────┘
    Redis Master (:6379)              │
    Redis Replica (:6380)        Replication
       [5 min TTL Cache]
```

Infrastructure features:
- Database Replication: Master + 2 read replicas with automatic failover
- Redis Sentinel: Master + replica with 3 sentinels for automatic failover
- Caching: 5-minute TTL for user data, reduces DB load by ~80%
- Load Balancing: Round-robin across DB replicas
- Message Queue: RabbitMQ for async event processing
- Event-Driven: Services communicate via domain events
- Monitoring: Prometheus + Grafana for real-time metrics and visualization

All services share TypeScript types from `@task-management/shared-types` library.

## Tech Stack

Frontend:
- React 19
- Vite 7
- React Router 7
- TypeScript

Backend:
- Fastify 5
- TypeScript
- JWT authentication
- PostgreSQL 16 with Master-Replica replication
- Prisma ORM with read replica load balancing
- Redis 7 for caching and sessions
- RabbitMQ 3.13 for message queuing
- Nodemailer for email notifications

Monitoring:
- Prometheus 2.48 (metrics collection)
- Grafana 10.2 (visualization)
- prom-client (Node.js metrics)

Tools:
- Nx monorepo
- Docker Compose
- ESLint
- Prettier

## Project Structure

```
nx/
├── apps/
│   └── web/                 # React frontend
├── services/
│   ├── api-gateway/         # Routes requests to services
│   ├── auth-service/        # Authentication
│   ├── users-service/       # User CRUD + caching
│   └── email-worker/        # Email notifications (background)
├── libs/
│   └── shared/
│       ├── types/           # Shared TypeScript types
│       ├── database/        # Prisma client (master + replicas)
│       ├── cache/           # Redis client
│       ├── messaging/       # RabbitMQ client
│       └── metrics/         # Prometheus metrics
├── monitoring/
│   ├── prometheus/          # Prometheus config
│   └── grafana/             # Grafana dashboards
├── prisma/
│   └── schema.prisma        # Database schema
└── scripts/                 # Helper scripts
```

## Available Commands

```bash
# Development
npm run dev:all          # Start all services
npm run stop             # Stop all services

npm run dev              # Frontend only
npm run dev:gateway      # API Gateway only
npm run dev:auth         # Auth Service only
npm run dev:users        # Users Service only
npm run dev:email-worker # Email Worker only

# Database
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open Prisma Studio (DB admin)

# Build & Test
npm run build            # Build all projects
npm run build:auth       # Build auth-service only
npm run build:users      # Build users-service only
npm run build:gateway    # Build api-gateway only
npm run build:email-worker # Build email-worker only
npm run test             # Test all
npm run lint             # Lint all

# Build output:
# - Microservices: dist/services/*/main.js (~4KB each)
# - Frontend: apps/web/build/
```

## API Endpoints

### Auth Service (via /auth)

```
POST /auth/login       - Login
POST /auth/register    - Register
GET  /auth/health      - Health check
```

### Users Service (via /users)

```
GET    /users/users     - List all users
GET    /users/users/:id - Get user by ID
PUT    /users/users/:id - Update user
DELETE /users/users/:id - Delete user
GET    /users/health    - Health check
```

## Events & Messaging

The application uses RabbitMQ for event-driven communication between services.

### Domain Events

| Event | Queue | Trigger | Consumer | Action |
|-------|-------|---------|----------|--------|
| `user.registered` | user.registered | User registers via Auth Service | Email Worker | Send welcome email |
| `user.created` | user.created | User created manually | Email Worker | Send welcome email |
| `user.updated` | user.updated | User profile updated | Email Worker | Send update notification |
| `user.deleted` | user.deleted | User deleted | Email Worker | Send goodbye email |

### Event Flow Example

```
User Registration:
1. POST /auth/register
2. Auth Service creates user in DB
3. Auth Service publishes user.registered event
4. RabbitMQ queues the event
5. Email Worker consumes event
6. Email Worker sends welcome email
```

### Email Configuration

For development, emails are logged to console. To use real SMTP:

```bash
# Add to .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="Task Management <noreply@taskmanagement.com>"
NODE_ENV=production
```

## Development

### View dependency graph

```bash
npx nx graph
```

### Build specific service

```bash
npx nx build auth-service
npx nx build users-service
npx nx build api-gateway
```

### Build only what changed

```bash
npx nx affected:build
```

### Generate new service

```bash
npx nx g @nx/node:application my-service --directory=services/my-service
```

### Generate new library

```bash
npx nx g @nx/js:library my-lib --directory=libs/my-lib
```

## Database

### Schema changes

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

### View/Edit data

```bash
npm run prisma:studio
```

### Reset database

```bash
docker compose down -v
docker compose up -d
# Wait 10 seconds for replicas to initialize
npm run prisma:migrate
```

### Check replication status

```bash
docker exec -it task-management-db-master psql -U taskmanager -d task_management -c "SELECT * FROM pg_stat_replication;"
```

### Check Redis cache

```bash
# Connect to Redis master
docker exec -it task-management-redis-master redis-cli -a redis_dev_password

# View all keys
KEYS *

# Get cached users list
GET users:all

# Get specific user cache
GET user:<user-id>

# Clear all cache
FLUSHALL
```

### Check RabbitMQ

Access RabbitMQ Management UI: http://localhost:15672
- Username: `taskrabbit`
- Password: `rabbit_dev_password`

CLI commands:

```bash
# List queues
docker exec -it task-management-rabbitmq rabbitmqctl list_queues

# List connections
docker exec -it task-management-rabbitmq rabbitmqctl list_connections

# Check queue messages
docker exec -it task-management-rabbitmq rabbitmqctl list_queues name messages
```

### Check Sentinel status

```bash
# Connect to Sentinel
docker exec -it task-management-redis-sentinel-1 redis-cli -p 26379

# Check master info
SENTINEL master mymaster

# Check replicas
SENTINEL replicas mymaster

# Check sentinels
SENTINEL sentinels mymaster

# Force failover (test)
SENTINEL failover mymaster
```

### Test Redis failover

```bash
# Stop master
docker stop task-management-redis-master

# Watch logs - Sentinel will promote replica
docker logs -f task-management-redis-sentinel-1

# App continues working with new master on port 6380

# Restart old master - becomes replica
docker start task-management-redis-master
```

### Test data on all databases

```bash
# Master
docker exec -it task-management-db-master psql -U taskmanager -d task_management -c "SELECT * FROM users;"

# Replica 1
docker exec -it task-management-db-replica-1 psql -U taskmanager -d task_management -c "SELECT * FROM users;"

# Replica 2
docker exec -it task-management-db-replica-2 psql -U taskmanager -d task_management -c "SELECT * FROM users;"
```

## Monitoring with Prometheus & Grafana

The application includes full monitoring setup with Prometheus (metrics collection) and Grafana (visualization).

### Access URLs

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Monitored Metrics

All services expose `/metrics` endpoint with:

HTTP Metrics:
- Request rate (requests/second)
- Response time (P50, P95, P99)
- Error rate (4xx, 5xx)
- Active connections

Node.js Metrics:
- Memory usage (heap, external)
- CPU usage
- Event loop lag
- Garbage collection

Custom Metrics:
- Cache hit/miss rate
- Database queries
- Queue message processing

### Grafana Dashboards

Pre-configured dashboard: Task Management System - Overview

Metrics displayed:
- Total requests/sec across all services
- Error rate (5xx responses)
- P95 latency by service
- Service health status
- Request rate by service (graph)
- Response time percentiles (P50, P95)
- HTTP status codes (2xx, 4xx, 5xx)
- Memory usage by service

Dashboard auto-refreshes every 5 seconds.

### Check Metrics from CLI

```bash
# API Gateway metrics
curl http://localhost:3000/metrics

# Auth Service metrics
curl http://localhost:3002/metrics

# Users Service metrics
curl http://localhost:3003/metrics

# Email Worker metrics
curl http://localhost:3005/metrics
```

### Prometheus Queries (Examples)

Open http://localhost:9090 and try:

```promql
# Total request rate
sum(rate(http_requests_total[1m]))

# Error rate by service
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)

# P95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (le, service))

# Memory usage
nodejs_heap_size_used_bytes

# Active connections
http_active_connections
```

### Create Custom Dashboard

1. Open Grafana: http://localhost:3001
2. Click **+ Create** → **Dashboard**
3. Add panel → Select **Prometheus** datasource
4. Enter query (examples above)
5. Choose visualization (Time series, Gauge, Stat)
6. Save dashboard

### Alerts (Optional)

Add to `monitoring/prometheus/alerts.yml`:

```yaml
groups:
  - name: service_alerts
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 5%"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (le)) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is above 1000ms"
```

### Monitoring Configuration

Prometheus scrapes metrics every 15 seconds from:
- API Gateway: `host.docker.internal:3000/metrics`
- Auth Service: `host.docker.internal:3002/metrics`
- Users Service: `host.docker.internal:3003/metrics`
- Email Worker: `host.docker.internal:3005/metrics`

Configuration: `monitoring/prometheus/prometheus.yml`

Grafana provisioning:
- Datasources: `monitoring/grafana/provisioning/datasources/`
- Dashboards: `monitoring/grafana/dashboards/`

### Troubleshooting Monitoring

If Prometheus shows services as DOWN:

```bash
# Make sure all services are running
npm run dev:all

# Check if metrics endpoints respond
curl http://localhost:3000/metrics
curl http://localhost:3002/metrics
curl http://localhost:3003/metrics
curl http://localhost:3005/metrics
```

If Grafana dashboard shows "No Data":
1. Check Prometheus is collecting data: http://localhost:9090/targets
2. All targets should be "UP" (green)
3. If "DOWN", restart services: `npm run dev:all`

If Grafana is not accessible:

```bash
# Check if Grafana is running
docker ps | grep grafana

# Check logs
docker logs task-management-grafana

# Restart
docker compose restart grafana
```

## Troubleshooting

### Port already in use

```bash
npm run stop
```

### Database connection error

Check if Docker is running:

```bash
docker ps
```

Should show `task-management-db-master` container. If not:

```bash
docker compose up -d
# or
podman-compose up -d
```

### "EMFILE: too many open files" (macOS)

Add to `~/.zshrc`:

```bash
ulimit -n 10240
```

Then restart terminal.

### Services not responding

Check if all services are running:

```bash
lsof -ti:4200  # frontend
lsof -ti:3000  # api-gateway
lsof -ti:3001  # auth-service
lsof -ti:3002  # users-service
```

### Prisma errors

Regenerate Prisma client:

```bash
npm run prisma:generate
```
