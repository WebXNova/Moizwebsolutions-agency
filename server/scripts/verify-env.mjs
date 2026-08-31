/**
 * Print startup configuration problems without starting the HTTP server.
 *
 *   npm run verify:env
 *
 * Exits 1 if production/startup validation fails. Never prints secret values.
 */
import { collectStartupProblems, ensureRuntimeDirectories } from '../src/config/validate.js';
import { describeError, logger } from '../src/lib/logger.js';
import { env } from '../src/config/env.js';

const problems = collectStartupProblems();
if (problems.length > 0) {
  logger.error('verify.env_invalid', { problems, nodeEnv: env.nodeEnv });
  process.exit(1);
}

try {
  ensureRuntimeDirectories();
} catch (error) {
  logger.error('verify.directories_failed', { error: describeError(error) });
  process.exit(1);
}

logger.info('verify.env_ok', {
  nodeEnv: env.nodeEnv,
  port: env.port,
  listenHost: env.listenHost || 'all-interfaces',
  originCount: env.allowedOrigins.length,
});
