import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class AIClientService {
  private client = axios.create({
    baseURL: env.FASTAPI_AI_SERVICE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  async triggerAutonomousCycle(agentId: string, pastMemories: any[] = [], personaInfo?: { name?: string; domain?: string }): Promise<any> {
    try {
      logger.info(`🤖 Triggering Python AI Service pipeline for agent: ${agentId} (${pastMemories.length} past memories)`);
      const response = await this.client.post('/api/v1/agent/execute', {
        personaId: agentId,
        pastMemories,
        persona: personaInfo
      });
      return response.data;
    } catch (error: any) {
      logger.error(`[AI SERVICE] request failed for agent ${agentId}`);
      logger.error(`[AI SERVICE] status: ${error.response?.status || 'N/A'}`);
      logger.error(`[AI SERVICE] response: ${JSON.stringify(error.response?.data || error.message || error)}`);
      throw new Error(`Python AI Microservice unavailable: ${error.message || 'Connection failed'}`);
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
