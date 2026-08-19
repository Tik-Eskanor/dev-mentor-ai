import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  ShieldCheck,
  Compass,
  Terminal,
  BookOpen,
  ChevronDown,
  Menu,
  X,
  RotateCcw,
  User as UserIcon,
  LogOut,
  Sparkles,
  LogIn,
  UserPlus,
  Bot,
  Layers,
  Check,
} from 'lucide-react';
import { Language, MentorPersonaId } from '../types';
import { MENTOR_PERSONAS, LANGUAGE_OPTIONS } from '../data/defaultData';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'workbench' | 'review' | 'learning' | 'sandbox';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activePersona: MentorPersonaId;
  onPersonaChange: (persona: MentorPersonaId) => void;
  onReloadSampleCode: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  language,
  onLanguageChange,
  activePersona,
  onPersonaChange,
  onReloadSampleCode,
  onOpenShortcuts,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const currentPersona = MENTOR_PERSONAS[activePersona] || MENTOR_PERSONAS.architect;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'workbench' as ActiveTab, label: 'Workbench', icon: Code2, desc: 'AI Pair-Programming & Editor' },
    { id: 'review' as ActiveTab, label: 'Code Review', icon: ShieldCheck, desc: 'AST & Security Audit' },
    { id: 'learning' as ActiveTab, label: 'Learning Paths', icon: Compass, desc: 'Guided Tracks & Quizzes' },
    { id: 'sandbox' as ActiveTab, label: 'Sandbox Runner', icon: Terminal, desc: 'Isolated Code Execution' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const handlePersonaSelect = (personaId: MentorPersonaId) => {
    onPersonaChange(personaId);
    setIsPersonaDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 shadow-lg text-slate-100 font-sans">
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 gap-2">
        {/* Left: Brand & Desktop Nav */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 select-none"
            onClick={() => handleNavClick('workbench')}
          >
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 shadow-sm shadow-indigo-500/20 border border-indigo-400/30 flex-shrink-0">
              <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#0d1117]" />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-bold text-xs sm:text-sm tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent whitespace-nowrap">
                DevMentor AI
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on XL screens) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Controls: Language Selector, Persona, User Auth, Guide & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Language Selector */}
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 min-h-[36px] sm:min-h-[38px] rounded-lg bg-slate-800/90 border border-indigo-500/40 text-xs flex-shrink-0 shadow-sm">
            <span className="text-indigo-400 font-semibold text-[10px] sm:text-[11px] font-mono whitespace-nowrap hidden xs:inline">
              LANG:
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageSelect(e.target.value as Language)}
              className="bg-transparent text-slate-100 font-bold font-mono text-xs outline-none cursor-pointer pr-1 uppercase whitespace-nowrap focus:text-indigo-300"
              aria-label="Select Programming Language"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="bg-[#161b22] text-slate-100 py-1"
                >
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={onReloadSampleCode}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition flex items-center justify-center flex-shrink-0"
              title="Reload sample code for this language"
            >
              <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>

          {/* Desktop/Tablet Persona Selector Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs transition whitespace-nowrap flex-shrink-0"
              aria-expanded={isPersonaDropdownOpen}
              aria-label="Select AI Mentor Persona"
            >
              <span className="text-sm sm:text-base flex-shrink-0">{currentPersona.avatar}</span>
              <div className="text-left hidden lg:block">
                <div className="text-[11px] font-semibold text-slate-200 leading-tight whitespace-nowrap">
                  {currentPersona.name}
                </div>
                <div className="text-[9px] text-indigo-400 font-sans whitespace-nowrap">
                  {currentPersona.badge}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </button>

            {isPersonaDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPersonaDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-80 p-2 bg-[#161b22] rounded-xl border border-slate-800 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500 whitespace-nowrap">
                    Select Active AI Mentor Persona
                  </div>
                  <div className="space-y-1 mt-1">
                    {Object.values(MENTOR_PERSONAS).map((p) => {
                      const isSelected = p.id === activePersona;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handlePersonaSelect(p.id)}
                          className={`w-full text-left p-2.5 rounded-lg transition flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-indigo-950/60 border border-indigo-500/40 text-white'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <span className="text-2xl mt-0.5 flex-shrink-0">{p.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold whitespace-nowrap truncate">{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 whitespace-nowrap flex-shrink-0">
                                {p.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Authentication Menu / Profile Pill (Desktop/Tablet) */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-indigo-950/60 hover:bg-indigo-950/90 border border-indigo-500/40 text-xs transition whitespace-nowrap flex-shrink-0"
              >
                <span className="text-sm flex-shrink-0">{user.avatar || '👤'}</span>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-200 leading-tight truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-indigo-400 truncate max-w-[110px]">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-indigo-300 flex-shrink-0" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 p-3 bg-[#161b22] rounded-xl border border-slate-800 shadow-2xl z-50 space-y-2.5">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                        {user.avatar || '👤'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 text-xs truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-semibold">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-lg bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-semibold transition whitespace-nowrap"
                    >
                      <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Register</span>
              </button>
            </div>
          )}

          {/* Guide & Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 min-h-[36px] sm:min-h-[38px] min-w-[36px] sm:min-w-[38px] rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition flex items-center justify-center flex-shrink-0"
            title="DevMentor Guide & Tips"
            aria-label="Open DevMentor Guide"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
          </button>

          {/* Mobile Menu Toggle Button (Visible below XL screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`xl:hidden p-2 min-h-[38px] min-w-[38px] rounded-lg border transition flex items-center justify-center flex-shrink-0 ${
              isMobileMenuOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Menu className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Quick Tab Scroll Bar */}
      <div className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Full Mobile Drawer Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden fixed inset-0 top-[92px] sm:top-[98px] bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-Down Drawer Content */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="xl:hidden fixed top-[92px] sm:top-[98px] left-0 right-0 max-h-[calc(100vh-100px)] overflow-y-auto bg-[#161b22] border-b border-slate-700 shadow-2xl z-50 p-4 space-y-4 font-sans"
            >
              {/* User Profile / Auth State Card */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                {isAuthenticated && user ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-[#0d1117] border border-slate-800 flex-shrink-0">
                        {user.avatar || '👤'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-100 truncate">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold whitespace-nowrap">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 min-h-[42px] rounded-lg bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-900/60 text-xs font-semibold transition whitespace-nowrap w-full sm:w-auto flex-shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 whitespace-nowrap"
                    >
                      <LogIn className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('register');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 whitespace-nowrap"
                    >
                      <UserPlus className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Create Account</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Views Section */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1 mb-2">
                  Navigation Views
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex items-start gap-3 w-full p-3 min-h-[52px] rounded-xl text-xs transition whitespace-nowrap ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20 border border-indigo-400/40'
                            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <div className="font-semibold whitespace-nowrap truncate">{item.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-500'} whitespace-nowrap truncate`}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Mentor Persona Selection in Mobile Drawer */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1 mb-2 flex items-center justify-between">
                  <span>Active AI Mentor Persona</span>
                  <span className="text-indigo-400 font-mono text-[10px]">
                    Current: {currentPersona.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(MENTOR_PERSONAS).map((p) => {
                    const isSelected = p.id === activePersona;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handlePersonaSelect(p.id)}
                        className={`flex items-start gap-2.5 p-2.5 min-h-[50px] rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-indigo-950/80 border border-indigo-500/60 text-white shadow-sm'
                            : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-xl mt-0.5 flex-shrink-0">{p.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs whitespace-nowrap truncate">{p.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 whitespace-nowrap flex-shrink-0">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                            {p.title || p.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tips & Shortcuts Trigger */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-semibold transition whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="whitespace-nowrap">View Platform Guide & Shortcuts</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
