import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

import { contextStorage } from './utils/context.js';

const app = express();

// Initialize Context Storage Middleware
app.use((req, res, next) => {
  contextStorage.run(new Map(), () => {
    next();
  });
});

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// API Routes setup
app.use('/api', routes);
app.use('/', routes); // Fail-safe fallback to support VITE_API_URL configuration without '/api' suffix

// Root URL welcome / default health check route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: '🧵 Kurti Manufacturing Worker Management ERP API is Live',
    health: '/api/health',
  });
});

// 404 Route Handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
