import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Code2,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { Language } from '../types/index';
import { executeCodeInSandbox, requestAutoFix } from '../services/mentorApi';
import { LANGUAGE_SAMPLES } from '../data/defaultData';

interface SandboxRunnerProps {
  initialCode?: string;
  language: Language;
  onCodeChange?: (code: string) => void;
}

export const SandboxRunner: React.FC<SandboxRunnerProps> = ({
  initialCode,
  language,
  onCodeChange,
}) => {
  const [code, setCode] = useState<string>(
    initialCode || LANGUAGE_SAMPLES[language]?.code || '// Write code here...'
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [returnValue, setReturnValue] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'output'>('editor');
  const [outputMode, setOutputMode] = useState<'console' | 'preview'>('console');

  // Synchronize code when language changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else if (LANGUAGE_SAMPLES[language]) {
      setCode(LANGUAGE_SAMPLES[language].code);
    }
  }, [language, initialCode]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await executeCodeInSandbox(code, language);
      setLogs(res.logs);
      setReturnValue(res.result);
      setExecutionTime(res.executionTimeMs);
      if (res.error) {
        setError(res.error);
      }
      if (language === 'html' || language === 'css') {
        setOutputMode('preview');
      }
      if (window.innerWidth < 1024) {
        setMobileTab('output');
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setLogs([]);
    setReturnValue(null);
    setExecutionTime(null);
    setError(null);
  };

  const handleAutoFixInSandbox = async () => {
    if (!error) return;
    setIsRunning(true);
    try {
      const fixResult = await requestAutoFix({
        code,
        language,
        error,
      });
      if (fixResult.fixedCode) {
        setCode(fixResult.fixedCode);
        if (onCodeChange) onCodeChange(fixResult.fixedCode);
        setError(null);
        // Automatically run fixed code
        const res = await executeCodeInSandbox(fixResult.fixedCode, language);
        setLogs([`[AI Auto-Fix Applied] ${fixResult.explanation}`, ...res.logs]);
        setReturnValue(res.result);
        setExecutionTime(res.executionTimeMs);
        if (res.error) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetToLanguageSample = () => {
    if (LANGUAGE_SAMPLES[language]) {
      const sample = LANGUAGE_SAMPLES[language].code;
      setCode(sample);
      if (onCodeChange) onCodeChange(sample);
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] bg-[#0d1117] overflow-hidden text-slate-100 font-sans">
      {/* Mobile Sub-Nav Switcher */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileTab === 'editor'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Editor</span>
          </button>
          <button
            onClick={() => setMobileTab('output')}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileTab === 'output'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Output {logs.length > 0 ? `(${logs.length})` : ''}</span>
          </button>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          <Play className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="whitespace-nowrap">{isRunning ? 'Running...' : 'Run Code'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Pane: Code Canvas */}
        <div
          className={`flex-1 flex-col min-w-0 border-r border-slate-800 min-h-0 ${
            mobileTab === 'editor' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 bg-[#161b22] border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                <Terminal className="w-4 h-4 flex-shrink-0" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-200 uppercase whitespace-nowrap">
                  {language} Live Sandbox Runner
                </h2>
                <p className="text-[10px] text-slate-400 whitespace-nowrap">
                  {LANGUAGE_SAMPLES[language]?.title || 'Client runtime environment'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleResetToLanguageSample}
                className="flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition whitespace-nowrap flex-shrink-0"
                title="Reload language starter sample"
              >
                <RotateCcw className="w-3 h-3 flex-shrink-0" />
                <span className="whitespace-nowrap">Reset Sample</span>
              </button>

              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 min-h-[34px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition whitespace-nowrap flex-shrink-0"
              >
                Clear Output
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-2 sm:p-3 overflow-hidden flex flex-col min-h-0">
            <CodeEditor
              code={code}
              onChange={(val) => {
                setCode(val);
                if (onCodeChange) onCodeChange(val);
              }}
              language={language}
              className="flex-1"
            />
          </div>
        </div>

        {/* Right Pane: Execution Output, Console & Live HTML/CSS Preview */}
        <div
          className={`w-full lg:w-[460px] xl:w-[500px] bg-[#161b22] flex-col overflow-hidden min-h-0 ${
            mobileTab === 'output' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 bg-[#0d1117] border-b border-slate-800 flex items-center justify-between text-xs flex-shrink-0 gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setOutputMode('console')}
                className={`flex items-center gap-1 px-2.5 py-1 min-h-[30px] rounded-md font-semibold text-xs whitespace-nowrap transition ${
                  outputMode === 'console'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Console</span>
              </button>

              {(language === 'html' || language === 'css') && (
                <button
                  onClick={() => setOutputMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 min-h-[30px] rounded-md font-semibold text-xs whitespace-nowrap transition ${
                    outputMode === 'preview'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Live Preview</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px] flex-shrink-0">
              {executionTime !== null && (
                <span className="flex items-center gap-1 text-emerald-400 font-mono whitespace-nowrap">
                  <Clock className="w-3 h-3 flex-shrink-0" /> {executionTime}ms
                </span>
              )}
              {outputMode === 'console' && (
                <button
                  onClick={handleCopyLogs}
                  className="p-1.5 min-h-[30px] min-w-[30px] rounded hover:text-slate-200 flex items-center justify-center flex-shrink-0"
                  title="Copy Output"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Console Log Area */}
          {outputMode === 'console' ? (
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 font-mono text-xs space-y-3 bg-[#0d1117] min-h-0">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400 font-sans text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> Runtime Exception Caught
                  </div>
                  <pre className="whitespace-pre-wrap">{error}</pre>
                  <div className="pt-1 border-t border-rose-900/40">
                    <button
                      onClick={handleAutoFixInSandbox}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm whitespace-nowrap flex-shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Auto-Fix Error with AI Mentor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Logs */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 font-sans tracking-wider mb-1 whitespace-nowrap">
                  Standard Output & Execution Traces:
                </div>
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={idx} className="text-slate-300 py-0.5 leading-relaxed break-words">
                      <span className="text-slate-600 select-none mr-2">{idx + 1} &gt;</span>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 italic py-2">
                    Click &quot;Run Code&quot; to execute {language.toUpperCase()} in the sandbox.
                  </div>
                )}
              </div>

              {/* Returned Value Preview */}
              {returnValue !== null && returnValue !== undefined && (
                <div className="pt-3 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-teal-400 font-sans tracking-wider whitespace-nowrap">
                    Evaluated Return Value:
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-teal-200 overflow-x-auto whitespace-pre">
                    {typeof returnValue === 'object'
                      ? JSON.stringify(returnValue, null, 2)
                      : String(returnValue)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* Live HTML / CSS Preview Iframe */
            <div className="flex-1 bg-[#0f172a] p-2 overflow-hidden flex flex-col min-h-0">
              <iframe
                title="Live Sandbox Render"
                srcDoc={
                  language === 'css'
                    ? `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="dashboard-container"><div class="glass-card"><span class="status-badge"><span class="status-dot"></span>Active Service</span><h2>Live CSS Grid Card</h2><p style="color:var(--color-text-muted, #94a3b8);font-size:0.875rem;">CSS Styles and animations rendered in real-time.</p></div></div></body></html>`
                    : code
                }
                className="w-full h-full rounded-xl border border-slate-800 bg-white"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
