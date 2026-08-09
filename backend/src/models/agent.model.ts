import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  agentId: string;
  persona: {
    name: string;
    domain: string;
    voiceStyle?: string;
  };
  status: 'active' | 'paused';
  lastRunAt?: Date;
  nextRunAt?: Date;
  totalCycles: number;
  initializedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema: Schema = new Schema(
  {
    agentId: { type: String, required: true, unique: true, index: true },
    persona: {
      name: { type: String, required: true, default: 'Ada' },
      domain: { type: String, required: true, default: 'AI Security' },
      voiceStyle: { type: String, default: 'Analytical, evidence-driven, developer-focused' }
    },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date },
    totalCycles: { type: Number, default: 0 },
    initializedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const AgentModel = mongoose.model<IAgent>('Agent', AgentSchema);
