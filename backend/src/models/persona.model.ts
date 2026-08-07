import mongoose, { Schema, Document } from 'mongoose';

export interface IPersona extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  domain: string;
  voiceStyle: string;
  targetAudience: string;
  stylePreferences: {
    tone: string;
    format: string;
    emojiUsage: 'none' | 'minimal' | 'frequent';
    maxPostLength: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PersonaSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, default: 'Artificial Intelligence & Emerging Tech' },
    voiceStyle: { type: String, required: true, default: 'Authoritative, insightful, engaging' },
    targetAudience: { type: String, required: true, default: 'Developers, Tech Enthusiasts, Founders' },
    stylePreferences: {
      tone: { type: String, default: 'Professional yet conversational' },
      format: { type: String, default: 'Structured post with bullet points & summary' },
      emojiUsage: { type: String, enum: ['none', 'minimal', 'frequent'], default: 'minimal' },
      maxPostLength: { type: Number, default: 500 }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const PersonaModel = mongoose.model<IPersona>('Persona', PersonaSchema);
