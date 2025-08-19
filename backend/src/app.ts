import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from 'dotenv';
import path from 'path';

// Import configurations and utilities
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger, morganStream } from './utils/logger';
import routes from './routes';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY MIDDLEWARE ====================
// Helmet for security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ==================== GENERAL MIDDLEWARE ====================
// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// ==================== ROUTES ====================
// API routes
app.use('/api/v1', routes);

// Serve static files (if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Thé Tip Top API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      participation: '/api/v1/participation',
      admin: '/api/v1/admin',
      employee: '/api/v1/employee',
      gains: '/api/v1/gains'
    }
  });
});

// ==================== ERROR HANDLING ====================
// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ==================== SERVER STARTUP ====================
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api/v1`);
      logger.info(`📚 Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await disconnectDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
