import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Workbench } from './components/Workbench';
import { CodeReviewView } from './components/CodeReviewView';
import { LearningPathsView } from './components/LearningPathsView';
import { SandboxRunner } from './components/SandboxRunner';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthGateView } from './components/auth/AuthGateView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Language, MentorPersonaId } from './types';
import { LANGUAGE_SAMPLES } from './data/defaultData';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('workbench');
  const [language, setLanguage] = useState<Language>('typescript');
  const [activePersona, setActivePersona] = useState<MentorPersonaId>('architect');
  const [code, setCode] = useState<string>(LANGUAGE_SAMPLES['typescript'].code);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Each time user selects a language, load the corresponding sample code into the editor
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (LANGUAGE_SAMPLES[newLang]) {
      setCode(LANGUAGE_SAMPLES[newLang].code);
    }
  };

  const handleReloadSampleCode = () => {
    if (LANGUAGE_SAMPLES[language]) {
      setCode(LANGUAGE_SAMPLES[language].code);
    }
  };

  const handleOpenInWorkbench = (newCode: string, lang: string) => {
    setCode(newCode);
    const validLang = (lang as Language) || 'typescript';
    setLanguage(validLang);
    setActiveTab('workbench');
  };

  // Show clean spinner during initial token verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <div className="text-xs font-semibold tracking-wide uppercase text-slate-500">
          Authenticating DevMentor Session...
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the Auth Gate landing screen
  if (!isAuthenticated) {
    return <AuthGateView />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar with Authentication Status */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onLanguageChange={handleLanguageChange}
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
        onReloadSampleCode={handleReloadSampleCode}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'workbench' && (
          <Workbench
            code={code}
            onCodeChange={setCode}
            language={language}
            activePersona={activePersona}
            onPersonaChange={setActivePersona}
            onTriggerReview={() => setActiveTab('review')}
            onNavigateToSandbox={() => setActiveTab('sandbox')}
            onReloadSample={handleReloadSampleCode}
          />
        )}

        {activeTab === 'review' && (
          <CodeReviewView
            code={code}
            language={language}
            onApplyFix={(fixedCode) => {
              setCode(fixedCode);
              setActiveTab('workbench');
            }}
            onBackToEditor={() => setActiveTab('workbench')}
          />
        )}

        {activeTab === 'learning' && (
          <LearningPathsView
            onOpenChallengeInWorkbench={(challengeCode, lang) =>
              handleOpenInWorkbench(challengeCode, lang)
            }
          />
        )}

        {activeTab === 'sandbox' && (
          <SandboxRunner
            initialCode={code}
            language={language}
            onCodeChange={setCode}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal />

      {/* Guide & Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
