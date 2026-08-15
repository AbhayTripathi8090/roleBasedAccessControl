import mongoose from 'mongoose';
import { config } from './env.config';

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  state: string;
  host?: string;
  name?: string;
}

const connectionStates: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Configure global Mongoose listeners for connection lifecycle management
 */
const setupMongooseListeners = (): void => {
  mongoose.connection.on('connected', () => {
    console.log(`✅ [MongoDB] Connection established to ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ [MongoDB] Runtime connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB] Disconnected from database server');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [MongoDB] Connection restored');
  });
};

/**
 * Reusable MongoDB Database Connection Utility
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  setupMongooseListeners();

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: config.env === 'development',
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    return conn;
  } catch (error: any) {
    console.error('💥 [MongoDB] Initial connection failure:', error?.message || error);

    if (config.env === 'production') {
      console.error('💥 Exiting process due to MongoDB connection failure in production environment.');
      process.exit(1);
    }
    
    throw error;
  }
};

/**
 * Graceful Database Disconnection Utility
 */
export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🛑 [MongoDB] Connection closed gracefully');
  }
};

/**
 * Returns current database connection state
 */
export const getDBStatus = (): DatabaseConnectionStatus => {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    state: connectionStates[readyState] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};
