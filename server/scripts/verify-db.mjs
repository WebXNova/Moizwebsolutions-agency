/**
 * Open the configured database and confirm expected tables/pragmas.
 *
 *   npm run verify:db
 *
 * Does not print filesystem paths.
 */
import { inspectSchema } from '../src/db/backup.js';
import { closeDb, getDb } from '../src/db/index.js';
import { describeError, logger } from '../src/lib/logger.js';

try {
  const db = getDb();
  const report = inspectSchema(db);
  let integrity = 'skipped';
  if (db.dialect !== 'mysql') {
    const rows = db.pragma('integrity_check');
    integrity = rows?.[0]?.integrity_check || String(rows?.[0] ?? '');
    if (integrity !== 'ok') {
      logger.error('verify.db_integrity_failed', { result: 'failed' });
      process.exitCode = 1;
    }
  }
  if (!report.ok) {
    logger.error('verify.db_unhealthy', {
      missingTables: report.missingTables,
      foreignKeys: report.foreignKeys,
      journalMode: report.journalMode,
    });
    process.exitCode = 1;
  } else if (process.exitCode !== 1) {
    logger.info('verify.db_ok', {
      tableCount: report.tableCount,
      foreignKeys: report.foreignKeys,
      journalMode: report.journalMode,
      integrity,
    });
  }
} catch (error) {
  logger.error('verify.db_failed', { error: describeError(error) });
  process.exitCode = 1;
} finally {
  closeDb();
}
