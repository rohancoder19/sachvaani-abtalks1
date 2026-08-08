import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info('✅ Successfully connected to MongoDB Database');
  } catch (error: any) {
    logger.error('❌ Failed to connect to MongoDB Database:', error?.message || error);
  }
};
