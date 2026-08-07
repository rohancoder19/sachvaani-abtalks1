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
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BrainCircuit className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Persona Long-Term Vector Memory</h2>
          <p className="text-xs text-gray-400">1536-dimensional embeddings stored in MongoDB for semantic similarity lookup & deduplication.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {memories.map((mem, idx) => (
          <div key={mem._id || idx} className="p-5 rounded-2xl bg-surface border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Embedding Vector ID #{idx + 1}</span>
              <span className="text-emerald-400">1536 Dimensions</span>
            </div>
            <p className="text-xs text-gray-200">{mem.summary || 'Dense embedding stored for topic deduplication.'}</p>
            <div className="p-2 rounded-lg bg-background border border-border/60 font-mono text-[10px] text-indigo-300 truncate">
              [ {mem.embeddings?.slice(0, 8).map((n: number) => n.toFixed(4)).join(', ')} ... ]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
