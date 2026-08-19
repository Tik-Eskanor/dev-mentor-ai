import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-[#161b22] border border-slate-800 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <h3 className="font-bold text-sm sm:text-base whitespace-nowrap">
              DevMentor AI Guide & Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-indigo-300">💡 Pro Pair-Programming Tips</h4>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong>Persona Switch:</strong> Toggle between <em>Elena Vance</em> (Architect), <em>Marcus Thorne</em> (Security), <em>Kai Chen</em> (Performance), or <em>Sophia Patel</em> (Educator) for specialized reviews.
              </li>
              <li>
                <strong>Language Samples:</strong> Select HTML, CSS, JavaScript, PHP, Python, TypeScript, React, or Next.js to auto-load runnable code templates.
              </li>
              <li>
                <strong>Side-by-Side Diffs:</strong> Use the Refactor Diff viewer to examine proposed changes before applying them with a single click.
              </li>
              <li>
                <strong>Real-Time Code Review:</strong> Switch review strictness between Balanced, Strict, and Enterprise to audit OWASP Top 10 vulnerabilities.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-300">⚡ Core Workflow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                <span className="font-bold text-slate-200">1. Pair Workbench</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Live AI chat, instant refactors, unit tests.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                <span className="font-bold text-slate-200">2. Code Review</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Big-O analysis, 0-100 scores, security audits.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                <span className="font-bold text-slate-200">3. Sandbox Runner</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Live HTML/CSS previews & runtime logs.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                <span className="font-bold text-slate-200">4. Learning Paths</span>
                <p className="text-[11px] text-slate-400 mt-0.5">AI-tailored curriculum, quizzes, and capstones.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[38px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm whitespace-nowrap flex-shrink-0"
          >
            Got it, Let&apos;s Code!
          </button>
        </div>
      </div>
    </div>
  );
};
