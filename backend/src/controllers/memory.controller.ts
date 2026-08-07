import { Request, Response } from 'express';
import { MemoryModel } from '../models/memory.model';

export const getMemoryLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const memory = await MemoryModel.find()
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, data: memory });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
