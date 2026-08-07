import { Request, Response } from 'express';
import { SchedulerModel } from '../models/scheduler.model';
import { LogModel } from '../models/log.model';

export const getSchedulerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await SchedulerModel.findOne().populate('personaId', 'name domain');
    const logs = await LogModel.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, scheduler: status, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
