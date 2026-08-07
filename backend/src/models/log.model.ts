import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: 'BACKEND' | 'AI_SERVICE' | 'SCHEDULER' | 'QUEUE';
  details?: Record<string, any>;
  createdAt: Date;
}

const LogSchema: Schema = new Schema(
  {
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
    message: { type: String, required: true },
    source: { type: String, enum: ['BACKEND', 'AI_SERVICE', 'SCHEDULER', 'QUEUE'], default: 'BACKEND' },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const LogModel = mongoose.model<ILog>('Log', LogSchema);
