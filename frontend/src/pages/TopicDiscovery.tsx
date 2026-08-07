import React, { useState, useEffect } from 'react';
import { Compass, Globe, Filter } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const TopicDiscovery: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    agentApi.getTopics().then((res) => {
      if (res.success) setTopics(res.data || []);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Compass className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Live Multi-Source Topic Discovery</h2>
            <p className="text-xs text-gray-400">Aggregates AI news from RSS feeds, Hacker News, arXiv, GitHub Trending, & Tech Blogs.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((t) => (
          <div key={t._id} className="p-5 rounded-2xl bg-surface border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-surface text-cyan-400 font-mono border border-border">{t.source}</span>
              <span className="text-amber-400 font-bold font-mono">Score: {t.score?.overall || 8.5}/10</span>
            </div>
            <h3 className="text-sm font-bold text-white line-clamp-2">{t.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-3">{t.summary}</p>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {t.status}
              </span>
              <a href={t.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Link</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
