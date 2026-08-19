export type Language =
  | 'html'
  | 'css'
  | 'javascript'
  | 'php'
  | 'python'
  | 'typescript';

export type MentorPersonaId = 'architect' | 'security' | 'performance' | 'tutor';

export interface MentorPersona {
  id: MentorPersonaId;
  name: string;
  title: string;
  avatar: string;
  badge: string;
  accentColor: string;
  description: string;
  greeting: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeSnippet?: string;
  suggestedAction?: {
    type: 'apply_code' | 'run_tests' | 'review';
    label: string;
    payload?: string;
  };
}

export interface ReviewIssue {
  id: string;
  line: number;
  severity: 'critical' | 'warning' | 'optimization' | 'best-practice';
  category: 'Security' | 'Performance' | 'Bug' | 'Clean Code' | 'Architecture';
  title: string;
  description: string;
  impact?: string;
  suggestion: string;
  codeSnippet?: string;
  fixSnippet?: string;
}

export interface ComplexityMetrics {
  time: string;
  space: string;
  explanation?: string;
}

export interface CodeReviewResult {
  overallScore: number;
  scores: {
    quality: number;
    performance: number;
    security: number;
    maintainability: number;
    testability: number;
  };
  summary: string;
  complexity?: {
    current: ComplexityMetrics;
    optimized: ComplexityMetrics;
  };
  issues: ReviewIssue[];
  optimizedCode: string;
  keyRecommendations: string[];
  unitTestSuggestions: string[];
}

export interface QuizOption {
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningModule {
  id: string;
  week: number;
  title: string;
  description: string;
  theorySummary?: string;
  codeExample?: string;
  language?: Language;
  keyConcepts: string[];
  handsOnChallenge: {
    title: string;
    description: string;
    starterCode: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  quiz: QuizQuestion[];
  completed?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  totalHours: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior/Architect';
  icon: string;
  category: string;
  modules: LearningModule[];
  capstoneProject: {
    title: string;
    description: string;
    architectureRequirements: string[];
  };
  recommendedBooksAndRFCs: string[];
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: Language;
  code: string;
  tags: string[];
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

