import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Health Check Route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'WorkFlow Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to WorkFlow RBAC API Server',
    healthCheck: '/api/v1/health',
  });
});

app.listen(PORT, () => {
  console.log(`[WorkFlow Server] Listening on http://localhost:${PORT}`);
});

export default app;
