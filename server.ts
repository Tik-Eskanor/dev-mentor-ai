import { createServer } from 'http';
import { parse } from 'url';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

// Process-level safety guards to prevent background driver/socket errors from crashing the app server
process.on('uncaughtException', (err) => {
  console.warn('[Techtor Server Warning] Caught uncaughtException:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Techtor Server Warning] Caught unhandledRejection:', reason);
});

const isProductionRun = process.env.NODE_ENV === 'production';
const isDev = !isProductionRun;
const hostname = '0.0.0.0';
const port = 3000;

try {
  const { execSync } = await import('child_process');
  execSync('kill -9 $(lsof -t -i:3000) 2>/dev/null || true', { stdio: 'ignore' });
} catch {
  // ignore
}

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
