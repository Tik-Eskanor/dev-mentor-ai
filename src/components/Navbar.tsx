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
import { Language, MentorPersonaId } from '../types/index';
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm text-slate-800 font-sans">
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 gap-2">
        {/* Left: Brand & Desktop Nav */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 select-none"
            onClick={() => handleNavClick('workbench')}
          >
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 shadow-sm shadow-purple-500/20 border border-purple-400/30 flex-shrink-0">
              <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 whitespace-nowrap">
                Techtor
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on XL screens) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
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
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 min-h-[36px] sm:min-h-[38px] rounded-lg bg-slate-100 border border-purple-200/80 text-xs flex-shrink-0 shadow-sm">
            <span className="text-purple-700 font-semibold text-[10px] sm:text-[11px] font-mono whitespace-nowrap hidden xs:inline">
              LANG:
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageSelect(e.target.value as Language)}
              className="bg-transparent text-slate-800 font-bold font-mono text-xs outline-none cursor-pointer pr-1 uppercase whitespace-nowrap focus:text-purple-700"
              aria-label="Select Programming Language"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="bg-white text-slate-800 py-1"
                >
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={onReloadSampleCode}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-purple-700 transition flex items-center justify-center flex-shrink-0"
              title="Reload sample code for this language"
            >
              <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>

          {/* Desktop/Tablet Persona Selector Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-xs transition whitespace-nowrap flex-shrink-0"
              aria-expanded={isPersonaDropdownOpen}
              aria-label="Select AI Mentor Persona"
            >
              <span className="text-sm sm:text-base flex-shrink-0">{currentPersona.avatar}</span>
              <div className="text-left hidden lg:block">
                <div className="text-[11px] font-semibold text-slate-800 leading-tight whitespace-nowrap">
                  {currentPersona.name}
                </div>
                <div className="text-[9px] text-purple-600 font-sans whitespace-nowrap">
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
                <div className="absolute right-0 mt-1.5 w-80 p-2 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
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
                              ? 'bg-purple-50 border border-purple-300 text-purple-950'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-2xl mt-0.5 flex-shrink-0">{p.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold whitespace-nowrap truncate">{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap flex-shrink-0">
                                {p.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
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
                className="flex items-center gap-2 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-xs transition whitespace-nowrap flex-shrink-0"
              >
                <span className="text-sm flex-shrink-0">{user.avatar || '👤'}</span>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-purple-700 truncate max-w-[110px]">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-purple-500 flex-shrink-0" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 p-3 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 space-y-2.5">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0">
                        {user.avatar || '👤'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 text-[9px] font-semibold">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition whitespace-nowrap"
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
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition whitespace-nowrap flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm shadow-purple-600/20 whitespace-nowrap flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Register</span>
              </button>
            </div>
          )}

          {/* Guide & Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 min-h-[36px] sm:min-h-[38px] min-w-[36px] sm:min-w-[38px] rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-center flex-shrink-0"
            title="Techtor Guide & Tips"
            aria-label="Open Techtor Guide"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
          </button>

          {/* Mobile Menu Toggle Button (Visible below XL screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`xl:hidden p-2 min-h-[38px] min-w-[38px] rounded-lg border transition flex items-center justify-center flex-shrink-0 ${
              isMobileMenuOpen
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm'
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
      <div className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden fixed inset-0 top-[92px] sm:top-[98px] bg-black/40 backdrop-blur-xs z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-Down Drawer Content */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="xl:hidden fixed top-[92px] sm:top-[98px] left-0 right-0 max-h-[calc(100vh-100px)] overflow-y-auto bg-white border-b border-purple-100 shadow-2xl z-50 p-4 space-y-4 font-sans text-slate-800"
            >
              {/* User Profile / Auth State Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                {isAuthenticated && user ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-white border border-slate-200 flex-shrink-0">
                        {user.avatar || '👤'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-semibold whitespace-nowrap">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 min-h-[42px] rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition whitespace-nowrap w-full sm:w-auto flex-shrink-0"
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
                      className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm whitespace-nowrap"
                    >
                      <LogIn className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('register');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/20 whitespace-nowrap"
                    >
                      <UserPlus className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Create Account</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Views Section */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1 mb-2">
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
                            ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20 border border-purple-400'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <div className="font-semibold whitespace-nowrap truncate">{item.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-purple-100' : 'text-slate-500'} whitespace-nowrap truncate`}>
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
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1 mb-2 flex items-center justify-between">
                  <span>Active AI Mentor Persona</span>
                  <span className="text-purple-600 font-mono text-[10px]">
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
                            ? 'bg-purple-50 border border-purple-300 text-purple-950 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xl mt-0.5 flex-shrink-0">{p.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs whitespace-nowrap truncate">{p.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap flex-shrink-0">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
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
                  className="w-full flex items-center justify-center gap-2 p-2.5 min-h-[40px] rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
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
