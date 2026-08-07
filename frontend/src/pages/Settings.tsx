import React from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-6 h-6 text-gray-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Platform Settings & Configurations</h2>
          <p className="text-xs text-gray-400">Manage LLM keys, Redis limits, and BullMQ worker intervals.</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" />
          AI Models & Provider Keys
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-mono">OPENAI_API_KEY</label>
            <input type="password" value="••••••••••••••••••••••••••••" readOnly className="w-full px-4 py-2 rounded-xl bg-background border border-border/80 text-sm text-gray-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-mono">GEMINI_API_KEY</label>
            <input type="password" value="••••••••••••••••••••••••••••" readOnly className="w-full px-4 py-2 rounded-xl bg-background border border-border/80 text-sm text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
