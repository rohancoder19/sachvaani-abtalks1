import mongoose, { Schema, Document } from 'mongoose';

export interface ISource extends Document {
  name: string;
  type: 'RSS' | 'API' | 'SCRAPER';
  url: string;
  category: string;
  isReliable: boolean;
  credibilityScore: number;
  lastFetchedAt?: Date;
  createdAt: Date;
}

const SourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['RSS', 'API', 'SCRAPER'], required: true },
    url: { type: String, required: true },
    category: { type: String, default: 'AI News' },
    isReliable: { type: Boolean, default: true },
    credibilityScore: { type: Number, default: 8.5 },
    lastFetchedAt: { type: Date }
  },
  { timestamps: true }
);

export const SourceModel = mongoose.model<ISource>('Source', SourceSchema);
