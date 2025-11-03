import { Redis } from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const sentinelHosts = (process.env.REDIS_SENTINELS || 'localhost:26379,localhost:26380,localhost:26381')
  .split(',')
  .map(host => {
    const [sentinelHost, sentinelPort] = host.split(':');
    return { host: sentinelHost, port: parseInt(sentinelPort) };
  });

export const redis =
  globalForRedis.redis ??
  new Redis({
    sentinels: sentinelHosts,
    name: process.env.REDIS_MASTER_NAME || 'mymaster',
    password: process.env.REDIS_PASSWORD || 'redis_dev_password',
    sentinelPassword: process.env.REDIS_PASSWORD || 'redis_dev_password',
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    sentinelRetryStrategy: (times: number) => {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected via Sentinel');
});

redis.on('+switch-master', () => {
  console.log('Redis master switched! Sentinel failover completed.');
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  // Rate limiting helper
  async checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    return current <= maxRequests;
  },
};

export { Redis };

