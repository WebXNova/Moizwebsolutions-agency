/**
 * Restore a snapshot into an EMPTY temporary directory.
 *
 * Never overwrites the live DB_PATH.
 *
 *   npm run restore:db -- --source backups/snapshot-… --target /tmp/mws-restore
 *   npm run restore:db -- --source backups/snapshot-….tar.gz.enc --target /tmp/mws-restore
 */
import { restoreSnapshot } from '../src/db/backup.js';
import { env } from '../src/config/env.js';
import { describeError, logger } from '../src/lib/logger.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return '';
  return String(process.argv[index + 1] || '').trim();
}

const source = arg('--source');
const target = arg('--target');

if (!source || !target) {
  logger.error('restore.usage', {
    detail: 'Provide --source <snapshot|archive> and --target <empty-dir>. Live DB_PATH is refused.',
  });
  process.exit(1);
}

try {
  const result = restoreSnapshot({ source, target });
  logger.info('restore.complete', {
    integrity: result.report.integrity,
    tableCount: result.report.tableCount,
    inquiries: result.counts.inquiries,
    projects: result.counts.projects,
    liveDbUntouched: true,
    livePathEqualsTarget: false,
    listenHint: env.listenHost || 'loopback-or-all',
  });
} catch (error) {
  logger.error('restore.failed', { error: describeError(error) });
  process.exitCode = 1;
}
