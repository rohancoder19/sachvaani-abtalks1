import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicScore {
  novelty: number;
  importance: number;
  trend: number;
  technicalDepth: number;
  audienceInterest: number;
  credibility: number;
  freshness: number;
  overall: number;
}

export interface ITopic extends Document {
  agentId: string;
  personaId?: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  source: string;
  url: string;
  urlHash: string;
  score: ITopicScore;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema = new Schema(
  {
    agentId: { type: String, required: true, index: true },
    personaId: { type: Schema.Types.Mixed, ref: 'Persona', index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    source: { type: String, required: true },
    url: { type: String, required: true },
    urlHash: { type: String, required: true, index: true },
    score: {
      novelty: { type: Number, default: 0 },
      importance: { type: Number, default: 0 },
      trend: { type: Number, default: 0 },
      technicalDepth: { type: Number, default: 0 },
      audienceInterest: { type: Number, default: 0 },
      credibility: { type: Number, default: 0 },
      freshness: { type: Number, default: 0 },
      overall: { type: Number, default: 0, index: true }
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'],
      default: 'PENDING',
      index: true
    },
    rejectionReason: { type: String }
  },
  { timestamps: true }
);

TopicSchema.index({ agentId: 1, urlHash: 1 }, { unique: true });

export const TopicModel = mongoose.model<ITopic>('Topic', TopicSchema);

