import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('✅ Successfully connected to MongoDB Database');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB Database:', error);
    process.exit(1);
  }
};
