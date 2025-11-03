import { FastifyInstance } from 'fastify';
import proxy from '@fastify/http-proxy';

export default async function (fastify: FastifyInstance) {
  fastify.register(proxy, {
    upstream: 'http://localhost:3001',
    prefix: '/auth',
    rewritePrefix: '',
    http2: false,
  });

  fastify.register(proxy, {
    upstream: 'http://localhost:3002',
    prefix: '/users',
    rewritePrefix: '',
    http2: false,
  });

  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      upstreams: {
        authService: 'http://localhost:3001',
        usersService: 'http://localhost:3002',
      },
    };
  });

  fastify.get('/', async () => {
    return {
      service: 'API Gateway',
      version: '1.0.0',
      endpoints: {
        health: 'GET /health',
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register',
          health: 'GET /auth/health',
        },
        users: {
          list: 'GET /users/users',
          get: 'GET /users/users/:id',
          update: 'PUT /users/users/:id',
          delete: 'DELETE /users/users/:id',
          health: 'GET /users/health',
        },
      },
      documentation: 'All requests are proxied to appropriate microservices',
    };
  });
}

