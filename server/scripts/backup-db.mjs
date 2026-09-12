/**
 * SQLite-safe snapshot: database + uploads copy.
 *
 *   npm run backup
 *
 * Writes BACKUP_DIR/snapshot-<timestamp>/ (never under uploads) and prunes
 * older snapshots according to BACKUP_KEEP.
 */
import { createSnapshot, pruneBackups } from '../src/db/backup.js';
import { closeDb } from '../src/db/index.js';
import { describeError, logger } from '../src/lib/logger.js';

try {
  const snapshot = await createSnapshot();
  pruneBackups();
  logger.info('backup.complete', {
    snapshot: snapshot.dir.split(/[/\\]/).pop(),
    mediaFiles: snapshot.mediaFiles,
  });
} catch (error) {
  logger.error('backup.failed', { error: describeError(error) });
  process.exitCode = 1;
} finally {
  closeDb();
}
