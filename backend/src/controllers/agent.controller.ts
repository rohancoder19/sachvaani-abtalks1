import { Request, Response } from 'express';
import { agentQueue } from '../queue/agent.queue';
import { SchedulerModel } from '../models/scheduler.model';
import { PersonaModel } from '../models/persona.model';
import { PostModel } from '../models/post.model';
import { logger } from '../config/logger';

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

    // Schedule repeatable BullMQ task every 30 minutes
    await agentQueue.add(
      'autonomous-cycle-job',
      { personaId: persona._id.toString() },
      {
        repeat: {
          every: 30 * 60 * 1000 // 30 minutes
        },
        jobId: `repeatable-${persona._id.toString()}`
      }
    );

    // Immediate manual trigger for quick output feedback
    await agentQueue.add('manual-immediate-job', { personaId: persona._id.toString() });

    await SchedulerModel.findOneAndUpdate(
      { personaId: persona._id },
      {
        personaId: persona._id,
        cronExpression: '*/30 * * * *',
        intervalMinutes: 30,
        status: 'IDLE',
        nextRunAt: new Date(Date.now() + 30 * 60 * 1000)
      },
      { upsert: true }
    );

    logger.info(`🚀 Initialized autonomous scheduler for Persona: ${persona.name}`);

    res.status(200).json({
      success: true,
      message: 'Autonomous AI Creator initialized successfully. 30-minute interval scheduler active.',
      persona: {
        id: persona._id,
        name: persona.name,
        domain: persona.domain
      }
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
