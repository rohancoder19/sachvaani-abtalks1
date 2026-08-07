import React from 'react';
import { Bot, Bell, Activity, LogOut, User as UserIcon } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { isConnected } = useSocket();
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-border/60 bg-[#0B1120]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            Autonomous AI Creator
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
              v1.0.0 Enterprise
            </span>
          </h1>
          <p className="text-xs text-gray-400">Self-Directing Multi-Agent Content Engine</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface border border-border/80 text-xs">
          <Activity className={`w-4 h-4 ${isConnected ? 'text-emerald-400 animate-spin' : 'text-amber-400'}`} />
          <span className="text-gray-300 font-medium">Socket.IO:</span>
          <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {isConnected ? 'LIVE' : 'POLLING'}
          </span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-border/60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">{user.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
