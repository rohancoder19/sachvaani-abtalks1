import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'cyan';
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  };

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border/80 hover:border-indigo-500/40 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};
