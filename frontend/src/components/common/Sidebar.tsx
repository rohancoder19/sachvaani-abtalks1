import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Rss,
  Compass,
  CheckCheck,
  BrainCircuit,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Persona Profile', path: '/persona', icon: UserCheck },
  { name: 'Live Feed', path: '/feed', icon: Rss },
  { name: 'Topic Discovery', path: '/discovery', icon: Compass },
  { name: 'Editorial Decisions', path: '/editorial', icon: CheckCheck },
  { name: 'Memory Viewer', path: '/memory', icon: BrainCircuit },
  { name: 'Scheduler Logs', path: '/scheduler', icon: Clock },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-border/60 bg-[#0B1120] p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
          Navigation Architecture
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-xs space-y-2">
        <div className="flex items-center justify-between text-indigo-300 font-semibold">
          <span>Scheduler Loop</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[10px]">30 MIN</span>
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Autonomous BullMQ worker discovers, filters, & publishes AI news without human prompts.
        </p>
      </div>
    </aside>
  );
};
