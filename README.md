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
- Auth Service: http://localhost:3001
- Users Service: http://localhost:3002

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
    +---> Auth Service (:3001) ─┐
    +---> Users Service (:3002) ─┤
              |                  │
              v                  │
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

**Infrastructure:**
- **Database Replication:** Master + 2 read replicas with automatic failover
- **Redis Sentinel:** Master + replica with 3 sentinels for automatic failover
- **Caching:** 5-minute TTL for user data, reduces DB load by ~80%
- **Load Balancing:** Round-robin across DB replicas

All services share TypeScript types from `@task-management/shared-types` library.

## Tech Stack

**Frontend:**
- React 19
- Vite 7
- React Router 7
- TypeScript

**Backend:**
- Fastify 5
- TypeScript
- JWT authentication
- PostgreSQL 16 with Master-Replica replication
- Prisma ORM with read replica load balancing
- Redis 7 for caching and sessions

**Tools:**
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
│   └── users-service/       # User CRUD + caching
├── libs/
│   └── shared/
│       ├── types/           # Shared TypeScript types
│       ├── database/        # Prisma client (master + replicas)
│       └── cache/           # Redis client
├── prisma/
│   └── schema.prisma        # Database schema
└── scripts/                 # Helper scripts
```

## Available Commands

```bash
# Development
npm run dev:all         # Start all services
npm run stop            # Stop all services

npm run dev             # Frontend only
npm run dev:gateway     # API Gateway only
npm run dev:auth        # Auth Service only
npm run dev:users       # Users Service only

# Database
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open Prisma Studio (DB admin)

# Build & Test
npm run build           # Build all projects
npm run build:auth      # Build auth-service only
npm run build:users     # Build users-service only
npm run build:gateway   # Build api-gateway only
npm run test            # Test all
npm run lint            # Lint all

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

# App continues working! New master on port 6380

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
