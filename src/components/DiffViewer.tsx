import React, { useState } from 'react';
import { Check, X, ArrowRight, ArrowLeftRight, Copy } from 'lucide-react';

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language: string;
  onApply: (appliedCode: string) => void;
  onClose?: () => void;
  title?: string;
  summary?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language,
  onApply,
  onClose,
  title = 'Suggested Refactoring & Optimizations',
  summary,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('unified');
  const [copied, setCopied] = useState(false);

  const origLines = originalCode.split('\n');
  const modLines = modifiedCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(modifiedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-sans">{title}</h4>
            {summary && <p className="text-xs text-slate-400 font-sans">{summary}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700 text-xs font-sans">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'unified' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified Diff
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'split' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side by Side
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => onApply(modifiedCode)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-medium transition shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Close Diff"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Diff Content View */}
      <div className="flex-1 overflow-auto p-4 bg-[#0d1117] text-xs leading-6">
        {viewMode === 'unified' ? (
          <div className="space-y-0.5">
            {modLines.map((line, idx) => {
              const origLine = origLines[idx];
              const isAdded = origLine === undefined || line !== origLine;
              const isUnchanged = line === origLine;

              return (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded font-mono ${
                    isAdded ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500' : 'text-slate-300'
                  }`}
                >
                  <span className="w-8 select-none text-slate-600 text-right pr-3">{idx + 1}</span>
                  <span className="w-4 select-none text-slate-500 font-bold">{isAdded ? '+' : ' '}</span>
                  <pre className="flex-1 whitespace-pre-wrap">{line || ' '}</pre>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Original Panel */}
            <div className="flex flex-col rounded-lg border border-slate-800 bg-[#161b22]/40 overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-sans flex items-center justify-between">
                <span>Original Code</span>
                <span className="text-slate-600">{origLines.length} lines</span>
              </div>
              <div className="p-3 overflow-auto flex-1 font-mono text-slate-300 space-y-0.5">
                {origLines.map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-8 select-none text-slate-600 text-right pr-2">{idx + 1}</span>
                    <pre className="flex-1 whitespace-pre">{line || ' '}</pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Modified Panel */}
            <div className="flex flex-col rounded-lg border border-emerald-900/40 bg-emerald-950/10 overflow-hidden">
              <div className="px-3 py-1.5 bg-emerald-950/30 border-b border-emerald-900/30 text-[11px] text-emerald-400 font-sans flex items-center justify-between">
                <span>Optimized & Hardened Solution</span>
                <span className="text-emerald-500">{modLines.length} lines</span>
              </div>
              <div className="p-3 overflow-auto flex-1 font-mono text-emerald-200 space-y-0.5">
                {modLines.map((line, idx) => {
                  const isNew = origLines[idx] !== line;
                  return (
                    <div
                      key={idx}
                      className={`flex ${isNew ? 'bg-emerald-900/30 text-emerald-200 font-medium' : 'text-slate-300'}`}
                    >
                      <span className="w-8 select-none text-emerald-700 text-right pr-2">{idx + 1}</span>
                      <pre className="flex-1 whitespace-pre">{line || ' '}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
