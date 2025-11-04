# Task Management

Task management application built with React frontend and Fastify microservices in Nx monorepo.

## Quick Start

```bash
npm install
docker compose up -d
npm run prisma:migrate
npm run dev:all
```

Access:
- Frontend: http://localhost:4200
- API Gateway: http://localhost:3000
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

## Architecture

```
React Frontend (:4200)
    ↓
API Gateway (:3000)
    ├─→ Auth Service (:3002)
    └─→ Users Service (:3003)
            ↓
       RabbitMQ (:5672)
            ↓
    Email Worker (:3005)
```

Infrastructure:
- PostgreSQL 16: Master + 2 read replicas
- Redis 7: Master + replica with Sentinel (3 nodes)
- RabbitMQ 3.13: Message broker
- Prometheus + Grafana: Monitoring

## Project Structure

```
nx/
├── apps/web/              # React frontend
├── services/
│   ├── api-gateway/       # HTTP proxy
│   ├── auth-service/      # Authentication
│   ├── users-service/     # User CRUD + caching
│   └── email-worker/      # Background email processor
├── libs/shared/
│   ├── types/             # Shared types
│   ├── database/          # Prisma client
│   ├── cache/             # Redis client
│   ├── messaging/         # RabbitMQ client
│   └── metrics/           # Prometheus metrics
└── monitoring/            # Prometheus & Grafana configs
```

## Commands

```bash
# Development
npm run dev:all           # All services
npm run dev               # Frontend only
npm run stop              # Stop all services

# Database
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio

# Build
npm run build             # Build all
npm run test              # Test all
npm run lint              # Lint all

# Nx
npx nx graph              # Visualize dependencies
npx nx affected:build     # Build only changed
```
