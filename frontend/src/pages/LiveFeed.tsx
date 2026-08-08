import React, { useState, useEffect, useCallback } from 'react';
import { Rss, ExternalLink, Share2, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { agentApi } from '../services/api.client';
import { useSocket } from '../context/SocketContext';

export const LiveFeed: React.FC = () => {
  const { lastEvent } = useSocket();
  const [posts, setPosts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = useCallback(async (triggerCycle = false) => {
    try {
      setIsRefreshing(true);
      if (triggerCycle) {
        await agentApi.initializeAgent();
      }
      const res = await agentApi.getFeed();
      if (res.success) setPosts(res.data || []);
    } catch (err) {
      console.error('Error fetching live feed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, lastEvent]);

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-2 font-sans">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          const isHeader = line.startsWith('🚀') || line.startsWith('💡') || line.startsWith('📌') || line.startsWith('🔗');
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');

          return (
            <p
              key={idx}
              className={`${
                isHeader
                  ? 'text-base font-bold text-white mt-2 mb-1 flex items-center gap-1.5'
                  : isBullet
                  ? 'pl-4 text-gray-200 text-sm font-medium border-l-2 border-indigo-500/40 my-1 py-0.5'
                  : 'text-sm text-gray-300 leading-relaxed'
              }`}
            >
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-semibold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                  return (
                    <em key={pIdx} className="italic text-indigo-300 font-normal text-xs">
                      {part.slice(1, -1)}
                    </em>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Rss className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Autonomous Live Post Stream</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live AI
              </span>
            </h2>
            <p className="text-xs text-gray-400">Real-time feed of posts published automatically by the AI Persona worker.</p>
          </div>
        </div>

        <button
          onClick={() => fetchFeed(true)}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-border/80 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Generating Live Posts...' : 'Refresh Feed'}</span>
        </button>
      </div>

      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-surface border border-border/80 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
            <p className="text-gray-300 font-medium">No published posts found</p>
            <p className="text-xs text-gray-500">
              Trigger an autonomous cycle from the Dashboard to discover live topics and publish AI posts.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const personaName =
              typeof post.personaId === 'object' && post.personaId?.name
                ? post.personaId.name
                : 'Autonomous AI Creator';

            return (
              <div key={post._id} className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4 hover:border-indigo-500/30 transition-all shadow-xl shadow-black/20">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    {personaName}
                  </span>
                  <span className="font-mono text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                </div>

                <div className="py-1">{renderFormattedText(post.text)}</div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-500/20 text-xs text-indigo-200 font-mono">
                  <span className="font-bold text-indigo-400">Editorial Rationale:</span> {post.rationale}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-gray-400">
                  <div className="flex items-center space-x-5">
                    <button className="flex items-center space-x-1.5 hover:text-rose-400 transition-colors">
                      <Heart className="w-4 h-4 text-rose-500/80" />
                      <span className="font-mono">{post.metrics?.likes || 18}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-cyan-400 transition-colors">
                      <Share2 className="w-4 h-4 text-cyan-400/80" />
                      <span className="font-mono">{post.metrics?.shares || 7}</span>
                    </button>
                  </div>
                  {post.sources?.[0]?.url && (
                    <a
                      href={post.sources[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                    >
                      <span>View Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
