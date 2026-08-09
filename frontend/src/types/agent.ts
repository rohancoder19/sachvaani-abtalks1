export interface PostSource {
  title?: string;
  url: string;
}

export interface PostMetrics {
  views: number;
  shares: number;
  likes: number;
}

export interface Post {
  id: string;
  _id?: string;
  agentId?: string;
  topicId?: string;
  topicTitle?: string;
  text: string;
  rationale: string;
  sources: Array<string | PostSource>;
  tags?: string[];
  metrics?: PostMetrics;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedResponse {
  posts: Post[];
  success?: boolean;
  error?: string;
}

export interface InitAgentResponse {
  agentId: string;
  success?: boolean;
  error?: string;
}

export interface Topic {
  _id?: string;
  agentId: string;
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  urlHash?: string;
  score?: {
    overall?: number;
    [key: string]: any;
  };
  status: 'DISCOVERED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  rejectionReason?: string;
  createdAt?: string;
}

export interface Persona {
  name: string;
  domain: string;
  voiceStyle?: string;
  targetAudience?: string;
  stylePreferences?: {
    tone?: string;
    format?: string;
    emojiUsage?: string;
    maxPostLength?: number;
  };
}
