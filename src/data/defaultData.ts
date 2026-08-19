import { LearningPath, MentorPersona, Language } from '../types';

export const MENTOR_PERSONAS: Record<string, MentorPersona> = {
  architect: {
    id: 'architect',
    name: 'Elena Vance',
    title: 'Principal Staff Architect',
    avatar: '🏛️',
    badge: 'System Design & Clean Code',
    accentColor: 'indigo',
    description: 'Specializes in scalable system architecture, SOLID principles, clean modular abstractions, and high-level design trade-offs.',
    greeting: 'Hello! I am Elena. Let us inspect your system architecture, evaluate design trade-offs, and ensure your code is decoupled, robust, and enterprise-ready.',
  },
  security: {
    id: 'security',
    name: 'Marcus "Cipher" Thorne',
    title: 'Offensive Security & Hardening Lead',
    avatar: '🛡️',
    badge: 'OWASP & Zero-Trust',
    accentColor: 'rose',
    description: 'Relentless focus on threat modeling, input validation, memory safety, cryptographic sanity, authentication flows, and OWASP Top 10 prevention.',
    greeting: 'Greetings. I am Marcus. I will analyze your attack surfaces, audit serialization boundaries, and sanitize potential vulnerabilities before they reach production.',
  },
  performance: {
    id: 'performance',
    name: 'Kai Chen',
    title: 'Low-Latency & Performance Guru',
    avatar: '⚡',
    badge: 'Zero-Copy & Big-O Master',
    accentColor: 'amber',
    description: 'Obsessed with algorithmic complexity, memory cache locality, zero-copy pipelines, event-loop starvation, and database index tuning.',
    greeting: 'Welcome. I am Kai. Let’s eliminate unnecessary allocations, optimize your Big-O time and space complexity, and make this code blazingly fast.',
  },
  tutor: {
    id: 'tutor',
    name: 'Sophia Patel',
    title: 'Senior Developer Educator',
    avatar: '🌱',
    badge: 'Socratic Tutor & Mentorship',
    accentColor: 'emerald',
    description: 'Patient, intuitive mentor who breaks down daunting concepts using clear mental models, visual diagrams, and guided Socratic reasoning.',
    greeting: 'Hi there! I am Sophia. No question is too basic. We will take this step-by-step, build deep intuition, and level up your engineering skills together.',
  },
};

export interface LanguageOption {
  id: Language;
  label: string;
  shortLabel: string;
  category: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'html', label: 'HTML', shortLabel: 'HTML', category: 'Web Markup' },
  { id: 'css', label: 'CSS', shortLabel: 'CSS', category: 'Styling & Layout' },
  { id: 'javascript', label: 'JavaScript', shortLabel: 'JS', category: 'Scripting & Frontend' },
  { id: 'php', label: 'PHP', shortLabel: 'PHP', category: 'Backend & Server' },
  { id: 'python', label: 'Python', shortLabel: 'Python', category: 'Data & Backend' },
  { id: 'typescript', label: 'TypeScript', shortLabel: 'TS', category: 'Typed Systems' },
];

