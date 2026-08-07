import React, { useState, useEffect } from 'react';
import { Compass, Globe, Filter } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const TopicDiscovery: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'recent'>('score');

  useEffect(() => {
    agentApi.getTopics().then((res) => {
      if (res.success) setTopics(res.data || []);
    });
  }, []);

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
            <h2 className="text-xl font-bold text-white">Live Multi-Source Topic Discovery</h2>
            <p className="text-xs text-gray-400">Aggregates AI news from RSS feeds, Hacker News, MIT Tech Review, & Tech Blogs.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'recent')}
            className="px-3 py-1.5 rounded-xl bg-surface border border-border/80 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="score">Highest Score (Best Quality)</option>
            <option value="recent">Most Recent (Latest News)</option>
          </select>
        </div>
      </div>

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
            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{t.summary}</p>
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
    </div>
  );
};
