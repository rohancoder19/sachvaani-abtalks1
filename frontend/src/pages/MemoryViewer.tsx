import React, { useState, useEffect } from 'react';
import { BrainCircuit, Cpu, Hash } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const MemoryViewer: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    agentApi.getMemory().then((res) => {
      if (res.success) setMemories(res.data || []);
    });
  }, []);

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <div className="flex items-center space-x-3 min-w-0">
        <BrainCircuit className="w-6 h-6 text-amber-400 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">Persona Long-Term Vector Memory</h2>
          <p className="text-xs text-gray-400 leading-relaxed">1536-dimensional embeddings stored in MongoDB for semantic similarity lookup & deduplication.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        {memories.map((mem, idx) => (
          <div key={mem._id || idx} className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 space-y-3 w-full min-w-0">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono gap-2">
              <span className="truncate">Embedding Vector #{idx + 1}</span>
              <span className="text-emerald-400 shrink-0">1536 Dims</span>
            </div>
            <p className="text-xs text-gray-200 break-words-anywhere">{mem.summary || 'Dense embedding stored for topic deduplication.'}</p>
            <div className="p-2.5 rounded-lg bg-background border border-border/60 font-mono text-[10px] text-indigo-300 truncate w-full">
              [ {mem.embeddings?.slice(0, 8).map((n: number) => n.toFixed(4)).join(', ')} ... ]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

