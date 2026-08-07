import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller';
import { initAgentTask, getAgentFeed } from '../controllers/agent.controller';
import { getPersonas, createPersona } from '../controllers/persona.controller';
import { getTopics } from '../controllers/topic.controller';
import { getPosts } from '../controllers/post.controller';
import { getMemoryLogs } from '../controllers/memory.controller';
import { getSchedulerStatus } from '../controllers/scheduler.controller';

const router = Router();

// Health Check
router.get('/health', getHealthStatus);

// Autonomous Agent Routes
router.post('/agent/init', initAgentTask);
router.get('/agent/feed', getAgentFeed);

// Entity Routes
router.get('/persona', getPersonas);
router.post('/persona', createPersona);
router.get('/topics', getTopics);
router.get('/posts', getPosts);
router.get('/memory', getMemoryLogs);
router.get('/scheduler/logs', getSchedulerStatus);

export default router;
