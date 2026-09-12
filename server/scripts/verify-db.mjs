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
  const report = inspectSchema(getDb());
  if (!report.ok) {
    logger.error('verify.db_unhealthy', {
      missingTables: report.missingTables,
      foreignKeys: report.foreignKeys,
      journalMode: report.journalMode,
    });
    process.exitCode = 1;
  } else {
    logger.info('verify.db_ok', {
      tableCount: report.tableCount,
      foreignKeys: report.foreignKeys,
      journalMode: report.journalMode,
    });
  }
} catch (error) {
  logger.error('verify.db_failed', { error: describeError(error) });
  process.exitCode = 1;
} finally {
  closeDb();
}
