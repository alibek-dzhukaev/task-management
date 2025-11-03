# Nx Fullstack Monorepo

Fullstack application with React frontend and Fastify microservices. Uses Nx monorepo for better code sharing and build optimization.

## Quick Start

Install dependencies:

```bash
npm install
```

Run all services:

```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:4200
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- Users Service: http://localhost:3002

Login credentials:
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
```

All services share TypeScript types from `@nx-fullstack/shared-types` library.

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
- In-memory storage

**Tools:**
- Nx monorepo
- ESLint
- Prettier

## Project Structure

```
nx/
├── apps/
│   ├── app/                 # React frontend
│   ├── api-gateway/         # Routes requests to services
│   ├── auth-service/        # Authentication
│   └── users-service/       # User CRUD
├── libs/
│   └── shared/types/        # Shared TypeScript types
└── scripts/                 # Helper scripts
```

## Available Commands

```bash
npm run dev:all         # Start all services
npm run stop            # Stop all services

npm run dev             # Frontend only
npm run dev:gateway     # API Gateway only
npm run dev:auth        # Auth Service only
npm run dev:users       # Users Service only

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
npx nx g @nx/node:application my-service --directory=apps/my-service
```

### Generate new library

```bash
npx nx g @nx/js:library my-lib --directory=libs/my-lib
```

## Troubleshooting

### Port already in use

```bash
npm run stop
```

### "EMFILE: too many open files" (macOS)

Add to `~/.zshrc`:

```bash
ulimit -n 10240
```

### Services not responding

Check if all services are running:

```bash
lsof -ti:4200  # frontend
lsof -ti:3000  # api-gateway
lsof -ti:3001  # auth-service
lsof -ti:3002  # users-service
```

## License

MIT
