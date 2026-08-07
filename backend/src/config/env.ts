import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/autonomous-ai-creator'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  JWT_SECRET: z.string().default('super_secret_jwt_key_autonomous_ai_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FASTAPI_AI_SERVICE_URL: z.string().default('http://localhost:8000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
