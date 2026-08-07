import { Request, Response } from 'express';
import { PersonaModel } from '../models/persona.model';

export const getPersonas = async (req: Request, res: Response): Promise<void> => {
  try {
    const personas = await PersonaModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: personas });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPersona = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, domain, voiceStyle, targetAudience, stylePreferences, userId } = req.body;
    
    // Set previous personas inactive if new one is active
    await PersonaModel.updateMany({}, { isActive: false });

    const persona = await PersonaModel.create({
      userId: userId || '60d5ecb8b5c9c22b88111111',
      name,
      domain,
      voiceStyle,
      targetAudience,
      stylePreferences,
      isActive: true
    });

    res.status(201).json({ success: true, data: persona });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
