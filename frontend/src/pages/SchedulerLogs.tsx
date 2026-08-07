import React, { useState, useEffect } from 'react';
import { Clock, Terminal, Activity } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const SchedulerLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);

  useEffect(() => {
    agentApi.getSchedulerLogs().then((res) => {
      if (res.success) {
        setLogs(res.logs || []);
        setSchedulerStatus(res.scheduler);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Clock className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-white">BullMQ & Redis Scheduler Logs</h2>
          <p className="text-xs text-gray-400">Execution trail of the 30-minute automated background cron worker.</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-surface border border-border/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 font-mono uppercase">Current Scheduler Status</span>
          <h3 className="text-lg font-bold text-white mt-0.5">{schedulerStatus?.status || 'IDLE'}</h3>
        </div>
        <div className="text-right text-xs font-mono text-gray-400 space-y-1">
          <div>Interval: <span className="text-indigo-400 font-bold">30 Minutes</span></div>
          <div>Total Executions: <span className="text-emerald-400 font-bold">{schedulerStatus?.totalRuns || 1}</span></div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#070A12] border border-border/80 font-mono text-xs text-gray-300 space-y-2 h-96 overflow-y-auto">
        <div className="flex items-center space-x-2 text-indigo-400 pb-2 border-b border-border/40">
          <Terminal className="w-4 h-4" />
          <span>BullMQ Worker System Terminal Output</span>
        </div>
        {logs.map((log) => (
          <div key={log._id} className="py-1 border-b border-border/20 flex space-x-3">
            <span className="text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
            <span className={`font-bold ${log.level === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>[{log.source}]</span>
            <span className="text-gray-200">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
