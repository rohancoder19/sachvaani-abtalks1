import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  Rss,
  UserCheck,
  Compass,
  Menu
} from 'lucide-react';

interface MobileNavProps {
  onOpenMenu: () => void;
}

const mobileItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Feed', path: '/feed', icon: Rss },
  { name: 'Evaluator', path: '/evaluator', icon: Terminal },
  { name: 'Persona', path: '/persona', icon: UserCheck },
  { name: 'Discovery', path: '/discovery', icon: Compass }
];

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMenu }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-t border-border/60 px-1 py-1.5 flex items-center justify-around shadow-2xl"
    >
      {mobileItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[52px] min-h-[44px] px-1 py-1 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-indigo-400 bg-indigo-500/15 font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[56px]">{item.name}</span>
          </NavLink>
        );
      })}

      <button
        onClick={onOpenMenu}
        aria-label="Open Full Navigation Menu"
        className="flex flex-col items-center justify-center min-w-[52px] min-h-[44px] px-1 py-1 rounded-xl text-[10px] font-medium text-gray-400 hover:text-gray-200 transition-all"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
