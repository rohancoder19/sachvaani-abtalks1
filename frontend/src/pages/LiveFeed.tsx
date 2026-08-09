import React, { useState, useEffect, useCallback } from 'react';
import { Rss, ExternalLink, Share2, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { agentApi } from '../services/api.client';
import { useSocket } from '../context/SocketContext';

export const LiveFeed: React.FC = () => {
  const { lastEvent } = useSocket();
  const [posts, setPosts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const searchParams = new URLSearchParams(window.location.search);
      const targetAgentId = searchParams.get('agentId') || 'ada-ai-security';
      const res = await agentApi.getFeed(targetAgentId);
      if (res.posts) {
        setPosts(res.posts || []);
      } else if (res.success && res.data) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching live feed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);


  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, lastEvent]);

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Rss className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Autonomous Published Feed</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                GET /api/agent/feed
              </span>
            </h2>
            <p className="text-xs text-gray-400">Real-time feed of posts published automatically by Ada (AI Security).</p>
          </div>
        </div>

        <button
          onClick={() => fetchFeed()}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-border/80 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-surface border border-border/80 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
            <p className="text-gray-300 font-medium">No published posts found in feed</p>
            <p className="text-xs text-gray-500">
              Run <code className="text-indigo-300 font-mono">POST /api/agent/init</code> to trigger background topic discovery and post generation.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const postId = post.id || post._id;
            const createdAtStr = post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString();
            const sourcesList = Array.isArray(post.sources) ? post.sources : [];

            return (
              <div key={postId} className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4 hover:border-indigo-500/30 transition-all shadow-xl shadow-black/20">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Ada — AI Systems & Technology Intelligence
                    </span>
                    <span className="font-mono text-gray-500 text-[11px]">ID: {postId}</span>
                  </div>
                  <span className="font-mono text-gray-400">{createdAtStr}</span>
                </div>

                <div className="text-sm text-gray-200 leading-relaxed font-sans space-y-2">
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

                <div className="p-4 rounded-xl bg-[#080C14] border border-indigo-500/20 text-xs space-y-1">
                  <span className="font-bold text-indigo-400 font-mono text-[11px] uppercase tracking-wider block">
                    Editorial Selection & Quality Rationale:
                  </span>
                  <p className="text-gray-300 leading-relaxed text-xs">{post.rationale}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5 text-gray-400">
                      <Heart className="w-4 h-4 text-rose-500/80" />
                      <span className="font-mono">{post.metrics?.likes || 24}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-gray-400">
                      <Share2 className="w-4 h-4 text-cyan-400/80" />
                      <span className="font-mono">{post.metrics?.shares || 8}</span>
                    </span>
                  </div>

                  {sourcesList.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-gray-500">Sources:</span>
                      {sourcesList.map((src: any, sIdx: number) => {
                        const urlStr = typeof src === 'string' ? src : (src.url || 'https://techcrunch.com');
                        return (
                          <a
                            key={sIdx}
                            href={urlStr}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-xs"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
