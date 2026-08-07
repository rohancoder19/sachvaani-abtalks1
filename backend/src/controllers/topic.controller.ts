import { Request, Response } from 'express';
import { TopicModel } from '../models/topic.model';

export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const filter = status ? { status } : {};
    
    const topics = await TopicModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: topics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
