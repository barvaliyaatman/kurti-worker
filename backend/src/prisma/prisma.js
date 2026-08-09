import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { contextStorage } from '../utils/context.js';

let basePrisma;

if (process.env.NODE_ENV === 'production') {
  basePrisma = new PrismaClient();
} else {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  basePrisma = global.prismaGlobal;
}

// Wrap Prisma with multi-tenant query filter extensions
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const store = contextStorage.getStore();
        const user = store?.get('user');

        // If no user context or user is SUPER_ADMIN, run query normally
        if (!user || user.role === 'SUPER_ADMIN') {
          return query(args);
        }

        const modelsWithCompanyId = [
          'User',
          'Employee',
          'JobCard',
          'Bundle',
          'Assignment',
          'EmployeeAdvance',
          'EmployeePayment',
          'Notification',
          'SystemSetting',
          'GarmentSize',
          'ProductionWorkflowSettings',
        ];

        if (modelsWithCompanyId.includes(model)) {
          // 1. Filter read/write query records
          if (
            ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany'].includes(
              operation
            )
          ) {
            args.where = args.where || {};
            args.where.company_id = user.company_id;
          }

          // 2. Set company_id on record creations
          if (operation === 'create') {
            args.data = args.data || {};
            args.data.company_id = user.company_id;
          } else if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
              args.data.forEach((item) => {
                item.company_id = user.company_id;
              });
            } else if (args.data) {
              args.data.company_id = user.company_id;
            }
          } else if (operation === 'upsert') {
            args.create = args.create || {};
            args.create.company_id = user.company_id;
          }
        }

        const result = await query(args);

        // 3. Prevent cross-company data leakage on single record lookups (findUnique, update, delete)
        if (
          result &&
          modelsWithCompanyId.includes(model) &&
          result.company_id &&
          result.company_id !== user.company_id
        ) {
          if (['findUnique', 'findFirst'].includes(operation)) {
            return null; // Return null so it behaves as not found
          }
          throw new Error('Unauthorized cross-company data access attempt.');
        }

        return result;
      },
    },
  },
});

basePrisma.$connect()
  .then(() => {
    logger.info('🐘 Database connected via Prisma Client singleton');
  })
  .catch((err) => {
    logger.warn('⚠️ Prisma Client initialized without active database connection: ' + err.message);
  });
