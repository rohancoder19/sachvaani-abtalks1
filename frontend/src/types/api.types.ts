export interface IPersona {
  _id: string;
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
  createdAt: string;
}

export interface ITopic {
  _id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  score: {
    novelty: number;
    importance: number;
    trend: number;
    technicalDepth: number;
    audienceInterest: number;
    credibility: number;
    freshness: number;
    overall: number;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  rejectionReason?: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  personaId?: IPersona;
  topicId?: ITopic;
  text: string;
  rationale: string;
  sources: Array<{ title: string; url: string }>;
  tags: string[];
  metrics: {
    views: number;
    shares: number;
    likes: number;
  };
  createdAt: string;
}

export interface ISchedulerStatus {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'FAILED';
  cronExpression: string;
  intervalMinutes: number;
  lastRunAt?: string;
  nextRunAt?: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
}

export interface ILog {
  _id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  createdAt: string;
}
