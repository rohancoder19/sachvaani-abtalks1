import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  lazyConnect: true
});

redisClient.on('connect', () => {
  logger.info('✅ Connected to Redis Client');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis Connection Error:', err);
});
