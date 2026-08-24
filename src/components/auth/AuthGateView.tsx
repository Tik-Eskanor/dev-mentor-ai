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
    <div className="min-h-screen bg-[#f8f9fd] text-slate-800 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-900">
      {/* Header Bar */}
      <header className="px-4 sm:px-8 py-4 border-b border-purple-100 bg-white/90 backdrop-blur-md flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 shadow-sm shadow-purple-500/20 border border-purple-400/30 flex-shrink-0">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
              Techtor
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-xs text-slate-500 font-medium">
          Sign in required to access workspace
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI-Powered Engineering Excellence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Pair-Program with Specialized AI Mentors & Master Clean Code.
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Sign in to your Techtor account to get real-time multi-persona architectural feedback, automated vulnerability scanning, Socratic learning tracks, and instant code execution.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                  <Bot className="w-4 h-4 flex-shrink-0 text-purple-600" />
                  <span>4 Specialized Personas</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Collaborate with Elena (Architect), Marcus (Security), Kai (Performance), or Sophia (Socratic Tutor).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>Code Review & Auto-Fix</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Deep scans for OWASP vulnerabilities, complexity bottlenecks, and clean code refactorings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
                  <Compass className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                  <span>Interactive Learning Paths</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Multi-language tracks with Socratic quizzes, live coding challenges, and capstone projects.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs">
                  <Terminal className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>Multi-Language Sandbox</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Run TypeScript, Python, JavaScript, and PHP with live stdout logs and execution metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 bg-white border border-purple-200/80 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {mode === 'login' ? 'Sign In to Workspace' : 'Create Techtor Account'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === 'login'
                    ? 'Enter your credentials to access your workbench'
                    : 'Register for a personalized developer profile'}
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white text-xs transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Engineering Role Focus
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white text-xs transition"
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
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 min-h-[40px] rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === 'register' && password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Password strength:</span>
                      <span
                        className={
                          strength >= 80
                            ? 'text-emerald-600 font-semibold'
                            : strength >= 50
                            ? 'text-amber-600 font-semibold'
                            : 'text-rose-600'
                        }
                      >
                        {strength >= 80 ? 'Strong' : strength >= 50 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
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
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white text-xs transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 min-h-[42px] rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
          </div>
        </div>
      </div>
    </div>
  );
};
