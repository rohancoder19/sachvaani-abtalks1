import React, { useState, useEffect } from 'react';
import { Play, Activity, Clock, CheckCircle2, Database, Brain, Sparkles, ExternalLink } from 'lucide-react';
import { StatusCard } from '../components/dashboard/StatusCard';
import { agentApi } from '../services/api.client';
import { useSocket } from '../context/SocketContext';

export const Dashboard: React.FC = () => {
  const { lastEvent } = useSocket();
  const [isInitializing, setIsInitializing] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);

  const loadData = async () => {
    try {
      const feedRes = await agentApi.getFeed();
      if (feedRes.success) setFeed(feedRes.data || []);

      const topicsRes = await agentApi.getTopics();
      if (topicsRes.success) setTopics(topicsRes.data || []);

      const schedRes = await agentApi.getSchedulerLogs();
      if (schedRes.success) setSchedulerStatus(schedRes.scheduler);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [lastEvent]);

  const handleInitAgent = async () => {
    try {
      setIsInitializing(true);
      await agentApi.initializeAgent();
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-950 border border-indigo-500/20 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Intelligence Controller</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Autonomous AI Creator Engine</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Continuously crawls tech sources, scores editorial quality, checks vector memory, and publishes posts every 30 minutes without human prompts.
          </p>
        </div>
        <button
          onClick={handleInitAgent}
          disabled={isInitializing}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
          <span>{isInitializing ? 'Launching Pipeline...' : 'Initialize Persona Worker'}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatusCard
          title="AI Status"
          value={schedulerStatus?.status || 'IDLE'}
          subtitle="BullMQ Autonomous Cron"
          icon={Activity}
          color="indigo"
        />
        <StatusCard
          title="Scheduler Interval"
          value="30 Minutes"
          subtitle="Repeatable Task Loop"
          icon={Clock}
          color="cyan"
        />
        <StatusCard
          title="Posts Published"
          value={feed.length}
          subtitle="Saved to MongoDB"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatusCard
          title="Vector Memory"
          value="Active (1536-d)"
          subtitle="Cosine Deduplication"
          icon={Brain}
          color="amber"
        />
      </div>

      {/* Dashboard Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Latest Autonomous Posts
            </h3>
            <span className="text-xs text-gray-400 font-mono">Auto-refreshed via Socket.IO</span>
          </div>

          <div className="space-y-4">
            {feed.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface border border-border/80 text-center space-y-3">
                <Database className="w-10 h-10 text-gray-500 mx-auto" />
                <p className="text-gray-300 font-medium">No published posts yet</p>
                <p className="text-xs text-gray-500">
                  Click "Initialize Persona Worker" above to trigger the first autonomous topic crawl & post generation cycle.
                </p>
              </div>
            ) : (
              feed.map((post) => {
                const personaName =
                  typeof post.personaId === 'object' && post.personaId?.name
                    ? post.personaId.name
                    : 'Autonomous AI Creator';

                return (
                  <div key={post._id} className="p-5 rounded-2xl bg-surface border border-border/80 space-y-3 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        {personaName}
                      </span>
                      <span className="font-mono text-gray-400">{new Date(post.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-sm text-gray-200 leading-relaxed font-sans space-y-1.5">
                      {post.text?.split('\n').map((line: string, idx: number) => {
                        if (!line.trim()) return <div key={idx} className="h-1" />;
                        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                        const isHeader = line.startsWith('🚀') || line.startsWith('💡') || line.startsWith('📌');
                        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                        return (
                          <p
                            key={idx}
                            className={`${
                              isHeader
                                ? 'font-bold text-white mt-1.5'
                                : isBullet
                                ? 'pl-3 text-gray-300 text-xs font-medium border-l border-indigo-500/40'
                                : 'text-xs sm:text-sm text-gray-300'
                            }`}
                          >
                            {parts.map((part: string, pIdx: number) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
                              }
                              if (part.startsWith('*') && part.endsWith('*')) {
                                return <em key={pIdx} className="italic text-indigo-300 font-normal text-[11px]">{part.slice(1, -1)}</em>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-gray-400">
                      <span className="text-indigo-300 font-mono text-[11px] truncate max-w-md">
                        Rationale: {post.rationale}
                      </span>
                      {post.sources?.[0]?.url && (
                        <a
                          href={post.sources[0].url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-cyan-400 hover:underline shrink-0 font-medium"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Topic Candidate Queue */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Topic Candidates Queue
          </h3>

          <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-3">
            {topics.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Topic Queue Empty</p>
            ) : (
              topics.slice(0, 5).map((topic) => (
                <div key={topic._id || topic.title} className="p-3 rounded-xl bg-background border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-mono">{topic.source}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      topic.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {topic.status || 'EVALUATED'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-2">{topic.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>Overall Score:</span>
                    <span className="text-amber-400 font-bold">{topic.score?.overall || 8.5}/10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
