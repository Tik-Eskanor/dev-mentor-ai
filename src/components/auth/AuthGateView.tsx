import React, { useState } from 'react';
import {
  Code2,
  ShieldCheck,
  Terminal,
  Compass,
  Mail,
  Lock,
  User as UserIcon,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLES = [
  'Principal Architect',
  'Senior Security Engineer',
  'Performance Engineer',
  'Full Stack Engineer',
  'Backend Engineer',
  'Frontend Developer',
  'Student / Learner',
];

const DEMO_LOGINS = [
  {
    name: 'Alex Vance',
    role: 'Principal Architect',
    email: 'alex@devmentor.ai',
    password: 'password123',
    avatar: '🏛️',
  },
  {
    name: 'Sarah Connor',
    role: 'Senior Security Engineer',
    email: 'sarah@security.io',
    password: 'password123',
    avatar: '🛡️',
  },
  {
    name: 'Marcus Brody',
    role: 'Full Stack Engineer',
    email: 'marcus@devmentor.ai',
    password: 'password123',
    avatar: '⚡',
  },
];

export const AuthGateView: React.FC = () => {
  const { login, register } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        const msg = 'Please enter your full name (minimum 2 characters).';
        setError(msg);
        toast.warning('Name Required', msg);
        return;
      }
      if (password !== confirmPassword) {
        const msg = 'Passwords do not match. Please verify your confirmation password.';
        setError(msg);
        toast.warning('Password Mismatch', msg);
        return;
      }
      if (password.length < 6) {
        const msg = 'Password must be at least 6 characters long.';
        setError(msg);
        toast.warning('Weak Password', msg);
        return;
      }
    } else {
      if (!email.trim() || !password) {
        const msg = 'Please enter both your email address and password.';
        setError(msg);
        toast.warning('Incomplete Credentials', msg);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ name: name.trim(), email: email.trim(), password, role });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setSuccessMessage(null);
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    try {
      await login({ email: demoEmail, password: demoPass });
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 33;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 34;
    if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 10) score += 33;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Bar */}
      <header className="px-4 sm:px-8 py-4 border-b border-slate-800 bg-[#161b22]/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 shadow-sm shadow-indigo-500/20 border border-indigo-400/30 flex-shrink-0">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              DevMentor AI
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PRO
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-xs text-slate-400 font-medium">
          Sign in required to access workspace
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered Engineering Excellence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Pair-Program with Specialized AI Mentors & Master Clean Code.
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Sign in to your DevMentor account to get real-time multi-persona architectural feedback, automated vulnerability scanning, Socratic learning tracks, and instant code execution.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <Bot className="w-4 h-4 flex-shrink-0" />
                  <span>4 Specialized Personas</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Collaborate with Elena (Architect), Marcus (Security), Aria (Performance), or Devin (Socratic Tutor).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Code Review & Auto-Fix</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deep scans for OWASP vulnerabilities, complexity bottlenecks, and clean code refactorings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                  <Compass className="w-4 h-4 flex-shrink-0" />
                  <span>Interactive Learning Paths</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Multi-language tracks with Socratic quizzes, live coding challenges, and capstone projects.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Terminal className="w-4 h-4 flex-shrink-0" />
                  <span>Multi-Language Sandbox</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Run TypeScript, Python, JavaScript, and PHP with live stdout logs and execution metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 bg-[#161b22] border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {mode === 'login' ? 'Sign In to Workspace' : 'Create DevMentor Account'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {mode === 'login'
                    ? 'Enter your credentials to access your workbench'
                    : 'Register for a personalized developer profile'}
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="p-1 bg-slate-900 rounded-xl border border-slate-800 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Engineering Role Focus
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === 'register' && password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Password strength:</span>
                      <span
                        className={
                          strength >= 80
                            ? 'text-emerald-400 font-semibold'
                            : strength >= 50
                            ? 'text-amber-400 font-semibold'
                            : 'text-rose-400'
                        }
                      >
                        {strength >= 80 ? 'Strong' : strength >= 50 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength >= 80
                            ? 'bg-emerald-500'
                            : strength >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 min-h-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Registering account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Quick Demo Accounts */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>1-Click Test Accounts</span>
                <span className="text-indigo-400">Instant Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_LOGINS.slice(0, 2).map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleQuickDemoLogin(demo.email, demo.password)}
                    disabled={isSubmitting}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-left transition flex items-center gap-2 text-xs group"
                  >
                    <span className="text-base flex-shrink-0">{demo.avatar}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                        {demo.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{demo.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
