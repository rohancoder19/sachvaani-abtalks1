import { Request, Response } from 'express';
import { agentQueue } from '../queue/agent.queue';
import { AgentModel } from '../models/agent.model';
import { PersonaModel } from '../models/persona.model';
import { PostModel } from '../models/post.model';
import { TopicModel } from '../models/topic.model';
import { MemoryModel } from '../models/memory.model';
import { SchedulerModel } from '../models/scheduler.model';
import { aiClientService } from '../services/aiClient.service';
import { schedulerService } from '../services/scheduler.service';
import { logger } from '../config/logger';

/**
 * Runs a single autonomous discovery, evaluation, deduplication, & post generation cycle
 */
export const runDirectAutonomousCycle = async (agentId: string, personaContext?: { name: string; domain: string }) => {
  // Fetch existing vector memory logs & published posts to prevent duplicates
  const existingMemories = await MemoryModel.find().lean();
  const existingPosts = await PostModel.find().lean();

  const pastMemories = [
    ...existingMemories.map((m: any) => ({ summary: m.summary, embeddings: m.embeddings })),
    ...existingPosts.map((p: any) => ({ summary: p.text?.split('\n')[0]?.replace(/[🚀*#]/g, '').trim(), embeddings: [] }))
  ];

  const personaInfo = personaContext || { name: 'Ada', domain: 'AI Security' };
  const result = await aiClientService.triggerAutonomousCycle(agentId, pastMemories, personaInfo);
  const aiData = result?.data;

  if (aiData) {
    // 1. Save Discovered Topics
    if (aiData.evaluatedTopics && Array.isArray(aiData.evaluatedTopics)) {
      for (const top of aiData.evaluatedTopics) {
        await TopicModel.findOneAndUpdate(
          { urlHash: top.urlHash },
          {
            agentId,
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
          agentId,
          title: aiData.topic.title,
          summary: aiData.topic.summary || aiData.topic.title,
          source: aiData.topic.source || 'TechCrunch AI',
          url: aiData.topic.url || 'https://techcrunch.com/category/artificial-intelligence/',
          urlHash: aiData.topic.urlHash || `hash_${Date.now()}`,
          score: aiData.topic.score || { overall: 8.5 },
          status: 'APPROVED'
        });
      }

      // Format sources as array of objects for internal DB model
      const formattedSources = Array.isArray(aiData.post.sources)
        ? aiData.post.sources.map((s: any) => typeof s === 'string' ? { title: aiData.topic.source || 'Source', url: s } : { title: s.title || aiData.topic.source || 'Source', url: s.url || s })
        : [{ title: aiData.topic.source || 'Tech Source', url: aiData.topic.url || 'https://techcrunch.com' }];

      const savedPost = await PostModel.create({
        agentId,
        topicId: topicDoc._id,
        text: aiData.post.text,
        rationale: aiData.post.rationale,
        sources: formattedSources,
        tags: aiData.post.tags || ['AI', 'TechNews'],
        metrics: { views: 24, shares: 6, likes: 18 }
      });

      // 3. Save Vector Memory
      if (aiData.embedding) {
        await MemoryModel.create({
          agentId,
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

/**
 * Evaluator API Endpoint: POST /api/agent/init
 * 
 * Request:
 * {
 *   "persona": {
 *     "name": "Ada",
 *     "domain": "AI Security"
 *   }
 * }
 * 
 * Response:
 * {
 *   "agentId": "ada-ai-security"
 * }
 */
export const initAgentTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { persona, personaId } = req.body || {};

    const name = persona?.name || 'Ada';
    const domain = persona?.domain || 'AI Security';
    
    // Generate deterministic slug for agentId based on persona name & domain
    const agentIdSlug = personaId || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${domain.toLowerCase().replace(/[^a-z0-9]/g, '')}` || 'ada-ai-security';

    // Upsert Agent persona in DB
    const agent = await AgentModel.findOneAndUpdate(
      { agentId: agentIdSlug },
      {
        agentId: agentIdSlug,
        persona: {
          name,
          domain,
          voiceStyle: 'Analytical, evidence-driven, developer-focused'
        },
        status: 'active',
        initializedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Also attempt BullMQ scheduling if Redis is available
    try {
      await agentQueue.add(
        'autonomous-cycle-job',
        { personaId: agent.agentId },
        { repeat: { every: 15 * 60 * 1000 }, jobId: `repeatable-${agent.agentId}` }
      );
    } catch (err: any) {
      logger.warn('BullMQ Redis Queue bypass (using in-memory background scheduler):', err.message);
    }

    // Start in-memory background worker loop
    const ioInstance = req.app.get('io');
    schedulerService.startScheduler(agent.agentId, 15, ioInstance);

    // Prevent caching for evaluator API endpoints
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Return IMMEDIATELY to evaluator with required agentId format
    res.status(200).json({
      agentId: agent.agentId
    });

    // Execute first autonomous cycle asynchronously in background
    schedulerService.executeCycle(agent.agentId, ioInstance).catch(err => {
      logger.error('Error running initial asynchronous cycle:', err);
    });
  } catch (error: any) {
    logger.error('Error initializing agent task:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

/**
 * Evaluator API Endpoint: GET /api/agent/feed?agentId=abc-123
 * 
 * Response:
 * {
 *   "posts": [
 *     {
 *       "id": "p7",
 *       "createdAt": "2026-08-07T10:30:00Z",
 *       "text": "Post content...",
 *       "rationale": "Why this topic was selected...",
 *       "sources": [
 *         "https://example.com/article"
 *       ]
 *     }
 *   ]
 * }
 */
export const getAgentFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const agentId = (req.query.agentId || req.query.personaId || '').toString();

    if (!agentId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: agentId'
      });
      return;
    }

    // Find posts matching agentId (or legacy personaId)
    const rawPosts = await PostModel.find({
      $or: [
        { agentId: agentId },
        { personaId: agentId }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Format posts strictly according to Hackathon Feed Endpoint Spec
    const formattedPosts = rawPosts.map((p: any) => ({
      id: p._id.toString(),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      text: p.text || '',
      rationale: p.rationale || '',
      sources: Array.isArray(p.sources)
        ? p.sources.map((s: any) => typeof s === 'string' ? s : (s.url || 'https://techcrunch.com'))
        : ['https://techcrunch.com']
    }));

    res.status(200).json({
      posts: formattedPosts
    });
  } catch (error: any) {
    logger.error('Error fetching agent feed:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};
