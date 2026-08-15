import app from './app';
import { config } from './config/env.config';
import { connectDB, disconnectDB } from './config/database';

const startServer = async () => {
  try {
    // Attempt database connection with graceful error handling
    await connectDB().catch((err: Error) => {
      console.warn('⚠️ [WorkFlow Server] Starting server without active MongoDB connection (Development fallback).');
    });

    // Start Express HTTP listener
    const server = app.listen(config.port, () => {
      console.log(`🚀 [WorkFlow Server] Running on http://localhost:${config.port} in ${config.env} mode`);
    });

    // Clean process shutdown handler
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ [WorkFlow Server] Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('✅ [WorkFlow Server] HTTP server closed.');
        await disconnectDB();
        console.log('✅ [WorkFlow Server] Graceful shutdown complete.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error: unknown) {
    console.error('❌ Failed to launch WorkFlow server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (err: Error) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 Unhandled Rejection:', reason);
});

startServer();
