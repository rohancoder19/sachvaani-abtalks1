import React, { useState, useEffect } from 'react';
import { Compass, Globe, Filter } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const TopicDiscovery: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'recent'>('recent');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTopics = async (triggerCrawl = false) => {
    try {
      setIsLoading(true);
      const res = await agentApi.getTopics();
      if (res.success) setTopics(res.data || []);

      if (triggerCrawl) {
        agentApi.initializeAgent().then(() => {
          agentApi.getTopics().then((updated) => {
            if (updated.success) setTopics(updated.data || []);
          });
        }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const cleanSummary = (text?: string) => {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '').replace(/&[a-z0-9]+;/gi, ' ').trim();
  };

  const sortedTopics = [...topics].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    return (b.score?.overall || 0) - (a.score?.overall || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Live Multi-Source Topic Discovery</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {topics.length} Candidates
              </span>
            </h2>
            <p className="text-xs text-gray-400">Aggregates AI news from RSS feeds, Hacker News, MIT Tech Review, & Tech Blogs.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => fetchTopics(true)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-surface border border-border/80 text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Compass className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching Live Feeds...' : 'Refresh Feed'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'recent')}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border/80 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="recent">Most Recent (Latest News)</option>
              <option value="score">Highest Score (Best Quality)</option>
            </select>
          </div>
        </div>
      </div>

      {sortedTopics.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-border/80 text-center space-y-4">
          <Globe className="w-12 h-12 text-cyan-400/60 mx-auto animate-pulse" />
          <div>
            <p className="text-gray-200 font-bold text-base">No Discovered Topics Found Yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Go to the Dashboard and click <strong className="text-white">Initialize Persona Worker</strong> to trigger live RSS topic crawling & editorial scoring.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedTopics.map((t) => (
            <div key={t._id || t.title} className="p-5 rounded-2xl bg-surface border border-border/80 space-y-3 hover:border-cyan-500/30 transition-all shadow-lg shadow-black/20">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-400 font-mono border border-cyan-500/20 text-[11px]">
                  {t.source}
                </span>
                <span className="text-amber-400 font-bold font-mono text-xs">Score: {t.score?.overall || 8.5}/10</span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-2">{t.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{cleanSummary(t.summary)}</p>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {t.status}
                </span>
                <a href={t.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold flex items-center gap-1">
                  <span>Original Link</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
