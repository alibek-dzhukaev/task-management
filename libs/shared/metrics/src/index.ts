import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import promClient from 'prom-client';

const register = new promClient.Registry();

promClient.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status', 'service'],
  registers: [register],
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status', 'service'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
  registers: [register],
});

const activeConnections = new promClient.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  labelNames: ['service'],
  registers: [register],
});

export interface MetricsOptions {
  serviceName: string;
}

export function registerMetrics(
  fastify: FastifyInstance,
  options: MetricsOptions
): void {
  const { serviceName } = options;

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    (request as any).startTime = Date.now();
    activeConnections.inc({ service: serviceName });
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const duration = Date.now() - ((request as any).startTime || Date.now());
    const route = request.routeOptions?.url || request.url;
    const method = request.method;
    const status = reply.statusCode;

    httpRequestsTotal.inc({
      method,
      route,
      status: status.toString(),
      service: serviceName,
    });

    httpRequestDuration.observe(
      {
        method,
        route,
        status: status.toString(),
        service: serviceName,
      },
      duration
    );

    activeConnections.dec({ service: serviceName });
  });

  fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Content-Type', register.contentType);
    return register.metrics();
  });

  fastify.log.info(`Metrics endpoint registered for ${serviceName} at /metrics`);
}

export { register, httpRequestsTotal, httpRequestDuration, activeConnections };

