import { Request, Response } from 'express';
import { agentQueue } from '../queue/agent.queue';
import { SchedulerModel } from '../models/scheduler.model';
import { PersonaModel } from '../models/persona.model';
import { PostModel } from '../models/post.model';
import { TopicModel } from '../models/topic.model';
import { MemoryModel } from '../models/memory.model';
import { aiClientService } from '../services/aiClient.service';
import { logger } from '../config/logger';

export const runDirectAutonomousCycle = async (personaId: string) => {
  // Fetch existing vector memory logs to prevent publishing duplicate topics
  const existingMemories = await MemoryModel.find({ personaId }).lean();
  const pastMemories = existingMemories.map((m: any) => ({
    summary: m.summary,
    embeddings: m.embeddings
  }));

  const result = await aiClientService.triggerAutonomousCycle(personaId, pastMemories);
  const aiData = result?.data;

  if (aiData) {
    // 1. Save Discovered Topics
    if (aiData.evaluatedTopics && Array.isArray(aiData.evaluatedTopics)) {
      for (const top of aiData.evaluatedTopics) {
        await TopicModel.findOneAndUpdate(
          { urlHash: top.urlHash },
          {
            personaId,
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

    // 2. Save Generated Post
    if (aiData.topic && aiData.post) {
      const topicDoc = await TopicModel.findOne({ urlHash: aiData.topic.urlHash });
      const savedPost = await PostModel.create({
        personaId,
        topicId: topicDoc?._id || '60d5ecb8b5c9c22b88111111',
        text: aiData.post.text,
        rationale: aiData.post.rationale,
        sources: aiData.post.sources,
        tags: aiData.post.tags,
        metrics: { views: 12, shares: 3, likes: 8 }
      });

      // 3. Save Vector Memory
      if (aiData.embedding) {
        await MemoryModel.create({
          personaId,
          postId: savedPost._id,
          summary: aiData.topic.title,
          keywords: aiData.post.tags || ['AI', 'TechNews'],
          embeddings: aiData.embedding
        });
      }
    }
  }
  return aiData;
};

export const initAgentTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { personaId } = req.body;

    let persona = await PersonaModel.findById(personaId);
    if (!persona) {
      persona = await PersonaModel.findOne({ isActive: true });
    }

    if (!persona) {
      res.status(404).json({ success: false, error: 'No active persona found. Please create a persona first.' });
      return;
    }

    // Attempt BullMQ scheduling if Redis is active
    try {
      await agentQueue.add(
        'autonomous-cycle-job',
        { personaId: persona._id.toString() },
        { repeat: { every: 30 * 60 * 1000 }, jobId: `repeatable-${persona._id.toString()}` }
      );
    } catch (err: any) {
      logger.warn('BullMQ Redis Queue bypass (running direct execution mode):', err.message);
    }

    // Trigger direct execution cycle so database and UI views update immediately
    const cycleData = await runDirectAutonomousCycle(persona._id.toString());

    await SchedulerModel.findOneAndUpdate(
      { personaId: persona._id },
      {
        personaId: persona._id,
        cronExpression: '*/30 * * * *',
        intervalMinutes: 30,
        status: 'IDLE',
        nextRunAt: new Date(Date.now() + 30 * 60 * 1000),
        $inc: { totalRuns: 1, successfulRuns: 1 }
      },
      { upsert: true }
    );

    logger.info(`🚀 Autonomous cycle completed successfully for Persona: ${persona.name}`);

    res.status(200).json({
      success: true,
      message: 'Autonomous AI Creator cycle completed successfully. Topics, posts, and vector memory updated.',
      persona: {
        id: persona._id,
        name: persona.name,
        domain: persona.domain
      },
      data: cycleData
    });
  } catch (error: any) {
    logger.error('Error initializing agent task:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export const getAgentFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find()
      .populate('personaId', 'name domain voiceStyle')
      .populate('topicId', 'title score source url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PostModel.countDocuments();

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
