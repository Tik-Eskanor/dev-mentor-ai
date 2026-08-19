import { createServer } from 'http';
import { parse } from 'url';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

// Process-level safety guards to prevent background driver/socket errors from crashing the app server
process.on('uncaughtException', (err) => {
  console.warn('[DevMentor Server Warning] Caught uncaughtException:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[DevMentor Server Warning] Caught unhandledRejection:', reason);
});

// In container environments, process.env.NODE_ENV defaults to 'production'.
// For the dev server, we MUST set NODE_ENV to 'development' BEFORE loading Next.js.
const isProductionRun = process.env.NEXT_START === 'true';

if (!isProductionRun) {
  (process.env as any).NODE_ENV = 'development';
  // Clean stale production build artifacts from .next to prevent chunk mismatch errors in dev mode
  const nextDir = join(process.cwd(), '.next');
  if (existsSync(nextDir)) {
    try {
      rmSync(nextDir, { recursive: true, force: true });
      console.log('[DevMentor AI] Cleared stale .next directory for development mode.');
    } catch (e) {
      console.warn('[DevMentor AI] Failed to clear .next directory:', e);
    }
  }
}

const isDev = !isProductionRun;
const hostname = '0.0.0.0';
const port = 3000;

console.log(`[DevMentor AI] Initializing Next.js 15 server (devMode=${isDev}, NODE_ENV=${process.env.NODE_ENV})...`);

// Dynamically import Next.js after setting NODE_ENV
const { default: next } = await import('next');

const app = next({ dev: isDev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err: any) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> DevMentor AI server listening on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Error preparing Next.js server:', err);
  process.exit(1);
});
