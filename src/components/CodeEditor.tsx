import React, { useState, useRef, useEffect } from 'react';
import { Play, Copy, Check, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '../types/index';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: Language;
  readOnly?: boolean;
  breakpoints?: number[];
  onToggleBreakpoint?: (line: number) => void;
  activeLine?: number;
  errorLines?: number[];
  className?: string;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  readOnly = false,
  breakpoints = [],
  onToggleBreakpoint,
  activeLine,
  errorLines = [],
  className = '',
  placeholder = 'Write or paste your code here...',
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = code.substring(0, start) + '  ' + code.substring(end);
      onChange(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-xl border border-slate-800 bg-[#0d1117] overflow-hidden font-mono text-sm shadow-2xl ${className}`}>
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800/80 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
            {language}
          </span>
          <span className="text-slate-500">•</span>
          <span>{lineCount} lines</span>
          {activeLine && (
            <span className="text-amber-400 text-[11px] flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Executing Line {activeLine}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleBreakpoint && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Click gutter to set breakpoints
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="relative flex flex-1 overflow-hidden min-h-[300px]">
        {/* Line Numbers & Breakpoint Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-3 bg-[#0d1117] select-none border-r border-slate-800/60 text-right pr-3 text-slate-600 overflow-hidden flex flex-col"
        >
          {Array.from({ length: lineCount }).map((_, idx) => {
            const lineNum = idx + 1;
            const isBreakpoint = breakpoints.includes(lineNum);
            const isActive = activeLine === lineNum;
            const isError = errorLines.includes(lineNum);

            return (
              <div
                key={lineNum}
                onClick={() => onToggleBreakpoint && onToggleBreakpoint(lineNum)}
                className={`group relative h-6 leading-6 flex items-center justify-end cursor-pointer transition ${
                  isActive ? 'text-amber-400 font-bold' : isError ? 'text-rose-400 font-bold' : 'hover:text-slate-300'
                }`}
              >
                {/* Breakpoint Dot */}
                {isBreakpoint ? (
                  <span className="absolute left-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-900/50 shadow-sm" />
                ) : (
                  onToggleBreakpoint && (
                    <span className="absolute left-2 w-2 h-2 rounded-full bg-rose-500/30 opacity-0 group-hover:opacity-100 transition" />
                  )
                )}
                <span className="text-[12px]">{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area Input / Display */}
        <div className="relative flex-1 bg-[#0d1117]">
          {/* Active / Error Line Highlights */}
          <div className="absolute inset-0 pointer-events-none py-3 overflow-hidden">
            {Array.from({ length: lineCount }).map((_, idx) => {
              const lineNum = idx + 1;
              const isActive = activeLine === lineNum;
              const isError = errorLines.includes(lineNum);

              if (!isActive && !isError) return <div key={lineNum} className="h-6" />;

              return (
                <div
                  key={lineNum}
                  className={`h-6 w-full ${
                    isActive
                      ? 'bg-amber-500/15 border-l-2 border-amber-400'
                      : 'bg-rose-500/15 border-l-2 border-rose-500'
                  }`}
                />
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck={false}
            className="relative z-10 w-full h-full p-3 bg-transparent text-slate-200 resize-none outline-none leading-6 text-sm font-mono whitespace-pre overflow-auto scrollbar-thin scrollbar-thumb-slate-800"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  );
};
