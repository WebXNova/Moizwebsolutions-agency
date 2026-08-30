import cors from 'cors';
import express from 'express';
import path from 'node:path';
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
import { logger } from './lib/logger.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy);

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

  app.use(env.uploads.publicPath, express.static(env.uploads.dir));

  app.get('/api/health', (_req, res) => {
    const mail = getMailHealth();
    res.json({
      ok: true,
      mailConfigured: mail.configured,
      mailTransportReady: mail.transportReady,
      mailDeliversToRealInbox: mail.deliversToRealInbox,
      mailStatus: mail.status,
      mailHost: mail.host,
      mailPort: mail.port,
      mailLastError: mail.lastError,
    });
  });

  app.use('/api', projectInquiryRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/admin/auth', authRouter);
  app.use('/api/admin/uploads', uploadsRouter);
  app.use('/api/admin/cms', cmsRouter);
  app.use('/api/admin', adminRouter);

  app.use((_req, res) => {
    res.status(404).json({ ok: false, code: 'not_found', message: 'Not found.' });
  });

  app.use((error, _req, res, _next) => {
    const status = Number(error?.status) || 500;
    if (status >= 500) logger.error('request.unhandled_error', { message: error?.message });
    res.status(status >= 400 && status < 600 ? status : 500).json({
      ok: false,
      code: status === 413 ? 'payload_too_large' : 'server_error',
      message:
        status >= 400 && status < 500
          ? 'That request could not be processed.'
          : 'Something went wrong on our side.',
    });
  });

  return app;
}
