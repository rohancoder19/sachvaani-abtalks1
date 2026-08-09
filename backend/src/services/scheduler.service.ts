import { AgentModel } from '../models/agent.model';
import { PostModel } from '../models/post.model';
import { SchedulerModel } from '../models/scheduler.model';
import { LogModel } from '../models/log.model';
import { runDirectAutonomousCycle } from '../controllers/agent.controller';
import { logger } from '../config/logger';


class AutonomousSchedulerService {
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();
  private runningLocks: Set<string> = new Set();

  /**
   * Starts a recurring background worker for an agent using Node.js setInterval
   */
  startScheduler(agentId: string, intervalMinutes: number = 30, ioInstance?: any): void {
    if (this.activeIntervals.has(agentId)) {
      logger.info(`⏰ Autonomous scheduler already running for Agent: ${agentId}`);
      return;
    }

    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
    logger.info(`🚀 Autonomous scheduler activated for Agent [${agentId}] (Interval: ${intervalMinutes} min)`);

    const timer = setInterval(async () => {
      logger.info(`🔄 [AUTONOMOUS CYCLE] Executing scheduled tick for Agent: ${agentId}`);
      await this.executeCycle(agentId, ioInstance);
    }, intervalMs);

    this.activeIntervals.set(agentId, timer);

    // Update DB status
    AgentModel.findOneAndUpdate(
      { agentId },
      { status: 'active', nextRunAt: new Date(Date.now() + intervalMs) }
    ).catch(err => logger.error('Failed to update agent status in DB:', err));
  }

  /**
   * Executes a single autonomous cycle safely without throwing uncaught exceptions
   */
  async executeCycle(agentId: string, ioInstance?: any): Promise<any> {
    if (this.runningLocks.has(agentId)) {
      logger.warn(`⚠️ [AUTONOMOUS CYCLE SKIPPED] Cycle already running for Agent [${agentId}]`);
      return null;
    }

    this.runningLocks.add(agentId);

    try {
      const agent = await AgentModel.findOne({ agentId });
      const personaContext = {
        name: agent?.persona?.name || 'Ada',
        domain: agent?.persona?.domain || 'AI Security'
      };

      await LogModel.create({
        level: 'info',
        message: `[AUTONOMOUS] Cycle started for Agent: ${agentId} (${personaContext.name} - ${personaContext.domain})`,
        source: 'SCHEDULER',
        details: { agentId, personaContext }
      });

      const cycleData = await runDirectAutonomousCycle(agentId, personaContext);

      const nextRunAt = new Date(Date.now() + 30 * 60 * 1000);
      const isSuccess = cycleData?.post ? 'success' : (cycleData?.status === 'NO_QUALIFYING_TOPIC' ? 'no_qualifying_topic' : 'failed');

      await AgentModel.findOneAndUpdate(
        { agentId },
        {
          lastRunAt: new Date(),
          nextRunAt,
          status: 'active',
          lastRunStatus: isSuccess,
          consecutiveFailures: isSuccess === 'failed' ? (agent?.consecutiveFailures || 0) + 1 : 0,
          $inc: { totalCycles: 1 }
        }
      );

      if (ioInstance) {
        ioInstance.emit('AUTONOMOUS_CYCLE_COMPLETED', {
          agentId,
          result: cycleData,
          timestamp: new Date()
        });
      }

      await LogModel.create({
        level: 'info',
        message: `[AUTONOMOUS] Cycle completed (${isSuccess}) for Agent: ${agentId}`,
        source: 'SCHEDULER',
        details: { agentId, cycleData: { topic: cycleData?.topic?.title, status: isSuccess } }
      });

      return cycleData;
    } catch (error: any) {
      logger.error(`❌ [AUTONOMOUS CYCLE FAILED] Error for Agent [${agentId}]:`, error.message || error);
      
      const nextRunAt = new Date(Date.now() + 30 * 60 * 1000);
      await AgentModel.findOneAndUpdate(
        { agentId },
        {
          lastRunAt: new Date(),
          nextRunAt,
          lastRunStatus: 'failed',
          lastError: error.message || String(error),
          $inc: { consecutiveFailures: 1, totalCycles: 1 }
        }
      ).catch(() => {});

      await LogModel.create({
        level: 'error',
        message: `[AUTONOMOUS] Cycle failed for Agent: ${agentId}: ${error.message}`,
        source: 'SCHEDULER',
        details: { agentId, error: error.message }
      });
      return null;
    } finally {
      this.runningLocks.delete(agentId);
    }
  }

  /**
   * Called on server boot to auto-resume all active autonomous agents from MongoDB
   */
  async initOnStartup(ioInstance?: any): Promise<void> {
    try {
      let activeAgents = await AgentModel.find({ status: 'active' });
      
      if (activeAgents.length === 0) {
        // Auto-create default Ada persona agent if none exists
        const defaultAgent = await AgentModel.create({
          agentId: 'ada-ai-security',
          persona: {
            name: 'Ada',
            domain: 'AI Security',
            voiceStyle: 'Analytical, evidence-driven, developer-focused'
          },
          status: 'active',
          nextRunAt: new Date(Date.now() + 30 * 60 * 1000)
        });
        activeAgents = [defaultAgent];
        logger.info(`✨ Auto-initialized default persona Agent: ${defaultAgent.agentId} (Ada - AI Security)`);
      }

      for (const agent of activeAgents) {
        this.startScheduler(agent.agentId, 30, ioInstance);

        // Seed initial post immediately on startup if agent has 0 published posts
        PostModel.countDocuments({
          $or: [{ agentId: agent.agentId }, { personaId: agent.agentId }]
        }).then((count: number) => {
          if (count === 0) {
            logger.info(`🌱 Agent [${agent.agentId}] has 0 posts. Seeding initial autonomous post on startup...`);
            this.executeCycle(agent.agentId, ioInstance).catch((err: any) => {
              logger.error(`Error seeding initial post for Agent [${agent.agentId}]:`, err);
            });
          }
        }).catch((err: any) => logger.error('Error checking post count on startup:', err));
      }

    } catch (error: any) {
      logger.error('Failed to initialize autonomous schedulers on startup:', error);
    }
  }


  stopScheduler(agentId: string): void {
    const timer = this.activeIntervals.get(agentId);
    if (timer) {
      clearInterval(timer);
      this.activeIntervals.delete(agentId);
      logger.info(`🛑 Autonomous scheduler stopped for Agent: ${agentId}`);
    }
  }
}


export const schedulerService = new AutonomousSchedulerService();
