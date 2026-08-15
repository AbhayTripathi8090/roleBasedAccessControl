import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.config';
import { getDBStatus } from './config/database';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

// Import Feature Module Routers
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import auditLogRoutes from './modules/audit-logs/auditLog.routes';

const app: Application = express();

// Middleware pipeline
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const normalizedClientUrl = config.clientUrl.trim().replace(/\/$/, '');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/$/, '');

      if (
        cleanOrigin === normalizedClientUrl ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        config.env === 'development'
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Health check endpoint with database status
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'success',
    message: 'WorkFlow Backend API Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: dbStatus,
  });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'success',
    message: 'WorkFlow API v1 is healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: dbStatus,
  });
});

// Feature API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

// Catch 404 & Global Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
