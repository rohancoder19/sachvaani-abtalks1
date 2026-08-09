import React, { useState, useEffect, useCallback } from 'react';
import { Rss, ExternalLink, Share2, Heart, Sparkles, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { agentApi } from '../services/api.client';
import { useSocket } from '../context/SocketContext';
import { Post } from '../types/agent';

export const LiveFeed: React.FC = () => {
  const { lastEvent } = useSocket();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string>('');

  const getTargetAgentId = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramId = searchParams.get('agentId');
    const storedId = localStorage.getItem('activeAgentId');
    return paramId || storedId || 'ada-ai-security';
  }, []);

  const fetchFeed = useCallback(async () => {
    const agentId = getTargetAgentId();
    setActiveAgentId(agentId);
    setErrorMsg(null);
    setIsRefreshing(true);

    console.log('[LiveFeed] agentId:', agentId);
    console.log('[LiveFeed] API URL:', `/api/v1/agent/feed?agentId=${agentId}`);

    try {
      const res = await agentApi.getFeed(agentId);
      console.log('[LiveFeed] response:', res);
      console.log('[LiveFeed] posts count:', res.posts?.length || 0);

      setPosts(res.posts || []);
    } catch (err: any) {
      console.error('[LiveFeed] error fetching live feed:', err);
      const message = err.response?.data?.error || err.message || 'Failed to fetch live feed';
      setErrorMsg(message);
    } finally {
      setIsRefreshing(false);
    }
  }, [getTargetAgentId]);

  const handleRunAutonomousCycle = async () => {
    try {
      setIsInitializing(true);
      setErrorMsg(null);
      const res = await agentApi.initializeAgentWithPersona({
        name: 'Ada',
        domain: 'AI Security'
      });
      if (res?.agentId) {
        localStorage.setItem('activeAgentId', res.agentId);
        setActiveAgentId(res.agentId);
      }
      await fetchFeed();
    } catch (err: any) {
      console.error('[LiveFeed] Error running autonomous cycle:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to initialize agent');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (lastEvent) {
      console.log('[LiveFeed] Socket event received:', lastEvent);
      if (!lastEvent.agentId || lastEvent.agentId === activeAgentId) {
        fetchFeed();
      }
    }
  }, [lastEvent, activeAgentId, fetchFeed]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full min-w-0 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Rss className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
              <span>Autonomous Published Feed</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                GET /api/v1/agent/feed
              </span>
            </h2>
            <p className="text-xs text-gray-400 truncate">
              Real-time feed of posts published automatically by Agent: <code className="text-indigo-300 font-mono">{activeAgentId || 'ada-ai-security'}</code>
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchFeed()}
          disabled={isRefreshing}
          className="px-4 py-2.5 rounded-xl bg-surface hover:bg-slate-800 border border-border/80 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 touch-target w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">Error Loading Feed</p>
            <p className="text-rose-300 font-normal break-words-anywhere">{errorMsg}</p>
          </div>
        </div>
      )}

      {isInitializing && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-indigo-400" />
          <div className="min-w-0">
            <p className="font-bold">Agent initialized — generating your first autonomous post...</p>
            <p className="text-gray-400 font-normal">Topic discovery, editorial scoring, and LLM synthesis in progress.</p>
          </div>
        </div>
      )}

      <div className="space-y-5 w-full min-w-0">
        {!isRefreshing && posts.length === 0 && !errorMsg ? (
          <div className="p-6 sm:p-10 rounded-2xl bg-surface border border-border/80 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-gray-200 font-semibold text-base">No autonomous posts yet.</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                The agent is discovering topics and generating its first publication.
              </p>
            </div>
            <button
              onClick={handleRunAutonomousCycle}
              disabled={isInitializing}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25 inline-flex items-center justify-center gap-2 disabled:opacity-50 touch-target"
            >
              {isInitializing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>Run Autonomous Cycle</span>
            </button>
          </div>
        ) : (
          posts.map((post) => {
            const postId = post.id || post._id || `post_${Math.random()}`;
            const createdAtStr = post.createdAt ? new Date(post.createdAt).toLocaleTimeString() + ' UTC' : new Date().toLocaleTimeString() + ' UTC';
            const sourcesList = Array.isArray(post.sources) ? post.sources : [];

            return (
              <div key={postId} className="p-4 sm:p-6 rounded-2xl bg-surface border border-border/80 space-y-4 hover:border-indigo-500/30 transition-all shadow-xl shadow-black/20 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400 font-mono">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {post.agentId || activeAgentId || 'Autonomous Persona'}
                    </span>
                    <span className="font-mono text-gray-500 text-[11px] truncate">ID: {postId}</span>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px] shrink-0">{createdAtStr}</span>
                </div>

                <div className="text-sm text-gray-200 leading-relaxed font-sans space-y-2 break-words-anywhere">
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

                {post.rationale && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#080C14] border border-indigo-500/20 text-xs space-y-1 break-words-anywhere">
                    <span className="font-bold text-indigo-400 font-mono text-[11px] uppercase tracking-wider block">
                      Editorial Selection & Quality Rationale:
                    </span>
                    <p className="text-gray-300 leading-relaxed text-xs">{post.rationale}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs text-gray-400">
                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="flex items-center space-x-1.5 text-gray-400">
                      <Heart className="w-4 h-4 text-rose-500/80" />
                      <span className="font-mono">{post.metrics?.likes ?? 0}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-gray-400">
                      <Share2 className="w-4 h-4 text-cyan-400/80" />
                      <span className="font-mono">{post.metrics?.shares ?? 0}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono text-gray-500 shrink-0">Sources:</span>
                    {sourcesList.length === 0 ? (
                      <span className="text-xs text-gray-500 italic">Source unavailable</span>
                    ) : (
                      sourcesList.map((src: any, sIdx: number) => {
                        const urlStr = typeof src === 'string' ? src : src?.url;
                        const titleStr = typeof src === 'object' && src?.title ? src.title : 'Link';

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
                            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-xs max-w-[180px] truncate"
                          >
                            <span className="truncate">{titleStr}</span>
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
  );
};

