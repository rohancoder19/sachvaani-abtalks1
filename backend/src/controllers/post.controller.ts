import { Request, Response } from 'express';
import { PostModel } from '../models/post.model';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await PostModel.find()
      .populate('personaId', 'name domain')
      .populate('topicId', 'title source url score')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
