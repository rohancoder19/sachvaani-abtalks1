import React, { useState, useEffect, useCallback } from 'react';
import { Play, Activity, CheckCircle2, Database, Brain, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { StatusCard } from '../components/dashboard/StatusCard';
import { agentApi } from '../services/api.client';
import { useSocket } from '../context/SocketContext';

export const Dashboard: React.FC = () => {
  const { lastEvent } = useSocket();
  const [isInitializing, setIsInitializing] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [activeAgent, setActiveAgent] = useState<any>({
    agentId: localStorage.getItem('activeAgentId') || 'ada-ai-security',
    persona: { name: 'Ada', domain: 'AI Security' }
  });

  const loadData = useCallback(async () => {
    try {
      const currentAgentId = localStorage.getItem('activeAgentId') || activeAgent.agentId || 'ada-ai-security';
      const feedRes = await agentApi.getFeed(currentAgentId);
      if (feedRes.posts) setFeed(feedRes.posts || []);

      const topicsRes = await agentApi.getTopics();
      if (topicsRes.success) setTopics(topicsRes.data || []);

      const schedRes = await agentApi.getSchedulerLogs();
      if (schedRes.success) setSchedulerStatus(schedRes.scheduler);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    }
  }, [activeAgent.agentId]);

  useEffect(() => {
    loadData();
  }, [loadData, lastEvent]);

  const handleInitAgent = async () => {
    try {
      setIsInitializing(true);
      const res = await agentApi.initializeAgentWithPersona({
        name: 'Ada',
        domain: 'AI Security'
      });
      if (res?.agentId) {
        localStorage.setItem('activeAgentId', res.agentId);
        setActiveAgent((prev: any) => ({ ...prev, agentId: res.agentId }));
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  };

  const approvedTopicsCount = topics.filter((t) => t.status === 'APPROVED').length;
  const rejectedTopicsCount = topics.filter((t) => t.status === 'REJECTED').length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full min-w-0">
      {/* Hero Banner */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 relative overflow-hidden shadow-2xl w-full">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl min-w-0">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
              <span className="truncate">Autonomous AI Creator Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ABTalks — Sachvaani Autonomous AI
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
              An AI creator that thinks, selects, remembers, and publishes independently without human prompts.
            </p>
          </div>

          <button
            onClick={handleInitAgent}
            disabled={isInitializing}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-sm hover:brightness-110 transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center space-x-2.5 shrink-0 disabled:opacity-50 touch-target"
          >
            <Play className={`w-4 h-4 fill-white ${isInitializing ? 'animate-spin' : ''}`} />
            <span>{isInitializing ? 'Initializing Agent...' : 'Trigger Autonomous Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border/80 space-y-3 w-full">
        <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
          Autonomous Content Lifecycle Pipeline
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
            <div className="text-[10px] text-indigo-400 font-mono font-bold">1. DISCOVER</div>
            <div className="text-xs font-semibold text-white">Live RSS Feeds</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-1">
            <div className="text-[10px] text-purple-400 font-mono font-bold">2. JUDGE</div>
            <div className="text-xs font-semibold text-white">7-Metric Editorial</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
            <div className="text-[10px] text-amber-400 font-mono font-bold">3. REMEMBER</div>
            <div className="text-xs font-semibold text-white">Vector Cosine Check</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
            <div className="text-[10px] text-cyan-400 font-mono font-bold">4. CREATE</div>
            <div className="text-xs font-semibold text-white">Gemini Synthesis</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center col-span-2 sm:col-span-1 space-y-1">
            <div className="text-[10px] text-emerald-400 font-mono font-bold">5. PUBLISH</div>
            <div className="text-xs font-semibold text-white">Persistent Feed</div>
          </div>
        </div>
      </div>

      {/* Agent Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
        <StatusCard
          title="Agent Identity"
          value={activeAgent.persona.name}
          subtitle={`Domain: ${activeAgent.persona.domain}`}
          icon={ShieldCheck}
          color="indigo"
        />
        <StatusCard
          title="Autonomous Worker"
          value="ACTIVE"
          subtitle={schedulerStatus?.running ? "Running Background" : "Interval: Every 30 Min"}
          icon={Activity}
          color="emerald"
        />
        <StatusCard
          title="Topics Discovered"
          value={topics.length}
          subtitle={`${approvedTopicsCount} Approved / ${rejectedTopicsCount} Rejected`}
          icon={Database}
          color="cyan"
        />
        <StatusCard
          title="Published Feed"
          value={feed.length}
          subtitle="Memory Deduplicated"
          icon={Brain}
          color="amber"
        />
      </div>

      {/* Dashboard Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full min-w-0">
        {/* Live Published Feed */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Published Feed</span>
            </h3>
            <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 truncate max-w-[200px]">
              Agent: {activeAgent.agentId}
            </span>
          </div>

          <div className="space-y-4 w-full min-w-0">
            {feed.length === 0 ? (
              <div className="p-6 sm:p-10 rounded-2xl bg-surface border border-border/80 text-center space-y-3">
                <Database className="w-12 h-12 text-gray-500 mx-auto" />
                <p className="text-gray-300 font-semibold">Feed is currently empty</p>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Click "Trigger Autonomous Cycle" above or test <code className="text-indigo-300 font-mono">POST /api/v1/agent/init</code> to populate initial published posts.
                </p>
              </div>
            ) : (
              feed.map((post: any) => {
                const postId = post.id || post._id || `post_${Math.random()}`;
                const sourcesList = Array.isArray(post.sources) ? post.sources : [];

                return (
                  <div key={postId} className="p-4 sm:p-6 rounded-2xl bg-surface border border-border/80 space-y-4 hover:border-indigo-500/40 transition-all shadow-lg w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1.5 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          {post.agentId || activeAgent.agentId}
                        </span>
                        <span className="text-gray-400 font-mono text-[11px] truncate">ID: {postId}</span>
                      </div>
                      <span className="font-mono text-gray-400 text-[11px] shrink-0">{new Date(post.createdAt).toLocaleTimeString()} UTC</span>
                    </div>

                    <div className="text-sm text-gray-200 leading-relaxed space-y-2 break-words-anywhere">
                      {post.text?.split('\n').map((line: string, idx: number) => {
                        if (!line.trim()) return <div key={idx} className="h-1" />;
                        const isHeader = line.startsWith('**') || line.startsWith('🚀');
                        return (
                          <p key={idx} className={isHeader ? 'font-bold text-white text-base' : 'text-gray-300 text-sm'}>
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      })}
                    </div>

                    {/* Editorial Rationale Box */}
                    {post.rationale && (
                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#080C14] border border-indigo-500/20 space-y-1 break-words-anywhere">
                        <div className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                          Editorial Selection Rationale:
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{post.rationale}</p>
                      </div>
                    )}

                    {/* Sources Footnote */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400 pt-2 border-t border-border/60">
                      <span className="font-mono text-[11px] text-gray-500">Source Verification:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {sourcesList.length === 0 ? (
                          <span className="text-xs text-gray-500 italic">Source unavailable</span>
                        ) : (
                          sourcesList.map((src: any, sIdx: number) => {
                            const urlStr = typeof src === 'string' ? src : src?.url;
                            if (!urlStr) {
                              return (
                                <span key={sIdx} className="text-xs text-gray-500 italic">
                                  Source unavailable
                                </span>
                              );
                            }
                            return (
                              <a
                                key={sIdx}
                                href={urlStr}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline font-mono text-xs flex items-center gap-1 max-w-[180px] truncate"
                              >
                                <span className="truncate">Link</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar: Editorial Stream & Discovered Candidates */}
        <div className="space-y-6 min-w-0">
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border/80 space-y-4 w-full">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Discovered Topic Candidates</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {topics.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No topics evaluated yet</p>
              ) : (
                topics.map((t: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#090D16] border border-border/60 space-y-2 text-xs w-full min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-400 font-mono text-[10px] truncate max-w-[120px]">{t.source || 'RSS Feed'}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                        t.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {t.status || 'EVALUATED'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white leading-tight break-words-anywhere">{t.title}</h4>
                    {t.rejectionReason && (
                      <div className="text-[11px] text-rose-300/80 bg-rose-500/10 p-2 rounded border border-rose-500/20 break-words-anywhere">
                        {t.rejectionReason}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
                      <span>Score:</span>
                      <span className="text-amber-400 font-bold">{t.score?.overall || 8.5}/10</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

