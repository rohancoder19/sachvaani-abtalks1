import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { aiClientService } from '../services/aiClient.service';
import { SchedulerModel } from '../models/scheduler.model';
import { LogModel } from '../models/log.model';
import { TopicModel } from '../models/topic.model';
import { PostModel } from '../models/post.model';
import { MemoryModel } from '../models/memory.model';

const connection = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false
};

let hasLoggedRedisWarning = false;
agentQueue.on('error', (err) => {
  if (!hasLoggedRedisWarning) {
    logger.warn('⚠️ BullMQ Redis Queue Notice: Redis is offline (falling back to direct execution mode)');
    hasLoggedRedisWarning = true;
  }
});

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

      // Fetch existing vector memory logs for deduplication
      const existingMemories = await MemoryModel.find({ personaId: job.data.personaId }).lean();
      const pastMemories = existingMemories.map((m: any) => ({
        summary: m.summary,
        embeddings: m.embeddings
      }));

      // Call Python FastAPI AI Service
      const result = await aiClientService.triggerAutonomousCycle(job.data.personaId, pastMemories);
      const aiData = result?.data;

      if (aiData) {
        // 1. Save Topic Candidate Queue
        if (aiData.evaluatedTopics && Array.isArray(aiData.evaluatedTopics)) {
          for (const top of aiData.evaluatedTopics) {
            await TopicModel.findOneAndUpdate(
              { urlHash: top.urlHash },
              {
                personaId: job.data.personaId,
                title: top.title,
                summary: top.summary,
                source: top.source,
                url: top.url,
                urlHash: top.urlHash,
                score: top.score,
                status: top.status,
                rejectionReason: top.rejectionReason
              },
              { upsert: true }
            );
          }
        }

        // 2. Save Generated Post to MongoDB
        let savedPost = null;
        if (aiData.topic && aiData.post) {
          const topicDoc = await TopicModel.findOne({ urlHash: aiData.topic.urlHash });
          savedPost = await PostModel.create({
            personaId: job.data.personaId,
            topicId: topicDoc?._id || '60d5ecb8b5c9c22b88111111',
            text: aiData.post.text,
            rationale: aiData.post.rationale,
            sources: aiData.post.sources,
            tags: aiData.post.tags,
            metrics: { views: 1, shares: 0, likes: 1 }
          });

          // 3. Save Vector Memory Entry
          if (aiData.embedding) {
            await MemoryModel.create({
              personaId: job.data.personaId,
              postId: savedPost._id,
              summary: aiData.topic.title,
              keywords: aiData.post.tags || ['AI'],
              embeddings: aiData.embedding
            });
          }
        }
      }

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
          result: aiData,
          timestamp: new Date()
        });
      }

      return aiData;
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
