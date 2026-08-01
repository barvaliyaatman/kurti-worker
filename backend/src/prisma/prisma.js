import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prismaClient;

if (process.env.NODE_ENV === 'production') {
  prismaClient = new PrismaClient();
} else {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prismaClient = global.prismaGlobal;
}

export const prisma = prismaClient;

prisma.$connect()
  .then(() => {
    logger.info('🐘 Database connected via Prisma Client singleton');
  })
  .catch((err) => {
    logger.warn('⚠️ Prisma Client initialized without active database connection: ' + err.message);
  });
