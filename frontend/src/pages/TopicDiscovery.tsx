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
    <div className="space-y-6 w-full min-w-0 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
              <span>Live Multi-Source Topic Discovery</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {topics.length} Candidates
              </span>
            </h2>
            <p className="text-xs text-gray-400 truncate">Aggregates AI news from RSS feeds, Hacker News, MIT Tech Review, & Tech Blogs.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => fetchTopics(true)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-surface border border-border/80 text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition-all touch-target grow sm:grow-0"
          >
            <Compass className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching Live Feeds...' : 'Refresh Feed'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-surface border border-border/80 px-3 py-2 rounded-xl grow sm:grow-0">
            <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'recent')}
              className="bg-transparent text-xs text-white focus:outline-none font-mono cursor-pointer w-full"
            >
              <option value="recent" className="bg-[#090D16]">Most Recent (Latest)</option>
              <option value="score" className="bg-[#090D16]">Highest Score (Best)</option>
            </select>
          </div>
        </div>
      </div>

      {sortedTopics.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-surface border border-border/80 text-center space-y-4 w-full">
          <Globe className="w-12 h-12 text-cyan-400/60 mx-auto animate-pulse" />
          <div>
            <p className="text-gray-200 font-bold text-base">No Discovered Topics Found Yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Go to the Dashboard and click <strong className="text-white">Initialize Persona Worker</strong> to trigger live RSS topic crawling & editorial scoring.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
          {sortedTopics.map((t) => (
            <div key={t._id || t.title} className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 space-y-3 hover:border-cyan-500/30 transition-all shadow-lg shadow-black/20 w-full min-w-0 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-400 font-mono border border-cyan-500/20 text-[11px] truncate max-w-[140px]">
                    {t.source}
                  </span>
                  <span className="text-amber-400 font-bold font-mono text-xs shrink-0">Score: {t.score?.overall || 8.5}/10</span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-2 break-words-anywhere">{t.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed break-words-anywhere">{cleanSummary(t.summary)}</p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs gap-2 mt-auto">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${t.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {t.status}
                </span>
                <a href={t.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold flex items-center gap-1 shrink-0">
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

