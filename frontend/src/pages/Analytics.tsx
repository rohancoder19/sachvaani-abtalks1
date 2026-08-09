import React from 'react';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockAnalyticsData = [
  { time: '00:00', score: 8.2, posts: 1 },
  { time: '04:00', score: 8.5, posts: 2 },
  { time: '08:00', score: 8.9, posts: 4 },
  { time: '12:00', score: 9.1, posts: 6 },
  { time: '16:00', score: 8.7, posts: 7 },
  { time: '20:00', score: 9.3, posts: 9 }
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <div className="flex items-center space-x-3 min-w-0">
        <BarChart3 className="w-6 h-6 text-indigo-400 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">System Analytics & Performance Charts</h2>
          <p className="text-xs text-gray-400 leading-relaxed">Editorial quality score trajectories and autonomous publishing velocity.</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border/80 space-y-4 w-full min-w-0">
        <h3 className="text-sm font-bold text-white">Average Editorial Quality Score Over Time</h3>
        <div className="h-64 sm:h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockAnalyticsData}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} />
              <YAxis domain={[7, 10]} stroke="#9CA3AF" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#6366F1" fillOpacity={1} fill="url(#scoreColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

