import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Automatically increase connection_limit and pool_timeout to prevent
// "Timed out fetching a new connection from the connection pool (connection limit: 1)"
// when Next.js React Server Components execute parallel DB queries.
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  let modifiedUrl = url;
  if (modifiedUrl.includes('connection_limit=')) {
    modifiedUrl = modifiedUrl.replace(/connection_limit=\d+/, 'connection_limit=10');
  } else {
    modifiedUrl += (modifiedUrl.includes('?') ? '&' : '?') + 'connection_limit=10';
  }
  if (!modifiedUrl.includes('pool_timeout=')) {
    modifiedUrl += '&pool_timeout=30';
  }
  return modifiedUrl;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
