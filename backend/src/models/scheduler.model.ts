import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduler extends Document {
  personaId: mongoose.Types.ObjectId;
  cronExpression: string;
  intervalMinutes: number;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'FAILED';
  lastRunAt?: Date;
  nextRunAt?: Date;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  createdAt: Date;
  updatedAt: Date;
}

const SchedulerSchema: Schema = new Schema(
  {
    personaId: { type: Schema.Types.ObjectId, ref: 'Persona', required: true, unique: true },
    cronExpression: { type: String, default: '*/30 * * * *' },
    intervalMinutes: { type: Number, default: 30 },
    status: { type: String, enum: ['IDLE', 'RUNNING', 'PAUSED', 'FAILED'], default: 'IDLE' },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date },
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const SchedulerModel = mongoose.model<IScheduler>('Scheduler', SchedulerSchema);
