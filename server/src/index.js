import { createApp } from './app.js';
import { env } from './config/env.js';
import { collectStartupProblems, ensureRuntimeDirectories } from './config/validate.js';
import { closeDb, getDb } from './db/index.js';
import { describeError, logger } from './lib/logger.js';
import { installProcessGuards } from './lib/processGuards.js';

const startupProblems = collectStartupProblems();
if (startupProblems.length > 0) {
  logger.error('server.config_invalid', { problems: startupProblems });
  process.exit(1);
}

if (!env.jwt.secretFromEnv && !env.isProduction) {
  logger.warn('server.jwt_dev_fallback', {
    detail: 'JWT_SECRET is unset; using a development-only secret.',
  });
}

try {
  ensureRuntimeDirectories();
} catch (error) {
  logger.error('server.directories_failed', { error: describeError(error) });
  process.exit(1);
}

let db;
try {
  db = getDb();
} catch (error) {
  logger.error('server.db_init_failed', { error: describeError(error) });
  process.exit(1);
}
const adminCount = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count;
if (adminCount === 0) {
  logger.warn('server.no_admin_users', {
    detail: 'Set ADMIN_EMAIL and ADMIN_PASSWORD, then restart, to seed the first super admin.',
  });
}

const app = createApp();

const listenCallback = () => {
  logger.info('server.started', {
    port: env.port,
    listenHost: env.listenHost || 'all-interfaces',
    nodeEnv: env.nodeEnv,
    allowedOrigins: env.allowedOrigins,
    adminSecretConfigured: Boolean(env.adminSecret.path),
    detail: 'Inquiry emails use the configured SMTP transport after the lead is stored.',
  });
};

const server = env.listenHost
  ? app.listen(env.port, env.listenHost, listenCallback)
  : app.listen(env.port, listenCallback);

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.timeout = 30_000;

server.on('error', (error) => {
  logger.error('server.listen_failed', { error: describeError(error) });
  closeDb();
  process.exit(1);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('server.shutting_down', { signal });

  const force = setTimeout(() => {
    logger.error('server.shutdown_timeout');
    closeDb();
    process.exit(1);
  }, 10_000);
  force.unref();

  server.close(() => {
    closeDb();
    logger.info('server.stopped');
    process.exit(0);
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}

installProcessGuards({ shutdown });
