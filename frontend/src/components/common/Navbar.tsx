import React from 'react';
import { Bot, Activity, LogOut, Menu, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuthStore } from '../../store/useAuthStore';

interface NavbarProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { isConnected } = useSocket();
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-border/60 bg-[#0B1120]/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 w-full min-w-0">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="lg:hidden p-2 rounded-xl bg-surface/80 text-gray-300 hover:text-white hover:bg-slate-800 border border-border/60 transition-colors touch-target flex items-center justify-center shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
          <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
            <span className="truncate">ABTalks AI</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20 shrink-0">
              v1.0.0
            </span>
          </h1>
          <p className="text-[11px] text-gray-400 hidden sm:block truncate">Self-Directing Multi-Agent Content Engine</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border/80 text-[11px] sm:text-xs">
          <Activity className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-spin' : 'text-amber-400'}`} />
          <span className="text-gray-300 font-medium hidden xs:inline">Socket:</span>
          <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {isConnected ? 'LIVE' : 'POLL'}
          </span>
        </div>

        {user && (
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-border/60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{user.name}</div>
                <div className="text-[10px] text-gray-400 font-mono truncate max-w-[110px]">{user.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors touch-target flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

