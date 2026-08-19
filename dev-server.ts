import { spawn, execSync } from 'child_process';

console.log('[DevMentor AI] Initializing DevMentor AI dev server runner...');

try {
  execSync('kill -9 $(lsof -t -i:3000) 2>/dev/null || true', { stdio: 'ignore' });
} catch {
  // ignore
}

const env = { ...process.env, NODE_ENV: 'development' };

console.log('[DevMentor AI] Starting Next.js 15 dev server on port 3000...');

const nextDev = spawn('npx', ['next', 'dev', '-p', '3000'], {
  env,
  stdio: 'inherit',
  shell: true,
});

nextDev.on('error', (err) => {
  console.error('[DevMentor AI] Failed to start next dev:', err);
});

nextDev.on('exit', (code, signal) => {
  console.log(`[DevMentor AI] Next dev process exited with code ${code}, signal ${signal}`);
});
