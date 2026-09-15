import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NOT_FOUND_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Not found</title><style>html,body{margin:0;min-height:100%;background:#f7f6f2;color:#1a1a1a;font-family:Inter,ui-sans-serif,system-ui,sans-serif}main{min-height:100vh;display:flex;align-items:center;justify-content:center}p{margin:0;font-size:1rem;letter-spacing:.04em}</style></head><body><main><p>Not found.</p></main></body></html>';

const PUBLIC_FIRST = new Set(['portfolio', 'contact', 'privacy', 'terms', 'refund']);

function readAdminSecretPath() {
  const envPath = path.resolve(__dirname, '../server/.env');
  let fromFile = '';
  try {
    const text = fs.readFileSync(envPath, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      if (line.slice(0, eq).trim() !== 'ADMIN_SECRET_PATH') continue;
      fromFile = line
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      break;
    }
  } catch {
    // Local env file is optional.
  }
  const value = String(process.env.ADMIN_SECRET_PATH || fromFile).trim();
  return /^[A-Za-z0-9_-]{12,64}$/.test(value) ? value : '';
}

function pathnameOf(url) {
  const raw = String(url || '/');
  const cut = raw.indexOf('?');
  return cut === -1 ? raw : raw.slice(0, cut);
}

function firstPathSegment(pathname) {
  return pathname.split('/').filter(Boolean)[0] || '';
}

function isViteOrPublicAsset(pathname) {
  if (
    pathname.startsWith('/src/') ||
    pathname.startsWith('/@') ||
    pathname.startsWith('/node_modules') ||
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.svg' ||
    pathname.startsWith('/favicon')
  ) {
    return true;
  }
  const first = firstPathSegment(pathname);
  if (!first) return true;
  return PUBLIC_FIRST.has(first);
}

function sendNotFound(res) {
  if (!res || res.headersSent || typeof res.writeHead !== 'function') return;
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  });
  res.end(NOT_FOUND_HTML);
}

/**
 * Only the env-configured secret prefix may load the admin SPA.
 * /admin and every other guessable path 404.
 */
function adminHtmlGatePlugin() {
  const secretPath = readAdminSecretPath();
  const middleware = (req, res, next) => {
    const pathname = pathnameOf(req.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) return next();
    if (pathname === '/uploads' || pathname.startsWith('/uploads/')) return next();
    const first = firstPathSegment(pathname);
    if (secretPath && first === secretPath) return next();
    if (isViteOrPublicAsset(pathname)) return next();
    return sendNotFound(res);
  };

  return {
    name: 'mws-admin-html-gate',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [adminHtmlGatePlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        timeout: 15_000,
        proxyTimeout: 15_000,
        configure(proxy) {
          proxy.on('error', (_err, req, res) => {
            console.warn(
              '[vite] API is not running on 127.0.0.1:8787. Start it with: npm run dev:api',
            );
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              const isInquiry = String(req?.url ?? '').includes('project-inquiry');
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify(
                  isInquiry
                    ? {
                        ok: false,
                        code: 'email_unavailable',
                        message: 'Our email service is temporarily unavailable.',
                      }
                    : {
                        ok: false,
                        code: 'api_unavailable',
                        message:
                          'The API server is not running. From the client folder, start it with npm run dev:api.',
                      },
                ),
              );
            }
          });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        timeout: 15_000,
        proxyTimeout: 15_000,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});
