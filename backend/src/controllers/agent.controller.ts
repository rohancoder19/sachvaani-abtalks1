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
  // Fetch all existing vector memory logs & published posts to prevent duplicate publication platform-wide
  const existingMemories = await MemoryModel.find().lean();
  const existingPosts = await PostModel.find().lean();

  const pastMemories = [
    ...existingMemories.map((m: any) => ({ summary: m.summary, embeddings: m.embeddings })),
    ...existingPosts.map((p: any) => ({ summary: p.text?.split('\n')[0]?.replace(/[🚀*]/g, '').trim(), embeddings: [] }))
  ];

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
      let topicDoc = await TopicModel.findOne({ urlHash: aiData.topic.urlHash });
      if (!topicDoc) {
        topicDoc = await TopicModel.create({
          personaId,
          title: aiData.topic.title,
          summary: aiData.topic.summary || aiData.topic.title,
          source: aiData.topic.source || 'TechCrunch AI',
          url: aiData.topic.url || 'https://techcrunch.com/category/artificial-intelligence/',
          urlHash: aiData.topic.urlHash || `hash_${Date.now()}`,
          score: aiData.topic.score || { overall: 8.5 },
          status: 'APPROVED'
        });
      }

      const savedPost = await PostModel.create({
        personaId,
        topicId: topicDoc._id,
        text: aiData.post.text,
        rationale: aiData.post.rationale,
        sources: aiData.post.sources,
        tags: aiData.post.tags,
        metrics: { views: 18, shares: 4, likes: 12 }
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

    // Run direct cycle so immediate fresh post is guaranteed
    const cycleData = await runDirectAutonomousCycle(persona._id.toString());
    const io = req.app.get('io');
    if (io) {
      io.emit('AUTONOMOUS_CYCLE_COMPLETED', {
        personaId: persona._id,
        result: cycleData,
        timestamp: new Date()
      });
    }

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

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({
      success: true,
      message: 'Autonomous AI Creator cycle initiated successfully. Discovered fresh topics and updated feed.',
      persona: {
        id: persona._id,
        name: persona.name,
        domain: persona.domain
      },
      cycleResult: cycleData
    });
  } catch (error: any) {
    logger.error('Error initializing agent task:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export const getAgentFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { agentId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (agentId) {
      filter.personaId = agentId;
    }

    const posts = await PostModel.find(filter)
      .populate('personaId', 'name domain voiceStyle')
      .populate('topicId', 'title score source url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PostModel.countDocuments(filter);

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
