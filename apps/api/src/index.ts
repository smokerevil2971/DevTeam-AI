import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import zodValidation from './plugins/validation';
import authMiddleware from './plugins/auth';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import fileRoutes from './routes/files';
import messageRoutes from './routes/messages';
import { createWebSocketServer, setWebSocketEmitter } from './websocket';

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          }
        : undefined,
  },
});

// ========================================
// PLUGINS
// ========================================

// CORS
server.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Sensible defaults (httpErrors, etc.)
server.register(sensible);

// Rate limiting
server.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  }),
});

// Zod validation & error handling
server.register(zodValidation);

// Auth middleware (JWT verification, RBAC)
server.register(authMiddleware);

// ========================================
// ROUTES
// ========================================

// Health check
server.get('/health', async () => {
  return { 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// API version prefix
server.register(
  async (app) => {
    app.get('/', async () => ({
      message: 'DevTeam AI API v1',
      docs: '/api/v1/docs',
    }));
    
    // Auth routes (password reset, email verification)
    app.register(authRoutes, { prefix: '/auth' });
    
    // Project routes (CRUD, archive, restore)
    app.register(projectRoutes, { prefix: '/projects' });
    
    // Task routes (nested under projects)
    app.register(
      async (projectApp) => {
        projectApp.register(taskRoutes);
      },
      { prefix: '/projects/:id/tasks' }
    );
    
    // File routes (nested under projects)
    app.register(
      async (projectApp) => {
        projectApp.register(fileRoutes);
      },
      { prefix: '/projects/:id/files' }
    );
    
    // Message routes (nested under projects)
    app.register(
      async (projectApp) => {
        projectApp.register(messageRoutes);
      },
      { prefix: '/projects/:id/messages' }
    );
  },
  { prefix: '/api/v1' }
);

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await server.close();
    server.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    server.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  server.log.fatal(error, 'Uncaught exception');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  server.log.fatal({ reason, promise }, 'Unhandled rejection');
});

// ========================================
// START SERVER
// ========================================

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    // Get the underlying HTTP server and attach WebSocket
    const httpServer = server.server;
    const io = createWebSocketServer(httpServer);
    setWebSocketEmitter(io);
    
    server.log.info(`Server listening on http://${host}:${port}`);
    server.log.info('WebSocket server attached');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
