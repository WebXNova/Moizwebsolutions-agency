import { createApp } from './app.js';
import { collectMailConfigProblems, env } from './config/env.js';
import { verifyTransport } from './email/mailer.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info('server.started', {
    port: env.port,
    nodeEnv: env.nodeEnv,
    allowedOrigins: env.allowedOrigins,
  });

  const problems = collectMailConfigProblems();
  if (problems.length > 0) {
    // Loud but non-fatal: the site still serves, the endpoint returns 503.
    logger.warn('server.mail_unconfigured', { problems });
    return;
  }

  verifyTransport();
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logger.info('server.shutting_down', { signal });
    server.close(() => process.exit(0));
  });
}
