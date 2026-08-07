import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { aiClientService } from '../services/aiClient.service';
import { SchedulerModel } from '../models/scheduler.model';
import { LogModel } from '../models/log.model';

const connection = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined
};

export const agentQueue = new Queue('autonomous-agent-queue', { connection });

export const initAgentWorker = (ioInstance?: any) => {
  const worker = new Worker(
    'autonomous-agent-queue',
    async (job: Job) => {
      logger.info(`⚙️ Processing BullMQ Job [${job.id}] for Persona: ${job.data.personaId}`);
      
      await SchedulerModel.findOneAndUpdate(
        { personaId: job.data.personaId },
        { status: 'RUNNING', lastRunAt: new Date() }
      );

      await LogModel.create({
        level: 'info',
        message: `Autonomous cycle started for persona ${job.data.personaId}`,
        source: 'QUEUE',
        details: { jobId: job.id }
      });

      // Call Python FastAPI AI Service
      const result = await aiClientService.triggerAutonomousCycle(job.data.personaId);

      await SchedulerModel.findOneAndUpdate(
        { personaId: job.data.personaId },
        { 
          status: 'IDLE',
          $inc: { totalRuns: 1, successfulRuns: 1 },
          nextRunAt: new Date(Date.now() + 30 * 60 * 1000)
        }
      );

      if (ioInstance) {
        ioInstance.emit('AUTONOMOUS_CYCLE_COMPLETED', {
          personaId: job.data.personaId,
          result,
          timestamp: new Date()
        });
      }

      return result;
    },
    { connection, concurrency: 2 }
  );

  worker.on('completed', (job) => {
    logger.info(`✅ Job [${job.id}] completed successfully`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`❌ Job [${job?.id}] failed with error:`, err);
    if (job?.data?.personaId) {
      await SchedulerModel.findOneAndUpdate(
        { personaId: job.data.personaId },
        { status: 'FAILED', $inc: { failedRuns: 1 } }
      );
    }
  });

  return worker;
};
