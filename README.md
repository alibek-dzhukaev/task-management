# Task Management

Task management application built with React frontend and Fastify microservices. Uses Nx monorepo for better code sharing and build optimization.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start Docker

```bash
docker-compose up
```

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
    +---> Auth Service (:3001)
    +---> Users Service (:3002)
          |
          v
    PostgreSQL Database
```

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
- PostgreSQL + Prisma ORM

**Tools:**
- Nx monorepo
- Docker
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
│   └── users-service/       # User CRUD
├── libs/
│   ├── shared/types/        # Shared TypeScript types
│   └── shared/database/     # Prisma client
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
npm run docker:db       # Start PostgreSQL in Docker
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open Prisma Studio (DB admin)

# Build & Test
npm run build           # Build all
npm run test            # Test all
npm run lint            # Lint all
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
npm run prisma:migrate
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

Should show `task-management-db` container. If not:

```bash
npm run docker:db
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

## License

MIT
