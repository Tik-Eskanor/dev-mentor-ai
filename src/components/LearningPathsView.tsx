import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Code2,
  Clock,
  Layers,
  Award,
  Plus,
  Loader2,
  X,
  ArrowRight,
  Search,
  Check,
  Copy,
  Terminal,
  FileCode,
  RotateCcw,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { LearningPath, LearningModule } from '../types';
import { DEFAULT_LEARNING_PATHS } from '../data/defaultData';
import { requestCustomLearningPath } from '../services/mentorApi';

interface LearningPathsViewProps {
  onOpenChallengeInWorkbench: (starterCode: string, language: string) => void;
}

const STORAGE_KEY = 'devmentor_learning_progress_v2';
const CUSTOM_PATHS_KEY = 'devmentor_custom_learning_paths_v2';

const SUGGESTED_TOPICS = [
  'Distributed Key-Value Store & Raft',
  'High-Performance Python Asyncio',
  'Modern PHP 8.3 Hexagonal Core',
  'TypeScript Type-Level Meta-Programming',
  'Low-Latency Async Task Pipelines',
  'OWASP Top 10 Security Architecture',
];

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({
  onOpenChallengeInWorkbench,
}) => {
  // Load stored custom paths
  const [paths, setPaths] = useState<LearningPath[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CUSTOM_PATHS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge custom paths with default paths, avoiding duplicates
            const customIds = new Set(parsed.map((p: LearningPath) => p.id));
            const filteredDefaults = DEFAULT_LEARNING_PATHS.filter((p) => !customIds.has(p.id));
            return [...parsed, ...filteredDefaults];
          }
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_LEARNING_PATHS;
  });

  const [selectedPathId, setSelectedPathId] = useState<string>(paths[0]?.id || 'track-ts-architecture');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    paths[0]?.modules[0]?.id || ''
  );

  // Persistence for completed modules and quiz answers
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.completedModules || [];
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.quizAnswers || {};
        }
      } catch {
        // ignore
      }
    }
    return {};
  });

  const [capstoneChecklist, setCapstoneChecklist] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.capstoneChecklist || {};
        }
      } catch {
        // ignore
      }
    }
    return {};
  });

  // Save progress changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completedModules,
          quizAnswers,
          capstoneChecklist,
        })
      );
    } catch {
      // ignore
    }
  }, [completedModules, quizAnswers, capstoneChecklist]);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI state
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [activeLessonTab, setActiveLessonTab] = useState<'theory' | 'challenge' | 'quiz' | 'capstone'>('theory');
  const [mobileTab, setMobileTab] = useState<'tracks' | 'modules' | 'content'>('tracks');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Custom Roadmap Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customLevel, setCustomLevel] = useState('Intermediate');
  const [customGoal, setCustomGoal] = useState('');
  const [customHours, setCustomHours] = useState(8);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [genStep, setGenStep] = useState(0);

  // Active path & module resolution
  const currentPath = useMemo(() => {
    return paths.find((p) => p.id === selectedPathId) || paths[0] || DEFAULT_LEARNING_PATHS[0];
  }, [paths, selectedPathId]);

  const currentModule: LearningModule = useMemo(() => {
    return (
      currentPath.modules.find((m) => m.id === selectedModuleId) ||
      currentPath.modules[0] || {
        id: 'fallback-mod',
        week: 1,
        title: 'Introduction to Architecture',
        description: 'Core fundamentals',
        keyConcepts: [],
        handsOnChallenge: {
          title: 'Initial Setup',
          description: 'Get started',
          starterCode: '// Starter code',
          difficulty: 'Beginner',
        },
        quiz: [],
      }
    );
  }, [currentPath, selectedModuleId]);

  // Categories available for filtering
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    paths.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [paths]);

  // Filtered tracks
  const filteredPaths = useMemo(() => {
    return paths.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'All' || p.skillLevel === selectedDifficulty;
      const matchQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchDiff && matchQuery;
    });
  }, [paths, selectedCategory, selectedDifficulty, searchQuery]);

  // Track completion calculations
  const isPathCompleted = useMemo(() => {
    if (!currentPath.modules || currentPath.modules.length === 0) return false;
    return currentPath.modules.every((m) => completedModules.includes(m.id));
  }, [currentPath, completedModules]);

  const pathProgressPercent = useMemo(() => {
    if (!currentPath.modules || currentPath.modules.length === 0) return 0;
    const done = currentPath.modules.filter((m) => completedModules.includes(m.id)).length;
    return Math.round((done / currentPath.modules.length) * 100);
  }, [currentPath, completedModules]);

  // Quiz score for current module
  const currentQuizScore = useMemo(() => {
    if (!currentModule.quiz || currentModule.quiz.length === 0) return null;
    let correct = 0;
    let answered = 0;
    currentModule.quiz.forEach((q, idx) => {
      const key = `${currentModule.id}-q-${idx}`;
      if (quizAnswers[key] !== undefined) {
        answered++;
        if (quizAnswers[key] === q.correctIndex) correct++;
      }
    });
    return { correct, answered, total: currentModule.quiz.length };
  }, [currentModule, quizAnswers]);

  // Handlers
  const handleGenerateCustomPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || isGeneratingPath) return;

    setIsGeneratingPath(true);
    setGenStep(1);

    const stepTimer = setInterval(() => {
      setGenStep((s) => (s < 3 ? s + 1 : s));
    }, 1400);

    try {
      const newPath = await requestCustomLearningPath({
        topic: customTopic,
        currentLevel: customLevel,
        targetGoal: customGoal || `Mastery of ${customTopic} architecture`,
        hoursPerWeek: customHours,
      });

      const uniqueId = `custom-track-${Date.now()}`;
      const pathWithId: LearningPath = {
        ...newPath,
        id: uniqueId,
        icon: newPath.icon || '🚀',
        category: newPath.category || 'Custom AI Track',
        modules: newPath.modules.map((m, idx) => ({
          ...m,
          id: `${uniqueId}-mod-${idx + 1}`,
          week: idx + 1,
        })),
      };

      setPaths((prev) => {
        const updated = [pathWithId, ...prev];
        try {
          const customOnly = updated.filter((p) => p.id.startsWith('custom-track-'));
          localStorage.setItem(CUSTOM_PATHS_KEY, JSON.stringify(customOnly));
        } catch {
          // ignore
        }
        return updated;
      });

      setSelectedPathId(pathWithId.id);
      setSelectedModuleId(pathWithId.modules[0]?.id || '');
      setShowGenerateModal(false);
      setCustomTopic('');
      setCustomGoal('');
      setMobileTab('content');
    } catch (err: any) {
      console.error('Failed to generate learning path:', err);
    } finally {
      clearInterval(stepTimer);
      setIsGeneratingPath(false);
      setGenStep(0);
    }
  };

  const handleSelectQuizOption = (questionIdx: number, optionIdx: number) => {
    const key = `${currentModule.id}-q-${questionIdx}`;
    setQuizAnswers((prev) => ({ ...prev, [key]: optionIdx }));
  };

  const handleResetQuizForModule = () => {
    setQuizAnswers((prev) => {
      const next = { ...prev };
      currentModule.quiz.forEach((_, idx) => {
        delete next[`${currentModule.id}-q-${idx}`];
      });
      return next;
    });
  };

  const toggleModuleCompletion = (modId: string) => {
    setCompletedModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const handleCopyCode = (codeText: string, key: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const handleResetAllProgress = () => {
    if (window.confirm('Are you sure you want to reset all your learning path progress and quiz scores?')) {
      setCompletedModules([]);
      setQuizAnswers({});
      setCapstoneChecklist({});
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const currentModuleLanguage = currentModule.language || 'typescript';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] bg-[#0d1117] overflow-hidden text-slate-100 font-sans">
      {/* Mobile Top Sub-Nav Switcher */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setMobileTab('tracks')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileTab === 'tracks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Tracks</span>
          </button>
          <button
            onClick={() => setMobileTab('modules')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileTab === 'modules'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Syllabus</span>
          </button>
          <button
            onClick={() => setMobileTab('content')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-semibold whitespace-nowrap transition ${
              mobileTab === 'content'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Lesson</span>
          </button>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm whitespace-nowrap flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          <span>New Track</span>
        </button>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Column 1: Learning Paths List & Search */}
        <div
          className={`w-full lg:w-80 xl:w-96 bg-[#161b22] border-r border-slate-800 flex-col overflow-hidden min-h-0 ${
            mobileTab === 'tracks' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 space-y-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                  <Compass className="w-4 h-4 flex-shrink-0" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-200 whitespace-nowrap">Learning Tracks</h2>
                  <p className="text-[11px] text-slate-400 whitespace-nowrap">Structured engineering roadmaps</p>
                </div>
              </div>

              <button
                onClick={() => setShowGenerateModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm whitespace-nowrap flex-shrink-0"
                title="Generate Custom Path with AI"
              >
                <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                <span>AI Roadmap</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, topics, languages..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs min-h-0">
            {filteredPaths.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                <p>No tracks match your filter criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedDifficulty('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredPaths.map((p) => {
                const isSelected = p.id === currentPath.id;
                const completedCount = p.modules.filter((m) => completedModules.includes(m.id)).length;
                const progressPercent = Math.round((completedCount / (p.modules.length || 1)) * 100);
                const isAllDone = completedCount === p.modules.length && p.modules.length > 0;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPathId(p.id);
                      setSelectedModuleId(p.modules[0]?.id || '');
                      setMobileTab('modules');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/70 border border-indigo-500/50 text-white shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl flex-shrink-0">{p.icon || '🚀'}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {p.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isAllDone && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                          {p.skillLevel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-xs text-slate-100 leading-snug line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Progress Bar & Hours */}
                    <div className="pt-2 space-y-1.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" /> {p.totalHours} hrs • {p.estimatedWeeks} wks
                        </span>
                        <span className="font-semibold text-slate-300">{progressPercent}% completed</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Reset progress footer */}
          <div className="p-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 bg-slate-900/30 flex-shrink-0">
            <span>{completedModules.length} lessons completed</span>
            <button
              onClick={handleResetAllProgress}
              className="text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
              title="Reset all learning progress"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Column 2: Module Syllabus */}
        <div
          className={`w-full lg:w-72 xl:w-80 bg-[#0d1117] border-r border-slate-800 flex-col overflow-hidden min-h-0 ${
            mobileTab === 'modules' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          {/* Path Header info */}
          <div className="p-3.5 border-b border-slate-800 bg-[#161b22]/40 flex-shrink-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Curriculum Modules
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {currentPath.modules.filter((m) => completedModules.includes(m.id)).length} /{' '}
                {currentPath.modules.length} Completed
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              {currentPath.title}
            </h3>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs min-h-0">
            {currentPath.modules.map((mod) => {
              const isSelected = mod.id === currentModule.id;
              const isCompleted = completedModules.includes(mod.id);

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setMobileTab('content');
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/60 shadow-sm text-white'
                      : 'bg-slate-900/40 hover:bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModuleCompletion(mod.id);
                    }}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition flex-shrink-0"
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600 hover:border-indigo-400 flex-shrink-0" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase whitespace-nowrap">
                        Week {mod.week}
                      </span>
                      {mod.language && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {mod.language}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs mt-0.5 text-slate-100 truncate">
                      {mod.title}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Capstone Milestone Card in Syllabus */}
            <div
              onClick={() => {
                setActiveLessonTab('capstone');
                setMobileTab('content');
              }}
              className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-900 border border-indigo-500/30 text-xs cursor-pointer hover:border-indigo-400 transition space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Capstone Milestone</span>
                </div>
                {isPathCompleted && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Unlocked
                  </span>
                )}
              </div>
              <div className="font-semibold text-slate-200 leading-snug">
                {currentPath.capstoneProject.title}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {currentPath.capstoneProject.description}
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Active Module Lesson & Challenge View */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5 text-xs bg-[#0d1117] min-h-0 ${
            mobileTab === 'content' ? 'flex flex-col flex-1' : 'hidden lg:block'
          }`}
        >
          {/* Lesson Header */}
          <div className="pb-4 border-b border-slate-800 flex-shrink-0 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <span>Week {currentModule.week} Milestone</span>
                <span>•</span>
                <span>{currentPath.category}</span>
                {currentModule.language && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{currentModule.language}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleModuleCompletion(currentModule.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border whitespace-nowrap flex-shrink-0 ${
                    completedModules.includes(currentModule.id)
                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      completedModules.includes(currentModule.id)
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>
                    {completedModules.includes(currentModule.id)
                      ? 'Module Completed'
                      : 'Mark Complete'}
                  </span>
                </button>

                {isPathCompleted && (
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition whitespace-nowrap flex-shrink-0"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-tight">
              {currentModule.title}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              {currentModule.description}
            </p>

            {/* Lesson Navigation Subtabs */}
            <div className="flex items-center gap-1 pt-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveLessonTab('theory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeLessonTab === 'theory'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Theory & Concepts</span>
              </button>

              <button
                onClick={() => setActiveLessonTab('challenge')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeLessonTab === 'challenge'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Hands-on Challenge</span>
              </button>

              {currentModule.quiz && currentModule.quiz.length > 0 && (
                <button
                  onClick={() => setActiveLessonTab('quiz')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activeLessonTab === 'quiz'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Knowledge Check</span>
                  {currentQuizScore && currentQuizScore.answered > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-indigo-300">
                      {currentQuizScore.correct}/{currentQuizScore.total}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveLessonTab('capstone')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeLessonTab === 'capstone'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Capstone Project</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Theory & Architectural Deep-Dive */}
          {activeLessonTab === 'theory' && (
            <div className="space-y-5">
              {/* Theory Summary Card */}
              {currentModule.theorySummary && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                    <Zap className="w-4 h-4 flex-shrink-0" />
                    <span>Architectural Principle</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentModule.theorySummary}
                  </p>
                </div>
              )}

              {/* Key Concepts Grid */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Core Invariants & Concepts Mastered</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentModule.keyConcepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0d1117] border border-slate-800 hover:border-slate-700 transition flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 text-xs leading-relaxed">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Example / Pattern Walkthrough */}
              {currentModule.codeExample && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
                      <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span>Production Pattern Reference</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopyCode(currentModule.codeExample || '', `example-${currentModule.id}`)
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
                      >
                        {copiedCodeKey === `example-${currentModule.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Pattern</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          onOpenChallengeInWorkbench(
                            currentModule.codeExample || '',
                            currentModuleLanguage
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
                      >
                        <span>Open in Workbench</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117]">
                    <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed scrollbar-thin">
                      <code>{currentModule.codeExample}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Next step prompt */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => setActiveLessonTab('challenge')}
                  className="flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-md shadow-indigo-600/20 text-xs"
                >
                  <span>Proceed to Hands-on Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Hands-on Coding Challenge */}
          {activeLessonTab === 'challenge' && (
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 flex-shrink-0">
                      <Code2 className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-indigo-300">
                        Interactive Mission
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate">
                        {currentModule.handsOnChallenge.title}
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 whitespace-nowrap flex-shrink-0">
                    {currentModule.handsOnChallenge.difficulty}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentModule.handsOnChallenge.description}
                </p>

                {/* Starter Code Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">Starter Boilerplate ({currentModuleLanguage})</span>
                    <button
                      onClick={() =>
                        handleCopyCode(
                          currentModule.handsOnChallenge.starterCode,
                          `challenge-${currentModule.id}`
                        )
                      }
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      {copiedCodeKey === `challenge-${currentModule.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117]">
                    <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-64 scrollbar-thin">
                      <code>{currentModule.handsOnChallenge.starterCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Loads directly into the IDE editor with sandbox execution support.
                  </span>
                  <button
                    onClick={() =>
                      onOpenChallengeInWorkbench(
                        currentModule.handsOnChallenge.starterCode,
                        currentModuleLanguage
                      )
                    }
                    className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
                  >
                    <span>Launch in Workbench</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Knowledge Check Quiz */}
          {activeLessonTab === 'quiz' && (
            <div className="space-y-4">
              {/* Quiz Header & Score */}
              <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-100 text-xs sm:text-sm">
                      Socratic Knowledge Check
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Verify your conceptual understanding before moving forward
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentQuizScore && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-bold text-xs">
                      Score: {currentQuizScore.correct} / {currentQuizScore.total}
                    </span>
                  )}
                  <button
                    onClick={handleResetQuizForModule}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                    title="Reset quiz answers for this module"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Questions */}
              {currentModule.quiz && currentModule.quiz.length > 0 ? (
                currentModule.quiz.map((q, qIdx) => {
                  const answerKey = `${currentModule.id}-q-${qIdx}`;
                  const selectedOption = quizAnswers[answerKey];
                  const hasAnswered = selectedOption !== undefined;
                  const isCorrect = selectedOption === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-slate-800"
                    >
                      <div className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                        {qIdx + 1}. {q.question}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOption === optIdx;
                          const isThisCorrect = optIdx === q.correctIndex;

                          let btnClasses =
                            'border-slate-800 bg-[#0d1117] text-slate-300 hover:bg-slate-800/80';
                          if (hasAnswered) {
                            if (isThisCorrect) {
                              btnClasses =
                                'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-medium';
                            } else if (isThisSelected && !isCorrect) {
                              btnClasses = 'border-rose-500/60 bg-rose-950/40 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={`w-full text-left p-3 min-h-[40px] rounded-xl border text-xs transition flex items-center justify-between gap-2.5 ${btnClasses}`}
                            >
                              <span className="leading-relaxed">{opt}</span>
                              {hasAnswered && isThisCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                              {hasAnswered && isThisSelected && !isCorrect && (
                                <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div
                          className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-900/40'
                              : 'bg-amber-950/30 text-amber-300 border border-amber-900/40'
                          }`}
                        >
                          <strong>{isCorrect ? '✓ Correct! ' : 'Explanation: '}</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-500">
                  No quiz questions configured for this module.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Capstone Project & References */}
          {activeLessonTab === 'capstone' && (
            <div className="space-y-5">
              {/* Capstone Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-900 border border-indigo-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-300">
                        Final Capstone Project
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-100">
                        {currentPath.capstoneProject.title}
                      </h2>
                    </div>
                  </div>

                  {isPathCompleted && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Eligible for Submission
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentPath.capstoneProject.description}
                </p>

                {/* Architecture Requirements Checklist */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Architectural Requirements Checklist
                  </h4>
                  <div className="space-y-2">
                    {currentPath.capstoneProject.architectureRequirements.map((req, idx) => {
                      const checkKey = `${currentPath.id}-req-${idx}`;
                      const isChecked = !!capstoneChecklist[checkKey];

                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setCapstoneChecklist((prev) => ({
                              ...prev,
                              [checkKey]: !prev[checkKey],
                            }))
                          }
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : 'bg-[#0d1117] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-slate-600'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-xs leading-relaxed">{req}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recommended Books, Whitepapers & RFCs */}
              {currentPath.recommendedBooksAndRFCs &&
                currentPath.recommendedBooksAndRFCs.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span>Authoritative Reference Material & RFCs</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentPath.recommendedBooksAndRFCs.map((ref, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#0d1117] border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{ref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* AI Custom Roadmap Synthesizer Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-[#161b22] border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    Generate Custom Learning Roadmap
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    AI synthesizes weekly milestones, challenges, and Socratic quizzes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateCustomPath} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target Topic / Architecture Focus:
                </label>
                <input
                  type="text"
                  required
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Go, Async Python Microservices..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 min-h-[38px]"
                />

                {/* Suggested prompt chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setCustomTopic(topic)}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-indigo-300 transition"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Current Skill Level:
                  </label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[38px]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Senior/Architect">Senior / Architect</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Study Hours / Week:
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={40}
                    value={customHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[38px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Specific Career or Technical Goal (Optional):
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Pass Staff Engineer Systems Design, Deploy production engine"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 min-h-[38px]"
                />
              </div>

              {isGeneratingPath && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span>
                      {genStep === 1 && 'Structuring progressive weekly milestones...'}
                      {genStep === 2 && 'Synthesizing runnable coding challenges...'}
                      {genStep >= 3 && 'Formulating Socratic knowledge check quizzes...'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${Math.min(95, (genStep + 1) * 30)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingPath || !customTopic.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 min-h-[38px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/30 disabled:opacity-50 whitespace-nowrap"
                >
                  {isGeneratingPath ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-[#161b22] to-slate-900 border border-amber-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Milestone Achievement
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                Track Mastery Completed
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                {currentPath.title}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Total Effort: <strong className="text-slate-200">{currentPath.totalHours} Hours</strong></div>
              <div>Skill Level: <strong className="text-slate-200">{currentPath.skillLevel}</strong></div>
              <div>Status: <strong className="text-emerald-400">100% Modules Verified</strong></div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-6 py-2.5 min-h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
