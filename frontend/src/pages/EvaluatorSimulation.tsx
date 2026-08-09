import React, { useState } from 'react';
import { Terminal, Play, RefreshCw, Copy, Check, Info } from 'lucide-react';
import { agentApi } from '../services/api.client';

export const EvaluatorSimulation: React.FC = () => {
  const [initName, setInitName] = useState('Ada');
  const [initDomain, setInitDomain] = useState('AI Security');
  const [initResult, setInitResult] = useState<any>(null);
  const [initLoading, setInitLoading] = useState(false);

  const [feedAgentId, setFeedAgentId] = useState('ada-ai-security');
  const [feedResult, setFeedResult] = useState<any>(null);
  const [feedLoading, setFeedLoading] = useState(false);

  const [copiedInit, setCopiedInit] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(false);

  const handleInit = async () => {
    setInitLoading(true);
    setInitResult(null);
    try {
      const res = await agentApi.initializeAgentWithPersona({
        name: initName,
        domain: initDomain
      });
      setInitResult(res);
      if (res?.agentId) {
        localStorage.setItem('activeAgentId', res.agentId);
        setFeedAgentId(res.agentId);
      }
    } catch (err: any) {
      setInitResult(err.response?.data || { error: err.message });
    } finally {
      setInitLoading(false);
    }
  };

  const handleFetchFeed = async () => {
    setFeedLoading(true);
    setFeedResult(null);
    try {
      const res = await agentApi.getAgentFeedByAgentId(feedAgentId);
      setFeedResult(res);
    } catch (err: any) {
      setFeedResult(err.response?.data || { error: err.message });
    } finally {
      setFeedLoading(false);
    }
  };

  const backendHost = window.location.origin;

  const initCurl = `curl -X POST ${backendHost}/api/agent/init \\
  -H "Content-Type: application/json" \\
  -d '{"persona":{"name":"${initName}","domain":"${initDomain}"}}'`;

  const feedCurl = `curl "${backendHost}/api/agent/feed?agentId=${feedAgentId}"`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Terminal className="w-7 h-7 text-indigo-400" />
          Evaluator API Simulation Panel
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Simulate the exact hackathon evaluator requests against <code className="text-indigo-300 font-mono">POST /api/agent/init</code> and <code className="text-indigo-300 font-mono">GET /api/agent/feed</code>.
        </p>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300 space-y-1">
          <p className="font-semibold text-indigo-300">Hackathon Compliance Notice:</p>
          <p>
            Initialization starts the autonomous background worker on the server. The evaluator endpoint <code className="text-cyan-300 font-mono">POST /api/agent/init</code> returns immediately with an <code className="text-cyan-300 font-mono">agentId</code> without forcing HTTP timeout. The worker then runs background discovery & generation cycles continuously over time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Endpoint 1: Init */}
        <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
              POST /api/agent/init
            </span>
            <span className="text-xs text-gray-400 font-mono">Evaluator Init</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Persona Name</label>
              <input
                type="text"
                value={initName}
                onChange={(e) => setInitName(e.target.value)}
                className="w-full bg-[#090D16] border border-border/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Domain Focus</label>
              <input
                type="text"
                value={initDomain}
                onChange={(e) => setInitDomain(e.target.value)}
                className="w-full bg-[#090D16] border border-border/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleInit}
              disabled={initLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {initLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              Send POST /api/agent/init
            </button>
          </div>

          {/* cURL Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>cURL Request</span>
              <button
                onClick={() => copyToClipboard(initCurl, setCopiedInit)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedInit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedInit ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#070A10] border border-border/40 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
              {initCurl}
            </pre>
          </div>

          {/* Response Display */}
          {initResult && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 font-mono">Response (200 OK)</div>
              <pre className="p-3 rounded-xl bg-[#070A10] border border-border/40 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(initResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Endpoint 2: Feed */}
        <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-400 text-xs font-mono font-bold border border-sky-500/30">
              GET /api/agent/feed
            </span>
            <span className="text-xs text-gray-400 font-mono">Evaluator Feed</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">agentId Query Parameter</label>
              <input
                type="text"
                value={feedAgentId}
                onChange={(e) => setFeedAgentId(e.target.value)}
                placeholder="e.g. ada-ai-security"
                className="w-full bg-[#090D16] border border-border/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleFetchFeed}
              disabled={feedLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/25 disabled:opacity-50"
            >
              {feedLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Fetch Feed (GET /api/agent/feed)
            </button>
          </div>

          {/* cURL Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>cURL Request</span>
              <button
                onClick={() => copyToClipboard(feedCurl, setCopiedFeed)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedFeed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFeed ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#070A10] border border-border/40 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
              {feedCurl}
            </pre>
          </div>

          {/* Response Display */}
          {feedResult && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 font-mono">Response (200 OK)</div>
              <pre className="p-3 rounded-xl bg-[#070A10] border border-border/40 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80">
                {JSON.stringify(feedResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
