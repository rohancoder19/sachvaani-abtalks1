import React, { useState, useEffect } from 'react';
import { Rss, ExternalLink, MessageSquare, Share2, Heart } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const LiveFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    agentApi.getFeed().then((res) => {
      if (res.success) setPosts(res.data || []);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-3">
        <Rss className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Autonomous Live Post Stream</h2>
          <p className="text-xs text-gray-400">Real-time feed of posts published automatically by the AI Persona worker.</p>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                {post.personaId?.name || 'Autonomous AI Persona'}
              </span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>

            <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{post.text}</p>

            <div className="p-3 rounded-xl bg-background border border-border/60 text-xs text-indigo-300 font-mono">
              <span className="font-bold">Editorial Rationale:</span> {post.rationale}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 hover:text-white"><Heart className="w-4 h-4" /> <span>{post.metrics?.likes || 12}</span></button>
                <button className="flex items-center space-x-1 hover:text-white"><Share2 className="w-4 h-4" /> <span>{post.metrics?.shares || 4}</span></button>
              </div>
              {post.sources?.[0]?.url && (
                <a href={post.sources[0].url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-cyan-400 hover:underline">
                  <span>View Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
