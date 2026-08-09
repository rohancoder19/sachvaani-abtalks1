import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  UserCheck,
  Rss,
  Compass,
  CheckCheck,
  BrainCircuit,
  Clock,
  BarChart3,
  Settings,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Evaluator API Panel', path: '/evaluator', icon: Terminal },
  { name: 'Live Feed', path: '/feed', icon: Rss },
  { name: 'Persona Profile', path: '/persona', icon: UserCheck },
  { name: 'Topic Discovery', path: '/discovery', icon: Compass },
  { name: 'Editorial Decisions', path: '/editorial', icon: CheckCheck },
  { name: 'Memory Viewer', path: '/memory', icon: BrainCircuit },
  { name: 'Scheduler Logs', path: '/scheduler', icon: Clock },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 space-y-6 overflow-y-auto">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
            Navigation Architecture
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 touch-target flex items-center justify-center"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-xs space-y-2 shrink-0">
        <div className="flex items-center justify-between text-indigo-300 font-semibold">
          <span>Autonomous Loop</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase">
            ACTIVE
          </span>
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Background worker continuously discovers, evaluates, & publishes AI news without human prompts.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border/60 bg-[#0B1120] flex-col shrink-0 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#0B1120] border-r border-border/60 shadow-2xl h-full flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

