import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, Save } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const PersonaProfile: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: 'Autonomous AI Creator',
    domain: 'Artificial Intelligence & Technology',
    voiceStyle: 'Authoritative, insightful, engaging',
    targetAudience: 'Software Engineers, Founders, AI Enthusiasts',
    tone: 'Professional yet conversational',
    format: 'Structured post with bullet points & summary',
    emojiUsage: 'minimal' as const,
    maxPostLength: 500
  });

  useEffect(() => {
    agentApi.getPersonas().then((res) => {
      if (res.success && res.data.length > 0) {
        const active = res.data.find((p: any) => p.isActive) || res.data[0];
        setFormData({
          name: active.name || 'Autonomous AI Creator',
          domain: active.domain || 'Artificial Intelligence & Technology',
          voiceStyle: active.voiceStyle || 'Authoritative, insightful, engaging',
          targetAudience: active.targetAudience || 'Software Engineers, Founders, AI Enthusiasts',
          tone: active.stylePreferences?.tone || 'Professional yet conversational',
          format: active.stylePreferences?.format || 'Structured post with bullet points & summary',
          emojiUsage: active.stylePreferences?.emojiUsage || 'minimal',
          maxPostLength: active.stylePreferences?.maxPostLength || 500
        });
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMsg('');
      const res = await agentApi.createPersona(formData);
      if (res.success) {
        setSuccessMsg('Persona updated successfully! New AI stories will use these settings.');
      }
    } catch (err: any) {
      console.error('Error saving persona:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-3">
        <UserCheck className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Persona Profile Manager</h2>
          <p className="text-xs text-gray-400">Configure target voice, domain specialization, and formatting directives for LLM post generation.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-surface border border-border/80 space-y-5">
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Persona Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Domain Focus</label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Voice Style</label>
            <input
              type="text"
              value={formData.voiceStyle}
              onChange={(e) => setFormData({ ...formData, voiceStyle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Target Audience</label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Persona Settings'}</span>
        </button>
      </form>
    </div>
  );
};
