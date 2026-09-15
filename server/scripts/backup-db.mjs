/**
 * SQLite-safe snapshot: database + uploads copy, then compressed (and
 * encrypted if BACKUP_PASSPHRASE is set). Off-site copy runs only after
 * the local snapshot is verified so a remote failure cannot destroy the
 * only copy.
 *
 *   npm run backup
 */
import { archiveSnapshot, createSnapshot, protectAndCopyOffsite, pruneBackups } from '../src/db/backup.js';
import { closeDb } from '../src/db/index.js';
import { describeError, logger } from '../src/lib/logger.js';

try {
  const snapshot = await createSnapshot();
  const archive = archiveSnapshot(snapshot.dir);
  const offsite = protectAndCopyOffsite(archive);
  pruneBackups();
  logger.info('backup.complete', {
    snapshot: snapshot.dir.split(/[/\\]/).pop(),
    mediaFiles: snapshot.mediaFiles,
    archive: archive.split(/[/\\]/).pop(),
    offsite: offsite ? 'yes' : 'no',
  });
} catch (error) {
  logger.error('backup.failed', { error: describeError(error) });
  process.exitCode = 1;
} finally {
  closeDb();
}
