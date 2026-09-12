import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // OneDrive placeholders break native file watchers on Windows (lstat UNKNOWN).
  server: {
    // Bind IPv4 and IPv6. Default `localhost` is [::1] only on this host, so
    // http://127.0.0.1:5173 (and some Windows localhost resolutions) refused.
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    // Same-origin `/api/*` in the browser, forwarded to the Node API.
    // Start that process with `npm run dev:api` from this folder.
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
