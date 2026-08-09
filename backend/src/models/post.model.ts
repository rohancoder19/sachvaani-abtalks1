import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  agentId: string;
  personaId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  topicTitle?: string;
  text: string;
  rationale: string;
  sources: Array<{ title?: string; url: string }>;
  tags: string[];
  metrics: {
    views: number;
    shares: number;
    likes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    agentId: { type: String, required: true, index: true },
    personaId: { type: Schema.Types.Mixed, ref: 'Persona', index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    topicTitle: { type: String },
    text: { type: String, required: true },
    rationale: { type: String, required: true },
    sources: [
      {
        title: { type: String },
        url: { type: String, required: true }
      }
    ],
    tags: [{ type: String }],
    metrics: {
      views: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      likes: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

PostSchema.index({ agentId: 1, createdAt: -1 });

export const PostModel = mongoose.model<IPost>('Post', PostSchema);