export const LANGUAGE_SAMPLES: Record<Language, { title: string; language: Language; code: string; description: string }> = {
  html: {
    title: 'HTML5 Semantic Web Canvas & Interactive Counter',
    language: 'html',
    description: 'Semantic HTML5 structure with accessible ARIA roles, modern styling, and live DOM scripting.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DevMentor Interactive Counter & Canvas</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 1.75rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: #ffffff; }
    p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
    .counter-display {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #0d1117;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #1e293b;
    }
    .stat-number { font-size: 2.5rem; font-weight: 800; color: #38bdf8; font-family: monospace; }
    .actions { display: flex; gap: 0.75rem; }
    .btn {
      flex: 1;
      padding: 0.65rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary { background: #6366f1; color: #ffffff; }
    .btn-secondary { background: #334155; color: #cbd5e1; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <main class="card" role="region" aria-labelledby="main-heading">
    <span class="badge">HTML5 + Native Script</span>
    <h1 id="main-heading">DevMentor Interactive Showcase</h1>
    <p>Clean semantic markup paired with high-performance local DOM state manipulation.</p>

    <div class="counter-display">
      <div class="stat-number" id="counterDisplay">0</div>
      <p style="margin: 0; font-size: 0.75rem;">Total user interactions recorded</p>
    </div>

    <div class="actions">
      <button class="btn btn-primary" id="incBtn" onclick="increment()">Increment +1</button>
      <button class="btn btn-secondary" id="resetBtn" onclick="resetCount()">Reset</button>
    </div>
  </main>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('counterDisplay').innerText = count;
    }
    function resetCount() {
      count = 0;
      document.getElementById('counterDisplay').innerText = count;
    }
  </script>
</body>
</html>`,
  },

  css: {
    title: 'Modern CSS3 Design System with Variables & Grid',
    language: 'css',
    description: 'Custom properties, responsive CSS grid, glassmorphism cards, and keyframe animations.',
    code: `/* Modern CSS3 Design System: Custom Properties, Grid, & Fluid Animations */

:root {
  --primary-hue: 245;
  --color-primary: hsl(var(--primary-hue), 85%, 60%);
  --color-surface: #0f172a;
  --color-card: rgba(30, 41, 59, 0.75);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text-main: #f8fafc;
  --color-text-muted: #94a3b8;
  
  --radius-lg: 16px;
  --radius-pill: 9999px;
  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 25px -5px hsla(var(--primary-hue), 85%, 60%, 0.35);
  --transition-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Fluid Responsive Grid */
.dashboard-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Glassmorphism Surface Card */
.glass-card {
  position: relative;
  background: var(--color-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s var(--transition-smooth), border-color 0.3s ease;
  overflow: hidden;
}

.glass-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: var(--shadow-glow);
}

/* Status Indicator with Pulse Keyframes */
@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-pill);
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-weight: 600;
  font-size: 0.75rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-ring 2s infinite ease-in-out;
}`,
  },

  javascript: {
    title: 'JavaScript (ES2024): Async Concurrency Queue & Metrics',
    language: 'javascript',
    description: 'Asynchronous task queue with rate limiter, promise deduplication, and execution diagnostics.',
    code: `// Modern JavaScript (ES2024): Async Task Queue with Concurrency Limiter

class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  // Push an async task to the bounded queue
  async add(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { taskFn, resolve, reject } = this.queue.shift();
    this.running++;

    try {
      const result = await taskFn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.processNext();
    }
  }
}

// Execution Benchmark
async function runDemo() {
  const queue = new TaskQueue(2);
  const tasks = [120, 200, 60, 180, 90];

  console.log("🚀 Starting Concurrent Task Queue Benchmark...");
  const start = performance.now();

  const promises = tasks.map((ms, index) => 
    queue.add(async () => {
      console.log(\`[Task \${index + 1}] Processing (Simulated \${ms}ms)...\`);
      await new Promise(r => setTimeout(r, ms));
      return { taskId: index + 1, processedMs: ms };
    })
  );

  const results = await Promise.all(promises);
  const totalDuration = (performance.now() - start).toFixed(2);

  console.log("✅ All tasks completed in:", totalDuration, "ms");
  console.log("Task Summary:", results);
  return { results, totalDurationMs: totalDuration };
}

return runDemo();`,
  },

  php: {
    title: 'PHP 8.3: Readonly Domain Entity & Match Expressions',
    language: 'php',
    description: 'Modern PHP 8.3 object model with readonly classes, typed properties, and enum match dispatch.',
    code: `<?php
declare(strict_types=1);

namespace DevMentor\\Domain;

// Modern PHP 8.3: Readonly Class, Enum Pattern, & Access Policy
readonly class UserAccount
{
    public function __construct(
        public string $id,
        public string $email,
        public UserRole $role,
        public \\DateTimeImmutable $createdAt,
        private string $passwordHash,
    ) {}

    public function canAccessSecurityAudit(): bool
    {
        return match($this->role) {
            UserRole::SuperAdmin, UserRole::SecurityLead => true,
            UserRole::Architect, UserRole::SeniorDeveloper => true,
            UserRole::JuniorDeveloper, UserRole::Guest => false,
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role->value,
            'created_at' => $this->createdAt->format(\\DateTimeInterface::ATOM),
            'has_audit_access' => $this->canAccessSecurityAudit(),
        ];
    }
}

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case SecurityLead = 'security_lead';
    case Architect = 'architect';
    case SeniorDeveloper = 'senior_dev';
    case JuniorDeveloper = 'junior_dev';
    case Guest = 'guest';
}

// Simulated Execution
$user = new UserAccount(
    id: "usr_9984",
    email: "marcus.thorne@devmentor.ai",
    role: UserRole::SecurityLead,
    createdAt: new \\DateTimeImmutable(),
    passwordHash: password_hash("HardenedPassword123!", PASSWORD_ARGON2ID)
);

echo "User created successfully:\n";
print_r($user->toArray());`,
  },

  python: {
    title: 'Python 3.12: Async Telemetry Collector & Dataclasses',
    language: 'python',
    description: 'Asynchronous rate-limited telemetry pipeline with dataclasses, asyncio locks, and statistics.',
    code: `# Modern Python 3.12: Asynchronous Rate-Limited Pipeline with Dataclasses
import asyncio
import time
from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class MetricRecord:
    endpoint: str
    response_time_ms: float
    status_code: int
    timestamp: float = field(default_factory=time.time)

class RateLimitedMetricsCollector:
    def __init__(self, rate_limit_rps: int = 10):
        self.rate_limit_rps = rate_limit_rps
        self._lock = asyncio.Lock()
        self._last_request_time: float = 0.0
        self.records: List[MetricRecord] = []

    async def record_metric(self, endpoint: str, latency: float, status: int = 200) -> MetricRecord:
        async with self._lock:
            now = asyncio.get_event_loop().time()
            elapsed = now - self._last_request_time
            min_interval = 1.0 / self.rate_limit_rps

            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)

            self._last_request_time = asyncio.get_event_loop().time()
            record = MetricRecord(endpoint=endpoint, response_time_ms=latency, status_code=status)
            self.records.append(record)
            return record

    def get_summary(self) -> Dict[str, Any]:
        if not self.records:
            return {"total_requests": 0, "avg_latency_ms": 0.0}
        
        avg_latency = sum(r.response_time_ms for r in self.records) / len(self.records)
        return {
            "total_requests": len(self.records),
            "avg_latency_ms": round(avg_latency, 2),
            "max_latency_ms": max(r.response_time_ms for r in self.records),
            "healthy": all(r.status_code < 400 for r in self.records)
        }

async def main():
    collector = RateLimitedMetricsCollector(rate_limit_rps=10)
    endpoints = ["/api/review", "/api/chat", "/api/refactor", "/api/metrics"]
    
    print("Collecting telemetry data across distributed services...")
    tasks = [
        collector.record_metric(ep, latency=35.0 + (i * 8.5)) 
        for i, ep in enumerate(endpoints)
    ]
    await asyncio.gather(*tasks)
    
    summary = collector.get_summary()
    print("Telemetry Summary:", summary)
    return summary

if __name__ == "__main__":
    asyncio.run(main())`,
  },

  typescript: {
    title: 'TypeScript 5: Generic LRU Cache & Result Monad',
    language: 'typescript',
    description: 'Generic LRU cache with capacity eviction, TTL expiration, and strongly typed Result pattern.',
    code: `// Modern TypeScript 5: Strongly Typed Result Pattern & Resilient LRU Cache

type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export class LRUCache<K extends string | number, V> {
  private cache = new Map<K, CacheEntry<V>>();

  constructor(
    private readonly capacity: number = 100,
    private readonly defaultTTLMs: number = 60000
  ) {}

  public get(key: K): Result<V, string> {
    const entry = this.cache.get(key);

    if (!entry) {
      return { success: false, error: \`Key '\${String(key)}' not found in cache\` };
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return { success: false, error: \`Key '\${String(key)}' has expired\` };
    }

    // Refresh LRU order: delete and re-insert
    this.cache.delete(key);
    this.cache.set(key, entry);

    return { success: true, data: entry.value };
  }

  public set(key: K, value: V, ttlMs: number = this.defaultTTLMs): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first element in Map insertion order)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  public size(): number {
    return this.cache.size;
  }
}

// Test Run
const cache = new LRUCache<string, { username: string; role: string }>(3, 5000);
cache.set("user:1", { username: "Elena Vance", role: "Architect" });
cache.set("user:2", { username: "Marcus Thorne", role: "Security Lead" });

console.log("Cached User 1:", cache.get("user:1"));
console.log("Current Cache Size:", cache.size());`,
  },
};

export const DEFAULT_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'track-ts-architecture',
    title: 'Advanced TypeScript: Systems Architecture & Type-Level Design',
    description: 'Master generic constraints, discriminated unions, Result monads, LRU caching, and zero-leak typed domain models.',
    estimatedWeeks: 6,
    totalHours: 36,
    skillLevel: 'Intermediate',
    icon: '🔷',
    category: 'TypeScript',
    modules: [
      {
        id: 'mod-ts-1',
        week: 1,
        title: 'Generic Systems & Type-Safe Result Monads',
        description: 'Eliminate runtime exceptions by designing strongly typed Result monads and generic boundary validators.',
        language: 'typescript',
        theorySummary: 'The Result Monad pattern replaces traditional try/catch exception tossing with explicit discriminated union return types ({ success: true, data: T } | { success: false, error: E }), forcing callers to handle error branches exhaustively at compile time.',
        codeExample: `type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function parseConfig<T>(raw: string): Result<T, string> {
  try {
    const data = JSON.parse(raw);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}`,
        keyConcepts: ['Discriminated Unions', 'Generic Constraints', 'Exhaustive Type Narrowing', 'Result Pattern'],
        handsOnChallenge: {
          title: 'Build a Type-Safe In-Memory Key-Value Store',
          description: 'Implement a generic EntityStore<T> with type-safe subscriptions, key lookups, and Result-wrapped mutations.',
          starterCode: `// Hands-on Challenge: Type-Safe Entity Store
type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

export class EntityStore<T extends { id: string }> {
  private data = new Map<string, T>();

  public save(item: T): Result<T> {
    if (!item.id) {
      return { success: false, error: 'Entity must contain a non-empty string id' };
    }
    this.data.set(item.id, { ...item });
    return { success: true, data: item };
  }

  public findById(id: string): Result<T> {
    const item = this.data.get(id);
    if (!item) {
      return { success: false, error: \`Entity with id '\${id}' not found\` };
    }
    return { success: true, data: item };
  }
}

// Test verification
const store = new EntityStore<{ id: string; name: string }>();
console.log('Saved:', store.save({ id: 'usr_1', name: 'Elena Vance' }));
console.log('Lookup:', store.findById('usr_1'));`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'What is the primary benefit of using Discriminated Unions in TypeScript?',
            options: [
              'Allows the compiler to automatically narrow types based on a shared literal discriminant property.',
              'Increases code execution speed at runtime by bypassing JavaScript type checks.',
              'Converts TypeScript interfaces directly into SQL database schemas.',
              'Forces variables to only accept integer numbers.',
            ],
            correctIndex: 0,
            explanation: 'Discriminated unions enable exhaustive type narrowing via switch or if statements on a common literal tag.',
          },
          {
            question: 'Why is returning a Result<T, E> object preferred over throwing unstructured exceptions in core domain logic?',
            options: [
              'It forces downstream callers to handle both success and error paths explicitly via type checks.',
              'It disables the garbage collector for faster throughput.',
              'It allows variables to be declared without types.',
              'It replaces the need for asynchronous promises.',
            ],
            correctIndex: 0,
            explanation: 'Result types turn runtime failures into typed contracts that TypeScript statically checks, preventing unhandled runtime crashes.',
          },
        ],
      },
      {
        id: 'mod-ts-2',
        week: 2,
        title: 'High-Performance LRU Cache with O(1) Eviction',
        description: 'Design a memory-bounded Least Recently Used cache using JavaScript Map insertion ordering and TTL expiration.',
        language: 'typescript',
        theorySummary: 'JavaScript Map preserves key insertion order. By deleting and re-inserting accessed entries, the oldest element remains at map.keys().next().value, achieving O(1) eviction without managing double-linked list pointers.',
        codeExample: `class BoundedMap<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
}`,
        keyConcepts: ['LRU Cache Strategy', 'O(1) Eviction', 'TTL Expiration', 'Map Insertion Order Invariants'],
        handsOnChallenge: {
          title: 'Implement an LRU Cache with TTL & Eviction Events',
          description: 'Construct an LRUCache<K, V> supporting capacity limits, millisecond TTL expiration, and eviction statistics.',
          starterCode: `// Hands-on Challenge: Generic LRU Cache with TTL
export class LRUCache<K extends string | number, V> {
  private cache = new Map<K, { value: V; expiresAt: number }>();

  constructor(
    private readonly capacity: number = 3,
    private readonly ttlMs: number = 5000
  ) {}

  public get(key: K): V | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  public size(): number {
    return this.cache.size;
  }
}

// Verification
const cache = new LRUCache<string, string>(2);
cache.set('a', 'alpha');
cache.set('b', 'bravo');
console.log('Get a:', cache.get('a')); // access 'a' to make 'b' oldest
cache.set('c', 'charlie'); // should evict 'b'
console.log('Get b (evicted):', cache.get('b'));
console.log('Get c:', cache.get('c'));`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'How does JavaScript Map guarantee O(1) eviction order when implementing an LRU cache?',
            options: [
              'Map retains key insertion order, so re-inserting on access moves the item to the end, while keys().next() yields the oldest.',
              'Map internally sorts all elements using binary search trees.',
              'Map converts all keys to fixed memory memory offsets.',
              'Map relies on browser background threads to sort keys periodically.',
            ],
            correctIndex: 0,
            explanation: 'JavaScript Map preserves insertion order. Deleting and re-inserting an accessed key places it at the tail, making the head the LRU item.',
          },
        ],
      },
    ],
    capstoneProject: {
      title: 'Distributed Transaction Coordinator & State Machine',
      description: 'Architect a strongly-typed finite state machine with distributed transaction rollbacks and event sourcing hooks in TypeScript.',
      architectureRequirements: [
        'Zero `any` types with 100% strict type inference',
        'State transitions validated via discriminated union action tables',
        'In-memory snapshotting and audit trail logging',
      ],
    },
    recommendedBooksAndRFCs: [
      'Designing Data-Intensive Applications (Martin Kleppmann)',
      'TypeScript 5.x Handbook (Official Documentation)',
      'Clean Code & SOLID Principles in Modern TypeScript',
    ],
  },
  {
    id: 'track-python-concurrency',
    title: 'High-Performance Python: Asyncio, Memory & Concurrency',
    description: 'Master async/await event loops, thread pools, zero-copy byte buffers, dataclasses, and high-throughput pipelines.',
    estimatedWeeks: 5,
    totalHours: 28,
    skillLevel: 'Advanced',
    icon: '🐍',
    category: 'Python',
    modules: [
      {
        id: 'mod-py-1',
        week: 1,
        title: 'Asynchronous Event Loops & Rate Limiting Pipelines',
        description: 'Build non-blocking task executors using asyncio.Lock, gather, and bounded semaphore queues.',
        language: 'python',
        theorySummary: 'Python asyncio enables single-threaded cooperative multitasking. Using asyncio.Lock and asyncio.Semaphore prevents race conditions and protects downstream APIs from traffic surges.',
        codeExample: `import asyncio

async def fetch_worker(sem: asyncio.Semaphore, item_id: int):
    async with sem:
        print(f"Processing item {item_id}")
        await asyncio.sleep(0.05)
        return {"id": item_id, "status": "processed"}`,
        keyConcepts: ['Asyncio Event Loop', 'Semaphores & Locks', 'Task Gathering', 'Backpressure Control'],
        handsOnChallenge: {
          title: 'Implement a Token Bucket Rate Limiter in Python',
          description: 'Construct an async token-bucket rate limiter that restricts API calls to a maximum capacity with token replenishment.',
          starterCode: `# Challenge: Token Bucket Rate Limiter in Python 3.12
import asyncio
import time

class TokenBucketLimiter:
    def __init__(self, rate_per_sec: float, capacity: float):
        self.rate = rate_per_sec
        self.capacity = capacity
        self.tokens = capacity
        self.last_check = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self, tokens_needed: float = 1.0) -> bool:
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self.last_check
            self.last_check = now
            # Replenish tokens
            self.tokens = min(self.capacity, self.tokens + (elapsed * self.rate))
            if self.tokens >= tokens_needed:
                self.tokens -= tokens_needed
                return True
            return False

async def main():
    limiter = TokenBucketLimiter(rate_per_sec=5.0, capacity=2.0)
    for i in range(5):
        granted = await limiter.acquire(1.0)
        print(f"Request {i+1}: Granted={granted}, Remaining Tokens={limiter.tokens:.2f}")
        await asyncio.sleep(0.1)

asyncio.run(main())`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'Why does CPU-bound processing in standard CPython fail to achieve parallelism using standard threading.Thread?',
            options: [
              'Because the Global Interpreter Lock (GIL) serializes Python bytecode execution on a single core.',
              'Because Python does not support multi-core operating systems.',
              'Because Python arrays cannot be shared across memory spaces.',
              'Because Python automatically compiles all threads into single-threaded C code.',
            ],
            correctIndex: 0,
            explanation: 'CPython uses the GIL to ensure thread-safe memory management, requiring multiprocessing or native extensions for multi-core CPU parallelism.',
          },
        ],
      },
      {
        id: 'mod-py-2',
        week: 2,
        title: 'Dataclasses, Slots & Memory Optimization',
        description: 'Reduce memory footprint by 60%+ using __slots__, frozen dataclasses, and custom serializers.',
        language: 'python',
        theorySummary: 'By default, Python objects use a __dict__ for dynamic attribute storage. Declaring __slots__ or @dataclass(slots=True) replaces the dictionary with a compact array of descriptor pointers.',
        codeExample: `from dataclasses import dataclass

@dataclass(slots=True, frozen=True)
class TelemetryPoint:
    timestamp: float
    value: float
    sensor_id: str`,
        keyConcepts: ['__slots__ Memory Layout', 'Frozen Dataclasses', 'Garbage Collector Optimization', 'Zero-Copy Structs'],
        handsOnChallenge: {
          title: 'Build a Memory-Efficient Metric Stream Collector',
          description: 'Construct a batch telemetry aggregator storing 100k data points with bounded memory overhead.',
          starterCode: `# Challenge: Memory-Efficient Dataclass Aggregator
from dataclasses import dataclass
import time

@dataclass(slots=True, frozen=True)
class MetricRecord:
    endpoint: str
    latency_ms: float
    status_code: int
    timestamp: float

class MetricAggregator:
    def __init__(self):
        self.records: list[MetricRecord] = []

    def add(self, endpoint: str, latency: float, status: int = 200) -> None:
        self.records.append(MetricRecord(endpoint, latency, status, time.time()))

    def summary(self) -> dict:
        if not self.records:
            return {"count": 0, "avg_ms": 0}
        total_lat = sum(r.latency_ms for r in self.records)
        return {
            "count": len(self.records),
            "avg_ms": round(total_lat / len(self.records), 2),
            "p99_approx": max(r.latency_ms for r in self.records),
        }

# Execution
agg = MetricAggregator()
agg.add("/api/v1/auth", 24.5)
agg.add("/api/v1/review", 88.2)
agg.add("/api/v1/telemetry", 12.1)
print("Summary:", agg.summary())`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'What is the primary operational effect of enabling slots=True on a Python 3.10+ dataclass?',
            options: [
              'Prevents creation of the instance __dict__, drastically reducing memory usage per instance.',
              'Disables all type annotations at runtime.',
              'Converts Python variables into database columns automatically.',
              'Makes the dataclass execute on the GPU.',
            ],
            correctIndex: 0,
            explanation: 'slots=True instructs Python to allocate a fixed set of attributes rather than creating a dynamic dictionary for each object instance.',
          },
        ],
      },
    ],
    capstoneProject: {
      title: 'Async Microservice Telemetry & Alerting Engine',
      description: 'Build an asynchronous real-time metric processing pipeline capable of digesting 10,000 events/sec with sliding window anomaly detection.',
      architectureRequirements: [
        'Asynchronous producer-consumer queue with backpressure limits',
        'Memory optimization using slotted dataclasses',
        'Zero unhandled exceptions with structured logging',
      ],
    },
    recommendedBooksAndRFCs: [
      'High Performance Python (Micha Gorelick & Ian Ozsvald)',
      'Fluent Python, 2nd Edition (Luciano Ramalho)',
      'Python asyncio Documentation & PEP 492',
    ],
  },
  {
    id: 'track-php-backend',
    title: 'Modern PHP 8.3: Readonly Domain Models & Zero-Trust Security',
    description: 'Master strict typing, readonly classes, enum match dispatch, Argon2id security hardening, and OWASP defenses.',
    estimatedWeeks: 4,
    totalHours: 24,
    skillLevel: 'Intermediate',
    icon: '🐘',
    category: 'PHP',
    modules: [
      {
        id: 'mod-php-1',
        week: 1,
        title: 'Readonly Classes, Strict Types & Enum Match Dispatch',
        description: 'Design immutable domain value objects with constructor property promotion and exhaustive pattern matching.',
        language: 'php',
        theorySummary: 'PHP 8.2+ introduced readonly classes where all properties are automatically typed and immutable upon construction. Combining readonly classes with string-backed enums and match expressions guarantees total type safety.',
        codeExample: `<?php
declare(strict_types=1);

enum OrderStatus: string {
    case Pending = 'pending';
    case Paid = 'paid';
    case Shipped = 'shipped';
}

readonly class Order {
    public function __construct(
        public string $id,
        public float $total,
        public OrderStatus $status,
    ) {}
}`,
        keyConcepts: ['declare(strict_types=1)', 'Readonly Classes', 'Backed Enums', 'Match Expressions'],
        handsOnChallenge: {
          title: 'Implement an Immutable Domain Model in PHP 8.3',
          description: 'Create a UserAccount entity with role authorization rules enforced via enum match statements.',
          starterCode: `<?php
declare(strict_types=1);

enum UserRole: string {
    case SuperAdmin = 'admin';
    case Developer = 'developer';
    case Guest = 'guest';
}

readonly class UserAccount {
    public function __construct(
        public string $id,
        public string $email,
        public UserRole $role,
        public \\DateTimeImmutable $createdAt,
    ) {}

    public function canAccessAdminPanel(): bool {
        return match($this->role) {
            UserRole::SuperAdmin => true,
            UserRole::Developer, UserRole::Guest => false,
        };
    }
}

// Verification
$user = new UserAccount(
    id: 'usr_8472',
    email: 'marcus@devmentor.ai',
    role: UserRole::SuperAdmin,
    createdAt: new \\DateTimeImmutable()
);

echo "User created: " . $user->email . "\\n";
echo "Has admin access: " . ($user->canAccessAdminPanel() ? 'YES' : 'NO') . "\\n";`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'What happens when a code statement attempts to modify a property of a PHP readonly class after initialization?',
            options: [
              'PHP throws an Error exception prohibiting mutation of readonly properties.',
              'The property value is silently overwritten.',
              'The entire script is automatically restarted.',
              'The variable is converted to null.',
            ],
            correctIndex: 0,
            explanation: 'Readonly properties in PHP are immutable once initialized; attempting to modify them results in a fatal Error exception.',
          },
        ],
      },
      {
        id: 'mod-php-2',
        week: 2,
        title: 'OWASP Security Hardening & Argon2id Password Cryptography',
        description: 'Eliminate SQL injections, sanitize serialization boundaries, and implement memory-hard Argon2id hashing.',
        language: 'php',
        theorySummary: 'Legacy hashing algorithms like MD5/SHA1 are vulnerable to GPU collisions. Password storage must use password_hash($pwd, PASSWORD_ARGON2ID) with parameterized prepared statements for all database queries.',
        codeExample: `<?php
declare(strict_types=1);

$hash = password_hash($plaintext, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,
    'time_cost' => 4,
    'threads' => 1
]);

if (password_verify($plaintext, $hash)) {
    // Authenticated
}`,
        keyConcepts: ['Argon2id Hashing', 'SQL Injection Mitigation', 'Input Sanitization', 'Timing Attack Prevention'],
        handsOnChallenge: {
          title: 'Implement a Secure Password Verification Service',
          description: 'Construct a security service validating password strength, generating Argon2id hashes, and verifying credentials.',
          starterCode: `<?php
declare(strict_types=1);

class SecurityService {
    public static function hashPassword(string $plain): string {
        return password_hash($plain, PASSWORD_ARGON2ID);
    }

    public static function verify(string $plain, string $hash): bool {
        return password_verify($plain, $hash);
    }
}

// Verification
$pwd = "SuperSecretDevMentorPass2026!";
$hash = SecurityService::hashPassword($pwd);
echo "Argon2id Hash generated:\\n" . $hash . "\\n";
echo "Verification check: " . (SecurityService::verify($pwd, $hash) ? 'VALID' : 'INVALID') . "\\n";`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'Why is PASSWORD_ARGON2ID superior to standard MD5 or SHA-256 for password storage in PHP?',
            options: [
              'Argon2id is a memory-hard key derivation function designed specifically to resist ASIC and GPU brute-force attacks.',
              'Argon2id produces shorter hashes that take less disk space.',
              'Argon2id automatically encrypts SQL databases.',
              'Argon2id runs in parallel on client web browsers.',
            ],
            correctIndex: 0,
            explanation: 'Argon2id forces attackers to allocate large chunks of RAM for every attempt, neutralizing multi-core GPU and ASIC hardware attacks.',
          },
        ],
      },
    ],
    capstoneProject: {
      title: 'Zero-Trust Enterprise Authentication & RBAC Engine',
      description: 'Build a production-hardened PHP 8.3 authentication gateway featuring Argon2id password hashing, constant-time token verification, and granular RBAC policies.',
      architectureRequirements: [
        'Enforce strict_types=1 across 100% of files',
        'All domain entities structured as readonly classes',
        'OWASP Top 10 hardening on all serialization boundaries',
      ],
    },
    recommendedBooksAndRFCs: [
      'PHP 8 Objects, Patterns, and Practice (Matt Zandstra)',
      'OWASP Secure Coding Practices Quick Reference Guide',
      'PHP The Right Way (Modern Best Practices)',
    ],
  },
  {
    id: 'track-modern-js',
    title: 'Modern JavaScript (ES2024): Async Pipelines & Concurrency',
    description: 'Master async task queues, event loops, promise deduplication, generator pipelines, and performance profiling.',
    estimatedWeeks: 4,
    totalHours: 24,
    skillLevel: 'Intermediate',
    icon: '💛',
    category: 'JavaScript',
    modules: [
      {
        id: 'mod-js-1',
        week: 1,
        title: 'Asynchronous Concurrency Queues & Promise Deduplication',
        description: 'Build an asynchronous task queue that limits concurrent operations and prevents request thundering herds.',
        language: 'javascript',
        theorySummary: 'JavaScript is single-threaded with an event loop. Running unbounded async tasks can exhaust socket descriptors or trigger rate limits. Managing concurrency using a queue schedules tasks in bounded chunks.',
        codeExample: `class BoundedQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  // Process tasks with concurrency limit
}`,
        keyConcepts: ['Event Loop & Microtask Queue', 'Concurrency Control', 'Promise Deduplication', 'Backpressure'],
        handsOnChallenge: {
          title: 'Implement an Async Task Queue with Bounded Concurrency',
          description: 'Construct a TaskQueue that limits concurrent task execution and returns promises resolved upon task completion.',
          starterCode: `// Challenge: Implement Async Task Queue
class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    const { taskFn, resolve, reject } = this.queue.shift();
    this.running++;
    try {
      const result = await taskFn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.processNext();
    }
  }
}

// Verification
const q = new TaskQueue(2);
const run = async () => {
  const t1 = q.add(async () => { await new Promise(r => setTimeout(r, 50)); return 'Task 1 done'; });
  const t2 = q.add(async () => { await new Promise(r => setTimeout(r, 30)); return 'Task 2 done'; });
  const results = await Promise.all([t1, t2]);
  console.log('Results:', results);
};
run();`,
          difficulty: 'Intermediate',
        },
        quiz: [
          {
            question: 'What is the execution order difference between Promise microtasks and setTimeout macrotasks in the JS Event Loop?',
            options: [
              'All microtasks in the queue execute immediately after the current script and before the next macrotask is processed.',
              'Macrotasks execute before microtasks.',
              'Both microtasks and macrotasks execute concurrently on multiple threads.',
              'Microtasks only execute once every 60 seconds.',
            ],
            correctIndex: 0,
            explanation: 'Microtasks (Promises, queueMicrotask) are drained completely at the end of each execution tick before rendering or next macrotasks.',
          },
        ],
      },
    ],
    capstoneProject: {
      title: 'High-Throughput Streaming Event Emitter',
      description: 'Architect a low-latency event emitter with async iterator backpressure and memory leak detection.',
      architectureRequirements: [
        'Bounded memory buffering with backpressure notification',
        'Zero unhandled promise rejections',
        'Benchmarking suite measuring throughput in ops/sec',
      ],
    },
    recommendedBooksAndRFCs: [
      'You Don\'t Know JS Yet (Kyle Simpson)',
      'JavaScript: The Definitive Guide (David Flanagan)',
      'ECMA-262 Language Specification',
    ],
  },
  {
    id: 'track-web-markup',
    title: 'Modern Web Architecture: HTML5 Semantics & CSS Layouts',
    description: 'Master accessible semantic HTML5 structures, modern CSS Grid, Flexbox alignment, and responsive fluid layouts.',
    estimatedWeeks: 3,
    totalHours: 18,
    skillLevel: 'Beginner',
    icon: '🌐',
    category: 'HTML & CSS',
    modules: [
      {
        id: 'mod-html-1',
        week: 1,
        title: 'Semantic HTML5 Elements & Accessible ARIA Architecture',
        description: 'Structure documents using native HTML5 landmark elements (<main>, <nav>, <section>, <article>) with proper ARIA accessibility roles.',
        language: 'html',
        theorySummary: 'Semantic HTML provides meaning to assistive technologies (screen readers) and search engines. Using semantic elements like <main role="main"> and <button> rather than generic <div onclick> provides keyboard accessibility out of the box.',
        codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Accessible Card</title>
</head>
<body>
  <main role="main">
    <article aria-labelledby="title-1">
      <h1 id="title-1">Semantic Article</h1>
      <p>Accessible content structure.</p>
    </article>
  </main>
</body>
</html>`,
        keyConcepts: ['HTML5 Landmarks', 'ARIA Accessibility Roles', 'Doctype Standards', 'Accessible Forms'],
        handsOnChallenge: {
          title: 'Build a Semantic, Accessible Product Card',
          description: 'Construct a complete HTML document featuring an accessible card with image alt tags, buttons, and semantic markup.',
          starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accessible Product Card</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; max-width: 380px; border: 1px solid #334155; }
    h2 { font-size: 1.25rem; margin-top: 0; color: #38bdf8; }
    button { background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
  </style>
</head>
<body>
  <main role="main">
    <article class="card" aria-labelledby="product-title">
      <h2 id="product-title">DevMentor Pro Subscription</h2>
      <p>Master systems architecture and code reviews with dedicated AI guidance.</p>
      <button type="button" aria-label="Purchase DevMentor Pro">Subscribe Now</button>
    </article>
  </main>
</body>
</html>`,
          difficulty: 'Beginner',
        },
        quiz: [
          {
            question: 'Why should clickable interactive elements use <button> rather than <div onclick="...">?',
            options: [
              '<button> elements provide built-in keyboard accessibility (Enter/Space triggers) and focus management automatically.',
              '<div> elements cannot accept CSS styling.',
              '<button> elements render 10x faster in web browsers.',
              'HTML standards prohibit JavaScript on <div> tags.',
            ],
            correctIndex: 0,
            explanation: 'Native <button> elements provide built-in accessibility, tab navigation, and keyboard event dispatching without custom JavaScript handlers.',
          },
        ],
      },
    ],
    capstoneProject: {
      title: 'Accessible Responsive Analytics Dashboard Layout',
      description: 'Build a responsive semantic analytics layout with CSS Grid, container queries, and WCAG AA contrast compliance.',
      architectureRequirements: [
        '100% Valid HTML5 with proper landmark hierarchy',
        'Full keyboard navigation support without mouse input',
        'Responsive layout supporting 320px mobile to 4K ultra-wide monitors',
      ],
    },
    recommendedBooksAndRFCs: [
      'HTML and CSS: Design and Build Websites (Jon Duckett)',
      'W3C Web Content Accessibility Guidelines (WCAG 2.2)',
      'MDN Web Docs: HTML Elements Reference',
    ],
  },
];
