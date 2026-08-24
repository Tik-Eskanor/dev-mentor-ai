import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileCode,
  ListFilter,
  CheckCheck,
} from 'lucide-react';
import { CodeReviewResult, Language } from '../types';
import { requestReview } from '../services/mentorApi';
import { DiffViewer } from './DiffViewer';

interface CodeReviewViewProps {
  code: string;
  language: Language;
  onApplyFix: (newCode: string) => void;
  onBackToEditor: () => void;
}

export const CodeReviewView: React.FC<CodeReviewViewProps> = ({
  code,
  language,
  onApplyFix,
  onBackToEditor,
}) => {
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strictness, setStrictness] = useState<'Lenient' | 'Balanced' | 'Strict' | 'Enterprise'>('Strict');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'findings' | 'diff'>('findings');
  const [appliedFixIssueId, setAppliedFixIssueId] = useState<string | null>(null);
  const [appliedMasterFix, setAppliedMasterFix] = useState(false);

  const fetchReview = async () => {
    setIsLoading(true);
    try {
      const data = await requestReview({
        code,
        language,
        strictness,
      });
      setReviewResult(data);
      if (data.issues && data.issues.length > 0) {
        setExpandedIssueId(data.issues[0].id);
      }
    } catch (err: any) {
      console.error('Review failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [code, language, strictness]);

  const filteredIssues =
    reviewResult?.issues.filter((iss) => {
      if (selectedSeverity === 'all') return true;
      return iss.severity === selectedSeverity;
    }) || [];

  const handleApplySingleFix = (issueId: string, fixSnippet: string) => {
    if (!reviewResult) return;
    
    // Apply either the specific snippet replacement or full optimized code
    if (reviewResult.optimizedCode) {
      onApplyFix(reviewResult.optimizedCode);
    } else if (fixSnippet) {
      onApplyFix(code.replace(issueId, fixSnippet));
    }
    
    setAppliedFixIssueId(issueId);
    setTimeout(() => {
      setAppliedFixIssueId(null);
    }, 2500);
  };

  const handleApplyAllFixes = () => {
    if (!reviewResult?.optimizedCode) return;
    onApplyFix(reviewResult.optimizedCode);
    setAppliedMasterFix(true);
    setTimeout(() => {
      setAppliedMasterFix(false);
    }, 3000);
  };

  const handleCopyReport = () => {
    if (!reviewResult) return;
    const reportMd = `# Techtor Code Review Report
Overall Health Score: ${reviewResult.overallScore}/100
Language: ${language}
Date: ${new Date().toLocaleDateString()}

## Executive Summary
${reviewResult.summary}

## Metric Scores
- Quality: ${reviewResult.scores.quality}/100
- Performance: ${reviewResult.scores.performance}/100
- Security: ${reviewResult.scores.security}/100
- Maintainability: ${reviewResult.scores.maintainability}/100
- Testability: ${reviewResult.scores.testability}/100

## Identified Issues (${reviewResult.issues.length})
${reviewResult.issues
  .map(
    (i, idx) => `### ${idx + 1}. [${i.severity.toUpperCase()}] ${i.title} (Line ${i.line})
- Category: ${i.category}
- Impact: ${i.impact || 'N/A'}
- Suggestion: ${i.suggestion}
`
  )
  .join('\n')}

## Key Recommendations
${reviewResult.keyRecommendations.map((r) => `- ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(reportMd);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap flex-shrink-0">
            <AlertOctagon className="w-3 h-3 flex-shrink-0" /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap flex-shrink-0">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Warning
          </span>
        );
      case 'optimization':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap flex-shrink-0">
            <Zap className="w-3 h-3 flex-shrink-0" /> Optimization
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700/60 text-slate-300 border border-slate-600 whitespace-nowrap flex-shrink-0">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> Best Practice
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d1117] p-3 sm:p-5 lg:p-6 text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-100">
                  Real-Time Code Review & Security Audit
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {language.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deep static AST analysis, asymptotic Big-O profiling, and OWASP vulnerability scans.
              </p>
            </div>
          </div>

          {/* Action Controls Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0 flex-shrink-0">
            {/* View Switcher: Findings vs Diff */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs flex-shrink-0">
              <button
                onClick={() => setActiveTab('findings')}
                className={`flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded-md transition text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'findings'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Audit Findings</span>
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                className={`flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded-md transition text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'diff'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Diff Inspector</span>
              </button>
            </div>

            {/* Strictness Level Selector */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs flex-shrink-0">
              <span className="text-slate-500 px-1.5 text-[11px] font-mono whitespace-nowrap hidden sm:inline">
                AUDIT:
              </span>
              {(['Balanced', 'Strict', 'Enterprise'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setStrictness(lvl)}
                  className={`px-2 sm:px-2.5 py-1 min-h-[32px] rounded-md transition text-xs whitespace-nowrap flex-shrink-0 font-medium ${
                    strictness === lvl
                      ? 'bg-teal-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={fetchReview}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50 whitespace-nowrap flex-shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 flex-shrink-0 ${isLoading ? 'animate-spin text-teal-400' : ''}`}
              />
              <span className="whitespace-nowrap">Re-Scan</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition whitespace-nowrap flex-shrink-0"
            >
              {copiedReport ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="whitespace-nowrap">{copiedReport ? 'Copied' : 'Export'}</span>
            </button>

            <button
              onClick={onBackToEditor}
              className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-sm whitespace-nowrap flex-shrink-0"
            >
              Back to Editor
            </button>
          </div>
        </div>

        {/* Master Auto-Fix Notification Banner */}
        {appliedMasterFix && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>All fixes applied to editor!</strong> Your code has been refactored with full type safety and defensive error handling.
              </span>
            </div>
            <button
              onClick={onBackToEditor}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium whitespace-nowrap flex-shrink-0"
            >
              Open in Editor
            </button>
          </div>
        )}

        {/* Loading Spinner Screen */}
        {isLoading && !reviewResult ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-teal-500 flex-shrink-0" />
            <div className="text-center px-4">
              <h3 className="text-base font-semibold text-slate-200">Analyzing Abstract Syntax Tree...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Running vulnerability threat modeling, Big-O execution profiling, and clean architecture validation.
              </p>
            </div>
          </div>
        ) : reviewResult ? (
          activeTab === 'diff' ? (
            /* Diff Inspector View */
            <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <DiffViewer
                originalCode={code}
                modifiedCode={reviewResult.optimizedCode || code}
                language={language}
                onApply={(appliedCode) => {
                  onApplyFix(appliedCode);
                  setAppliedMasterFix(true);
                }}
                title="Current vs AI-Optimized & Hardened Solution"
                summary="Review proposed architectural refactoring, strict types, and boundary checks before applying."
              />
            </div>
          ) : (
            <>
              {/* Master Auto-Fix Action Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-emerald-950/40 border border-teal-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>1-Click Full Code Refactor & Remediation</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {reviewResult.issues.length} {reviewResult.issues.length === 1 ? 'Issue' : 'Issues'} Detected
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Instantly resolve identified vulnerabilities, unhandled exceptions, and Big-O bottlenecks with verified production fixes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('diff')}
                    className="flex-1 md:flex-none px-3.5 py-2 min-h-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition whitespace-nowrap"
                  >
                    Compare Diff
                  </button>
                  <button
                    onClick={handleApplyAllFixes}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 min-h-[38px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg whitespace-nowrap"
                  >
                    <Zap className="w-4 h-4 flex-shrink-0" />
                    <span>Apply All Auto-Fixes</span>
                  </button>
                </div>
              </div>

              {/* Top Score Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {/* Overall Score Dial */}
                <div className="sm:col-span-2 lg:col-span-4 xl:col-span-2 p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800 shadow-xl flex items-center gap-4 sm:gap-5">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-inner flex-shrink-0 ${getScoreColor(
                      reviewResult.overallScore
                    )}`}
                  >
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
                      {reviewResult.overallScore}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 font-sans whitespace-nowrap">
                      / 100
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 whitespace-nowrap">
                      Health Assessment
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-200 mt-0.5 truncate">
                      {reviewResult.overallScore >= 85
                        ? 'Production Ready'
                        : reviewResult.overallScore >= 65
                        ? 'Requires Hardening'
                        : 'Critical Vulnerabilities'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {reviewResult.summary}
                    </p>
                  </div>
                </div>

                {/* Individual Metrics */}
                {[
                  { label: 'Quality & SOLID', val: reviewResult.scores.quality },
                  { label: 'Performance', val: reviewResult.scores.performance },
                  { label: 'Security & OWASP', val: reviewResult.scores.security },
                  { label: 'Maintainability', val: reviewResult.scores.maintainability },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 shadow-md flex flex-col justify-between"
                  >
                    <div className="text-[11px] font-semibold text-slate-400 whitespace-nowrap truncate">
                      {m.label}
                    </div>
                    <div className="my-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold font-mono text-slate-100">{m.val}</span>
                      <span className="text-xs text-slate-500 font-mono">/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          m.val >= 80 ? 'bg-emerald-500' : m.val >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${m.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Complexity & Big-O Comparison Banner */}
              {reviewResult.complexity && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-teal-950/20 border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 flex-shrink-0">
                      <Zap className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 whitespace-nowrap">
                        Algorithmic Complexity Profiler
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {reviewResult.complexity?.current?.explanation || 'Analyzed asymptotic execution boundaries.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono flex-wrap flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 whitespace-nowrap flex-shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans whitespace-nowrap">Current</span>
                      {reviewResult.complexity?.current?.time || 'O(n)'} Time • {reviewResult.complexity?.current?.space || 'O(1)'} Space
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block flex-shrink-0" />
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 whitespace-nowrap flex-shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans whitespace-nowrap">Optimized</span>
                      {reviewResult.complexity?.optimized?.time || 'O(1)'} Time • {reviewResult.complexity?.optimized?.space || 'O(1)'} Space
                    </div>
                  </div>
                </div>
              )}

              {/* Issues Section */}
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-200 whitespace-nowrap">
                      Audit Findings & Actionable Fixes
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700 whitespace-nowrap flex-shrink-0">
                      {reviewResult.issues.length}
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none pb-1 sm:pb-0 flex-shrink-0">
                    {['all', 'critical', 'warning', 'optimization', 'best-practice'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSeverity(s)}
                        className={`px-3 py-1.5 min-h-[32px] rounded-lg capitalize font-medium transition whitespace-nowrap flex-shrink-0 ${
                          selectedSeverity === s
                            ? 'bg-slate-700 text-white shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Cards */}
                <div className="space-y-3">
                  {filteredIssues.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#161b22] border border-slate-800 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 flex-shrink-0" />
                      <p className="text-sm font-semibold text-slate-200">No issues found for this filter!</p>
                      <p className="text-xs text-slate-500 mt-1">Your code passed all checks in this category.</p>
                    </div>
                  ) : (
                    filteredIssues.map((issue) => {
                      const isExpanded = expandedIssueId === issue.id;
                      const isApplied = appliedFixIssueId === issue.id;

                      return (
                        <div
                          key={issue.id}
                          className={`rounded-2xl border transition overflow-hidden shadow-md ${
                            issue.severity === 'critical'
                              ? 'bg-rose-950/10 border-rose-900/40'
                              : issue.severity === 'warning'
                              ? 'bg-amber-950/10 border-amber-900/40'
                              : 'bg-[#161b22] border-slate-800'
                          }`}
                        >
                          {/* Issue Header */}
                          <div
                            onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                            className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition select-none gap-3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              {getSeverityBadge(issue.severity)}
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px] border border-slate-700 whitespace-nowrap flex-shrink-0">
                                L{issue.line > 0 ? issue.line : 'Global'}
                              </span>
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline whitespace-nowrap">
                                {issue.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                                {issue.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplySingleFix(issue.id, issue.fixSnippet);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-semibold transition shadow-sm whitespace-nowrap flex-shrink-0 ${
                                  isApplied
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Fix Applied</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Apply Fix</span>
                                  </>
                                )}
                              </button>

                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Issue Body */}
                          {isExpanded && (
                            <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3 text-xs">
                              <p className="text-slate-300 leading-relaxed font-sans">{issue.description}</p>

                              {issue.impact && (
                                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="font-semibold">Production Impact: </strong>
                                    {issue.impact}
                                  </div>
                                </div>
                              )}

                              <div className="p-2.5 rounded-lg bg-teal-950/30 border border-teal-900/40 text-teal-200 text-xs">
                                <strong className="font-semibold text-teal-300">Recommended Resolution: </strong>
                                {issue.suggestion}
                              </div>

                              {/* Code Snippet Comparison */}
                              {(issue.codeSnippet || issue.fixSnippet) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                  {issue.codeSnippet && (
                                    <div className="rounded-lg bg-[#0d1117] border border-rose-900/40 p-2.5 font-mono text-xs overflow-hidden">
                                      <div className="text-[10px] text-rose-400 font-sans font-semibold mb-1 whitespace-nowrap">
                                        Offending Code
                                      </div>
                                      <pre className="text-rose-200 overflow-x-auto whitespace-pre">
                                        {issue.codeSnippet}
                                      </pre>
                                    </div>
                                  )}
                                  {issue.fixSnippet && (
                                    <div className="rounded-lg bg-[#0d1117] border border-emerald-900/40 p-2.5 font-mono text-xs overflow-hidden">
                                      <div className="text-[10px] text-emerald-400 font-sans font-semibold mb-1 whitespace-nowrap">
                                        Hardened Fix
                                      </div>
                                      <pre className="text-emerald-200 overflow-x-auto whitespace-pre">
                                        {issue.fixSnippet}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Strategic Checklist & Unit Tests Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Recommendations */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-2 whitespace-nowrap">
                    <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    Key Architectural Recommendations
                  </h3>
                  <div className="space-y-2">
                    {reviewResult.keyRecommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edge Case Unit Test Suggestions */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-2 whitespace-nowrap">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    Critical Edge-Case Test Scenarios
                  </h3>
                  <div className="space-y-2">
                    {reviewResult.unitTestSuggestions.map((test, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{test}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )
        ) : null}
      </div>
    </div>
  );
};
