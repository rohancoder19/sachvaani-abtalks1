import mongoose, { Schema, Document } from 'mongoose';

export interface IMemory extends Document {
  personaId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  summary: string;
  keywords: string[];
  embeddings: number[]; // 1536-d vector embeddings
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema: Schema = new Schema(
  {
    personaId: { type: Schema.Types.ObjectId, ref: 'Persona', required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    summary: { type: String, required: true },
    keywords: [{ type: String, index: true }],
    embeddings: [{ type: Number, required: true }]
  },
  { timestamps: true }
);

export const MemoryModel = mongoose.model<IMemory>('Memory', MemorySchema);
