import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { env } from '../config/env';
import { logger } from '../config/logger';

const inMemoryUsers: Map<string, any> = new Map();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required' });
      return;
    }

    let user: any = null;

    try {
      if (mongoose.connection.readyState === 1) {
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
          return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = await UserModel.create({
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: 'user'
        });
      }
    } catch (dbErr: any) {
      logger.warn('MongoDB registration query fallback:', dbErr?.message || dbErr);
    }

    if (!user) {
      const lowerEmail = email.toLowerCase();
      if (inMemoryUsers.has(lowerEmail)) {
        res.status(400).json({ success: false, error: 'User with this email already exists' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const fakeId = new mongoose.Types.ObjectId().toString();

      user = {
        _id: fakeId,
        id: fakeId,
        name,
        email: lowerEmail,
        passwordHash,
        role: 'user'
      };
      inMemoryUsers.set(lowerEmail, user);
    }

    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email, role: user.role },
      env.JWT_SECRET || 'super_secret_jwt_key_autonomous_ai_2026',
      { expiresIn: (env.JWT_EXPIRES_IN as any) || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    logger.error('Error during registration:', error);
    res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const lowerEmail = email.toLowerCase();
    let user: any = null;

    try {
      if (mongoose.connection.readyState === 1) {
        user = await UserModel.findOne({ email: lowerEmail });
      }
    } catch (dbErr: any) {
      logger.warn('MongoDB login query fallback:', dbErr?.message || dbErr);
    }

    if (!user) {
      user = inMemoryUsers.get(lowerEmail);
    }

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email, role: user.role },
      env.JWT_SECRET || 'super_secret_jwt_key_autonomous_ai_2026',
      { expiresIn: (env.JWT_EXPIRES_IN as any) || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    logger.error('Error during login:', error);
    res.status(500).json({ success: false, error: error.message || 'Login failed' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    let user: any = null;

    try {
      if (mongoose.connection.readyState === 1) {
        user = await UserModel.findById(userId).select('-passwordHash');
      }
    } catch (dbErr: any) {
      logger.warn('MongoDB findById fallback:', dbErr?.message || dbErr);
    }

    if (!user) {
      for (const u of inMemoryUsers.values()) {
        if (String(u._id || u.id) === String(userId)) {
          user = { id: u._id || u.id, name: u.name, email: u.email, role: u.role };
          break;
        }
      }
    }

    if (!user) {
      user = { id: userId, name: 'AI Creator User', email: (req as any).user?.email || 'user@abtalks.com', role: 'user' };
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch current user' });
  }
};
