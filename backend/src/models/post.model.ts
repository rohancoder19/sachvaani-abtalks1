import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  personaId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  text: string;
  rationale: string;
  sources: Array<{ title: string; url: string }>;
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
    personaId: { type: Schema.Types.ObjectId, ref: 'Persona', required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    text: { type: String, required: true },
    rationale: { type: String, required: true },
    sources: [
      {
        title: { type: String, required: true },
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

export const PostModel = mongoose.model<IPost>('Post', PostSchema);
