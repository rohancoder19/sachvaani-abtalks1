import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { AgentModel } from '../models/agent.model';
import { PostModel } from '../models/post.model';
import { TopicModel } from '../models/topic.model';
import { MemoryModel } from '../models/memory.model';
import { aiClientService } from '../services/aiClient.service';
import { schedulerService } from '../services/scheduler.service';
import { logger } from '../config/logger';


/**
 * Runs a single autonomous discovery, evaluation, deduplication, & post generation cycle
 */
export const runDirectAutonomousCycle = async (agentId: string, personaContext?: { name: string; domain: string }) => {
  // Fetch existing vector memory logs & published posts to prevent duplicates for this agent
  const existingMemories = await MemoryModel.find({ agentId }).lean();
  const existingPosts = await PostModel.find({ agentId }).lean();

  const pastMemories = [
    ...existingMemories.map((m: any) => ({ summary: m.summary, embeddings: m.embeddings, url: m.url })),
    ...existingPosts.map((p: any) => ({
      summary: p.topicTitle || p.text?.split('\n')[0]?.replace(/[🚀*#]/g, '').trim(),
      embeddings: [],
      url: p.sources?.[0]?.url || p.sources?.[0]
    }))
  ];

  const personaInfo = personaContext || { name: 'Ada', domain: 'AI Security' };
  const result = await aiClientService.triggerAutonomousCycle(agentId, pastMemories, personaInfo);
  const aiData = result?.data;

  if (aiData) {
    // 1. Save Discovered Topics for evaluation logs
    if (aiData.evaluatedTopics && Array.isArray(aiData.evaluatedTopics)) {
      for (const top of aiData.evaluatedTopics) {
        await TopicModel.findOneAndUpdate(
          { agentId, urlHash: top.urlHash },
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
        ).catch((err: any) => logger.warn(`Failed to upsert topic ${top.urlHash}:`, err.message));
      }
    }

    // Handle case where no candidate topic qualified for publication
    if (aiData.status === 'NO_QUALIFYING_TOPIC' || !aiData.topic || !aiData.post) {
      logger.info(`ℹ️ Autonomous cycle finished for Agent [${agentId}]: No new qualifying topics to publish.`);
      return aiData;
    }

    // 2. Save Generated Post (Atomic duplicate protection)
    let topicDoc = await TopicModel.findOne({ agentId, urlHash: aiData.topic.urlHash });
    if (!topicDoc) {
      topicDoc = await TopicModel.create({
        agentId,
        title: aiData.topic.title,
        summary: aiData.topic.summary || aiData.topic.title,
        source: aiData.topic.source || 'Tech Source',
        url: aiData.topic.url,
        urlHash: aiData.topic.urlHash || `hash_${Date.now()}`,
        score: aiData.topic.score || { overall: 8.5 },
        status: 'APPROVED'
      });
    }

    // Ensure post hasn't already been inserted for this agent & topic
    const existingPostForTopic = await PostModel.findOne({ agentId, topicId: topicDoc._id });
    if (existingPostForTopic) {
      logger.warn(`⚠️ Post already exists for Agent [${agentId}] and topic [${aiData.topic.title}]`);
      return aiData;
    }

    // Format sources as array of objects for DB model
    const formattedSources = Array.isArray(aiData.post.sources)
      ? aiData.post.sources.map((s: any) => typeof s === 'string' ? { title: aiData.topic.source || 'Source', url: s } : { title: s.title || aiData.topic.source || 'Source', url: s.url || s })
      : [{ title: aiData.topic.source || 'Source', url: aiData.topic.url }];

    const savedPost = await PostModel.create({
      agentId,
      topicId: topicDoc._id,
      topicTitle: aiData.topic.title,
      text: aiData.post.text,
      rationale: aiData.post.rationale,
      sources: formattedSources,
      tags: aiData.post.tags || ['AI', 'TechNews'],
      metrics: { views: 1, shares: 0, likes: 0 }
    });

    // 3. Save Vector Memory Entry
    if (aiData.embedding) {
      await MemoryModel.create({
        agentId,
        postId: savedPost._id,
        topicId: topicDoc._id,
        summary: aiData.topic.title,
        keywords: aiData.post.tags || ['AI', 'TechNews'],
        embeddings: aiData.embedding
      });
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
 *   "agentId": "abc-123"
 * }
 */
export const initAgentTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const personaInput = req.body?.persona || req.body;
    const name = personaInput?.name || req.body?.name;
    const domain = personaInput?.domain || req.body?.domain;

    if (!name || typeof name !== 'string' || !domain || typeof domain !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid persona payload. persona.name and persona.domain are required strings.'
      });
      return;
    }

    const personaIdParam = req.body?.personaId;
    
    // Generate stable unique slug for agentId based on persona name & domain
    const agentIdSlug = personaIdParam || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${domain.toLowerCase().replace(/[^a-z0-9]/g, '')}` || 'ada-ai-security';

    // Upsert Agent in MongoDB
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

    // Start Node.js persistent background scheduler (30-minute interval)
    const ioInstance = req.app.get('io');
    schedulerService.startScheduler(agent.agentId, 30, ioInstance);

    // Set non-caching HTTP headers for evaluator response
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
 *       "id": "...",
 *       "createdAt": "2026-08-09T12:00:00.000Z",
 *       "text": "...",
 *       "rationale": "...",
 *       "sources": [
 *         "https://..."
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

    // Find posts matching agentId (or legacy personaId for backwards compatibility)
    const isObjectId = mongoose.Types.ObjectId.isValid(agentId);
    const findQuery = isObjectId
      ? { $or: [{ agentId }, { personaId: agentId }] }
      : { agentId };

    const rawPosts = await PostModel.find(findQuery)
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
        : []
    }));

    res.status(200).json({
      posts: formattedPosts
    });
  } catch (error: any) {
    logger.error('Error fetching agent feed:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

