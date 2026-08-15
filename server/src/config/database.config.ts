import mongoose from 'mongoose';
import { config } from './env.config';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('[Database] MongoDB Connection Error:', error);
    // Don't crash immediately in development if local DB isn't running yet
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};
