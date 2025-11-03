import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaReadReplica1: PrismaClient | undefined;
  prismaReadReplica2: PrismaClient | undefined;
};

// Master - for writes and critical reads
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Read Replica 1 - for read operations
export const prismaReadReplica1 =
  globalForPrisma.prismaReadReplica1 ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_REPLICA_1_URL || process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Read Replica 2 - for read operations (load balancing)
export const prismaReadReplica2 =
  globalForPrisma.prismaReadReplica2 ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_REPLICA_2_URL || process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Simple round-robin load balancer for reads
let replicaIndex = 0;
export function getPrismaReadReplica(): PrismaClient {
  const replicas = [prismaReadReplica1, prismaReadReplica2];
  const replica = replicas[replicaIndex % replicas.length];
  replicaIndex++;
  return replica;
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaReadReplica1 = prismaReadReplica1;
  globalForPrisma.prismaReadReplica2 = prismaReadReplica2;
}

export * from '@prisma/client';

