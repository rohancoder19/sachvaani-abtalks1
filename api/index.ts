import { createApp } from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

const app = createApp();

export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Database connection error in Vercel Serverless Function:', err);
  }
  return app(req, res);
}
