import { Request, Response } from 'express';
import { aiClientService } from '../services/aiClient.service';

export const getHealthStatus = async (req: Request, res: Response): Promise<void> => {
  const aiHealthy = await aiClientService.checkHealth();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      backend: 'healthy',
      aiService: aiHealthy ? 'healthy' : 'unreachable',
      database: 'connected'
    }
  });
};
