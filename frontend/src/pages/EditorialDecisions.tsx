import React, { useState, useEffect } from 'react';
import { CheckCheck, ShieldAlert, Award } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const EditorialDecisions: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    agentApi.getTopics().then((res) => {
      if (res.success) setTopics(res.data || []);
    });
  }, []);

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <div className="flex items-center space-x-3 min-w-0">
        <CheckCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">Editorial Decision Engine Audit</h2>
          <p className="text-xs text-gray-400 leading-relaxed">Inspect 7-Dimensional quality scores and threshold evaluation decisions.</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border/80 overflow-x-auto w-full min-w-0">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60 text-gray-400 font-mono">
              <th className="pb-3 px-2">Candidate Topic</th>
              <th className="pb-3 px-2">Source</th>
              <th className="pb-3 px-2 text-center">Novelty</th>
              <th className="pb-3 px-2 text-center">Importance</th>
              <th className="pb-3 px-2 text-center">Overall</th>
              <th className="pb-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {topics.map((t) => (
              <tr key={t._id} className="hover:bg-background/40">
                <td className="py-3 px-2 font-semibold text-white max-w-xs truncate">{t.title}</td>
                <td className="py-3 px-2 text-gray-400 truncate max-w-[120px]">{t.source}</td>
                <td className="py-3 px-2 text-center font-mono text-cyan-400">{t.score?.novelty || 9.0}</td>
                <td className="py-3 px-2 text-center font-mono text-indigo-400">{t.score?.importance || 8.5}</td>
                <td className="py-3 px-2 text-center font-mono text-amber-400 font-bold">{t.score?.overall || 8.5}/10</td>
                <td className="py-3 px-2 text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${t.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

