import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Zap,
  BookOpen,
  Loader2,
  MessageSquare,
  FileCode,
  ListOrdered,
  Code2,
  Bot,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { DiffViewer } from './DiffViewer';
import { MentorChat } from './MentorChat';
import { Language, MentorPersonaId } from '../types/index';
import { MENTOR_PERSONAS } from '../data/defaultData';
import {
  requestRefactor,
  executeCodeInSandbox,
  requestAutoFix,
} from '../services/mentorApi';

interface WorkbenchProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  activePersona: MentorPersonaId;
  onPersonaChange: (persona: MentorPersonaId) => void;
  onTriggerReview: () => void;
  onNavigateToSandbox: () => void;
  onReloadSample?: () => void;
}

export const Workbench: React.FC<WorkbenchProps> = ({
  code,
  onCodeChange,
  language,
  activePersona,
  onPersonaChange,
  onTriggerReview,
  onNavigateToSandbox,
  onReloadSample,
}) => {
  const currentPersona = MENTOR_PERSONAS[activePersona] || MENTOR_PERSONAS.architect;

  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'diff' | 'explain'>('chat');
  const [mobileView, setMobileView] = useState<'editor' | 'mentor'>('editor');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const [refactorDiff, setRefactorDiff] = useState<{
    original: string;
    modified: string;
    summary: string;
    improvements: string[];
    complexityDiff?: {
      before: { time: string; space: string };
      after: { time: string; space: string };
    };
  } | null>(null);

  const [explanationData, setExplanationData] = useState<{
    summary: string;
    steps: string[];
  } | null>(null);

  const [inlineExecutionResult, setInlineExecutionResult] = useState<{
    logs: string[];
    result?: string;
    timeMs: number;
    error?: string;
  } | null>(null);

  const handleQuickAction = async (goal: 'optimize' | 'clean' | 'explain') => {
    setIsActionLoading(true);
    setActionStatus(
      goal === 'optimize'
        ? 'Analyzing Big-O complexity & optimizing...'
        : goal === 'explain'
        ? 'Deconstructing execution logic...'
        : 'Refactoring modular structure...'
    );

    try {
      const data = await requestRefactor({
        code,
        language,
        goal,
      });

      if (goal === 'explain') {
        setExplanationData({
          summary: data.summary || 'Step-by-step logic breakdown:',
          steps: data.improvements || [
            '1. Initialization & State Setup: Prepares required buffers and validation parameters.',
            '2. Core Processing Invariant: Iterates through payload with guarded boundary conditions.',
            '3. Teardown & Return: Releases acquired handles and propagates sanitized result.',
          ],
        });
        setActiveRightTab('explain');
        setMobileView('mentor');
      } else {
        setRefactorDiff({
          original: code,
          modified: data.transformedCode || code,
          summary: data.summary || 'Optimized code structure and hardened execution paths.',
          improvements: data.improvements || ['Enhanced modularity', 'Optimized memory usage'],
          complexityDiff: data.complexityDiff,
        });
        setActiveRightTab('diff');
        setMobileView('mentor');
      }
    } catch (err: any) {
      console.error('Quick action failed:', err);
    } finally {
      setIsActionLoading(false);
      setActionStatus('');
    }
  };

  const handleInlineRun = async (codeToRun?: string, runLang?: Language) => {
    const targetCode = codeToRun || code;
    const targetLang = runLang || language;

    setIsActionLoading(true);
    setActionStatus(`Executing ${targetLang} in secure sandbox...`);
    try {
      const res = await executeCodeInSandbox(targetCode, targetLang);
      setInlineExecutionResult({
        logs: res.logs,
        result:
          res.result !== undefined
            ? typeof res.result === 'object'
              ? JSON.stringify(res.result, null, 2)
              : String(res.result)
            : undefined,
        timeMs: res.executionTimeMs,
        error: res.error,
      });
    } catch (err: any) {
      setInlineExecutionResult({
        logs: [],
        timeMs: 0,
        error: err.message || String(err),
      });
    } finally {
      setIsActionLoading(false);
      setActionStatus('');
    }
  };

  const handleAutoFixInWorkbench = async () => {
    if (!inlineExecutionResult?.error) return;
    setIsActionLoading(true);
    setActionStatus('AI Mentor auto-fixing syntax and runtime errors...');
    try {
      const fixResult = await requestAutoFix({
        code,
        language,
        error: inlineExecutionResult.error,
      });
      if (fixResult.fixedCode) {
        onCodeChange(fixResult.fixedCode);
        // Automatically re-run the corrected code
        const res = await executeCodeInSandbox(fixResult.fixedCode, language);
        setInlineExecutionResult({
          logs: [`[AI Auto-Fix Applied] ${fixResult.explanation}`, ...res.logs],
          result:
            res.result !== undefined
              ? typeof res.result === 'object'
                ? JSON.stringify(res.result, null, 2)
                : String(res.result)
              : undefined,
          timeMs: res.executionTimeMs,
          error: res.error,
        });
      }
    } catch (err: any) {
      console.error('Auto fix error:', err);
    } finally {
      setIsActionLoading(false);
      setActionStatus('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] bg-[#0d1117] overflow-hidden text-slate-100 font-sans">
      {/* Mobile Top View Switcher */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileView === 'editor'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Code Editor</span>
          </button>
          <button
            onClick={() => setMobileView('mentor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileView === 'mentor'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">AI Mentor</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-base flex-shrink-0">{currentPersona.avatar}</span>
          <span className="font-semibold hidden sm:inline whitespace-nowrap">
            {currentPersona.name}
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Pane: Code Editor & Quick Action Toolbar */}
        <div
          className={`flex-1 flex-col min-w-0 border-r border-slate-800 ${
            mobileView === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Action Toolbar */}
          <div className="px-3 py-2 bg-[#161b22] border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleQuickAction('optimize')}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition disabled:opacity-50 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Refactor & Optimize</span>
              </button>

              <button
                onClick={() => handleQuickAction('explain')}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition disabled:opacity-50 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Explain Logic</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleInlineRun()}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Run Code</span>
              </button>

              <button
                onClick={onTriggerReview}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md shadow-teal-600/20 whitespace-nowrap flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Full Code Review</span>
              </button>
            </div>
          </div>

          {/* Action Loading Status Banner */}
          {isActionLoading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-950/60 border-b border-teal-500/30 text-teal-200 text-xs animate-pulse flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 flex-shrink-0" />
              <span className="truncate">{actionStatus}</span>
            </div>
          )}

          {/* Main Code Editor */}
          <div className="flex-1 overflow-hidden p-2 sm:p-3 flex flex-col min-h-0">
            <CodeEditor
              code={code}
              onChange={onCodeChange}
              language={language}
              className="flex-1"
            />

            {/* Inline Execution Console Drawer */}
            {inlineExecutionResult && (
              <div className="mt-2.5 rounded-xl border border-slate-800 bg-[#161b22] p-3 font-mono text-xs max-h-48 overflow-auto shadow-lg flex-shrink-0">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap">
                    <Play className="w-3 h-3 flex-shrink-0" /> Output ({inlineExecutionResult.timeMs}ms)
                  </span>
                  <button
                    onClick={() => setInlineExecutionResult(null)}
                    className="text-slate-500 hover:text-slate-300 whitespace-nowrap"
                  >
                    Dismiss
                  </button>
                </div>

                {inlineExecutionResult.error ? (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-2.5">
                    <div className="text-rose-400 font-medium whitespace-pre-wrap text-xs leading-relaxed">
                      <strong>Runtime Error:</strong> {inlineExecutionResult.error}
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-rose-900/40">
                      <button
                        onClick={handleAutoFixInWorkbench}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm whitespace-nowrap flex-shrink-0 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Auto-Fix Error</span>
                      </button>
                      <button
                        onClick={onTriggerReview}
                        className="flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition whitespace-nowrap flex-shrink-0"
                      >
                        <Code2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span>Inspect in Code Review</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {inlineExecutionResult.logs.length > 0 ? (
                      inlineExecutionResult.logs.map((log, idx) => (
                        <div
                          key={idx}
                          className="text-emerald-300 whitespace-pre-wrap flex items-start gap-2"
                        >
                          <span className="text-slate-600 select-none font-mono text-[10px]">&gt;</span>
                          <span className="font-mono text-xs">{log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic">Code executed with 0 stdout output.</div>
                    )}
                    {inlineExecutionResult.result &&
                      typeof inlineExecutionResult.result !== 'string' && (
                        <div className="text-teal-300 pt-1.5 border-t border-slate-800/60 font-mono text-xs">
                          <span className="text-slate-500 text-[10px] font-sans block">Result:</span>
                          {JSON.stringify(inlineExecutionResult.result, null, 2)}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: AI Pair Mentor & Tools */}
        <div
          className={`w-full lg:w-[460px] xl:w-[490px] flex flex-col bg-[#161b22] border-t lg:border-t-0 border-slate-800 min-h-0 ${
            mobileView === 'mentor' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          {/* Subtabs Bar for Chat vs Diff vs Explain */}
          {(refactorDiff || explanationData) && (
            <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-slate-800 text-xs overflow-x-auto scrollbar-none flex-shrink-0 gap-2">
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setActiveRightTab('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg transition whitespace-nowrap flex-shrink-0 ${
                    activeRightTab === 'chat'
                      ? 'bg-slate-800 text-teal-300 font-semibold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Mentor Chat</span>
                </button>

                {refactorDiff && (
                  <button
                    onClick={() => setActiveRightTab('diff')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg transition whitespace-nowrap flex-shrink-0 ${
                      activeRightTab === 'diff'
                        ? 'bg-slate-800 text-teal-300 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Refactor Diff</span>
                  </button>
                )}

                {explanationData && (
                  <button
                    onClick={() => setActiveRightTab('explain')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg transition whitespace-nowrap flex-shrink-0 ${
                      activeRightTab === 'explain'
                        ? 'bg-slate-800 text-teal-300 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Logic Flow</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: AI Mentor Chat */}
          {activeRightTab === 'chat' && (
            <MentorChat
              code={code}
              language={language}
              activePersona={activePersona}
              onPersonaChange={onPersonaChange}
              onApplyCodeToEditor={(newCode) => {
                onCodeChange(newCode);
                setMobileView('editor');
              }}
              onRunCode={(codeToRun, runLang) => {
                handleInlineRun(codeToRun, runLang);
                setMobileView('editor');
              }}
            />
          )}

          {/* TAB 2: Refactor Diff Viewer */}
          {activeRightTab === 'diff' && refactorDiff && (
            <div className="flex-1 flex flex-col p-2 sm:p-3 overflow-hidden min-h-0">
              {refactorDiff.complexityDiff && (
                <div className="mb-2.5 p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/30 text-xs flex-shrink-0">
                  <div className="font-semibold text-teal-300 mb-1 flex items-center gap-1.5 whitespace-nowrap">
                    <Zap className="w-3.5 h-3.5 flex-shrink-0" /> Complexity Optimization
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Before: </span>
                      <span className="text-rose-400 font-mono font-semibold">
                        {refactorDiff.complexityDiff.before?.time || 'O(n)'} Time
                      </span>
                      ,{' '}
                      <span className="text-slate-300 font-mono">
                        {refactorDiff.complexityDiff.before?.space || 'O(1)'} Space
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">After: </span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {refactorDiff.complexityDiff.after?.time || 'O(1)'} Time
                      </span>
                      ,{' '}
                      <span className="text-emerald-300 font-mono">
                        {refactorDiff.complexityDiff.after?.space || 'O(1)'} Space
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-hidden min-h-0">
                <DiffViewer
                  originalCode={refactorDiff.original}
                  modifiedCode={refactorDiff.modified}
                  language={language}
                  onApply={(newCode) => {
                    onCodeChange(newCode);
                    setActiveRightTab('chat');
                  }}
                  onClose={() => setActiveRightTab('chat')}
                  summary={refactorDiff.summary}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Logic Flow & Explanation */}
          {activeRightTab === 'explain' && explanationData && (
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto text-xs space-y-3 min-h-0">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-semibold text-slate-200 text-sm mb-1">
                  Architecture & Flow Overview
                </h4>
                <p className="text-slate-400 leading-relaxed">{explanationData.summary}</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-slate-300 text-xs">
                  Step-by-Step Logic Breakdown:
                </h5>
                {explanationData.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-slate-300 leading-relaxed">{step}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveRightTab('chat')}
                className="w-full py-2.5 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold whitespace-nowrap"
              >
                Back to Pair Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
