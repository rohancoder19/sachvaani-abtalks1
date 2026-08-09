import { AgentModel } from '../models/agent.model';
import { SchedulerModel } from '../models/scheduler.model';
import { LogModel } from '../models/log.model';
import { runDirectAutonomousCycle } from '../controllers/agent.controller';
import { logger } from '../config/logger';

class AutonomousSchedulerService {
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Starts a recurring background worker for an agent using Node.js setInterval
   */
  startScheduler(agentId: string, intervalMinutes: number = 15, ioInstance?: any): void {
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

      const nextRunAt = new Date(Date.now() + 15 * 60 * 1000);
      await AgentModel.findOneAndUpdate(
        { agentId },
        {
          lastRunAt: new Date(),
          nextRunAt,
          status: 'active',
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
        message: `[AUTONOMOUS] Cycle completed successfully for Agent: ${agentId}`,
        source: 'SCHEDULER',
        details: { agentId, cycleData: { topic: cycleData?.topic?.title } }
      });

      return cycleData;
    } catch (error: any) {
      logger.error(`❌ [AUTONOMOUS CYCLE FAILED] Error for Agent [${agentId}]:`, error.message || error);
      await LogModel.create({
        level: 'error',
        message: `[AUTONOMOUS] Cycle failed for Agent: ${agentId}: ${error.message}`,
        source: 'SCHEDULER',
        details: { agentId, error: error.message }
      });
      return null;
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
          status: 'active'
        });
        activeAgents = [defaultAgent];
        logger.info(`✨ Auto-initialized default persona Agent: ${defaultAgent.agentId} (Ada - AI Security)`);
      }

      for (const agent of activeAgents) {
        this.startScheduler(agent.agentId, 15, ioInstance);
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
