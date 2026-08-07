import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class AIClientService {
  private client = axios.create({
    baseURL: env.FASTAPI_AI_SERVICE_URL,
    timeout: 60000, // 60s timeout for LLM generation
    headers: {
      'Content-Type': 'application/json'
    }
  });

  async triggerAutonomousCycle(personaId: string): Promise<any> {
    try {
      logger.info(`🤖 Triggering Python AI Service autonomous pipeline for persona: ${personaId}`);
      const response = await this.client.post('/api/v1/agent/execute', { personaId });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error calling Python AI Service:', error.message || error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data?.status === 'ok';
    } catch (error) {
      return false;
    }
  }
}

export const aiClientService = new AIClientService();
