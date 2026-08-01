import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Worker ERP Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`🔗 Health check available at: http://localhost:${env.PORT}/api/health`);
});

const gracefulShutdown = (signal) => {
  logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    logger.info('🔒 HTTP Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
