import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { initAgentTask, getAgentFeed } from '../controllers/agent.controller';
import { getPersonas, createPersona } from '../controllers/persona.controller';
import { getTopics } from '../controllers/topic.controller';
import { getPosts } from '../controllers/post.controller';
import { getMemoryLogs } from '../controllers/memory.controller';
import { getSchedulerStatus } from '../controllers/scheduler.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Health Check & Root Info
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ABTalks Autonomous AI Creator Backend API Gateway',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      apiV1: '/api/v1',
      posts: '/api/v1/posts',
      persona: '/api/v1/persona',
      feed: '/api/v1/agent/feed'
    }
  });
});
router.get('/health', getHealthStatus);

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateJWT as any, getCurrentUser);

// Autonomous Agent Routes
router.post('/agent/init', initAgentTask);
router.get('/agent/feed', getAgentFeed);
router.get('/feed', getAgentFeed);

// Entity Routes
router.get('/persona', getPersonas);
router.post('/persona', createPersona);
router.get('/topics', getTopics);
router.get('/posts', getPosts);
router.get('/memory', getMemoryLogs);
router.get('/scheduler/logs', getSchedulerStatus);

export default router;
