import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import { env } from './config/env.js';
import { getMailHealth } from './email/mailer.js';
import { projectInquiryRouter } from './routes/projectInquiry.js';
import { projectsRouter } from './routes/projects.js';
import { categoriesRouter } from './routes/categories.js';
import { authRouter } from './routes/auth.js';
import { uploadsRouter } from './routes/uploads.js';
import { adminRouter } from './routes/admin.js';
import { contentRouter } from './routes/content.js';
import { cmsRouter } from './routes/cms.js';
import { inquiriesRouter } from './routes/inquiries.js';
import { getDb } from './db/index.js';
import { describeError, logger } from './lib/logger.js';
import { translateDbError } from './lib/dbErrors.js';
import { requestId } from './middleware/requestId.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { sendPublicSpaPage } from './lib/adminSecret.js';
import { attachAdminPortalGate } from './middleware/adminPortalGate.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy);

  app.use(requestId);
  app.use(securityHeaders);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (env.allowedOrigins.length === 0) return callback(null, false);
        return callback(null, env.allowedOrigins.includes(origin));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      maxAge: 86_400,
    }),
  );

  app.use(express.json({ limit: '48kb' }));

  app.use(
    env.uploads.publicPath,
    express.static(env.uploads.dir, {
      dotfiles: 'deny',
      index: false,
      redirect: false,
      setHeaders(response, filePath) {
        const lower = filePath.toLowerCase();
        if (lower.endsWith('.svg') || lower.endsWith('.html') || lower.endsWith('.js')) {
          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          response.setHeader('Content-Disposition', 'attachment');
          response.setHeader('X-Content-Type-Options', 'nosniff');
        }
      },
    }),
  );

  app.get('/api/health/live', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/health', (_req, res) => {
    let dbStatus = 'ok';
    try {
      getDb().prepare('SELECT 1 AS ok').get();
    } catch {
      dbStatus = 'error';
    }

    let uploads = 'ok';
    try {
      fs.accessSync(env.uploads.dir, fs.constants.R_OK);
    } catch {
      uploads = 'error';
    }

    const mail = getMailHealth();
    let email = 'unconfigured';
    if (mail.configured && mail.lastError) email = 'error';
    else if (mail.configured) email = 'configured';

    res.status(dbStatus === 'ok' && uploads === 'ok' ? 200 : 503).json({
      ok: dbStatus === 'ok' && uploads === 'ok',
      db: dbStatus,
      uploads,
      email,
    });
  });

  app.use('/api', projectInquiryRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/admin/auth', authRouter);
  app.use('/api/admin/uploads', uploadsRouter);
  app.use('/api/admin/cms', cmsRouter);
  app.use('/api/admin/inquiries', inquiriesRouter);
  app.use('/api/admin', adminRouter);

  attachAdminPortalGate(app);

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const pathname = req.path || '';
    if (pathname === '/api' || pathname.startsWith('/api/')) return next();
    if (pathname === '/uploads' || pathname.startsWith('/uploads/')) return next();
    if (sendPublicSpaPage(req, res)) return;
    return next();
  });

  app.use((_req, res) => {
    res.status(404).json({ ok: false, code: 'not_found', message: 'Not found.' });
  });

  app.use((error, _req, res, _next) => {
    const constraint = translateDbError(error);
    if (constraint) {
      return res.status(constraint.status).json({
        ok: false,
        code: constraint.code,
        message: constraint.message,
      });
    }

    const status = Number(error?.status) || 500;
    if (status >= 500) {
      logger.error('request.unhandled_error', {
        requestId: _req.requestId,
        error: describeError(error),
      });
    }
    res.status(status >= 400 && status < 600 ? status : 500).json({
      ok: false,
      code: status === 413 ? 'payload_too_large' : 'server_error',
      requestId: _req.requestId,
      message:
        status >= 400 && status < 500
          ? 'That request could not be processed.'
          : 'Something went wrong on our side.',
    });
  });

  return app;
}
