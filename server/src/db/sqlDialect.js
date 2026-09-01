/**
 * Translate SQLite-flavored SQL used across the API into MySQL 8.
 * Route handlers keep writing SQLite-style SQL; only the MySQL adapter runs this.
 *
 * @param {string} sql
 * @returns {string}
 */
export function translateSql(sql) {
  let out = sql;

  out = out.replace(/datetime\('now',\s*'start of day'\)/gi, 'CURDATE()');
  out = out.replace(/datetime\('now',\s*'-7 days'\)/gi, 'DATE_SUB(NOW(), INTERVAL 7 DAY)');
  out = out.replace(/datetime\('now'\)/gi, 'NOW()');
  out = out.replace(/INSERT OR IGNORE/gi, 'INSERT IGNORE');

  out = out.replace(
    /ON CONFLICT\s*\(\s*`?key`?\s*\)\s*DO UPDATE SET\s+value\s*=\s*excluded\.value\s*,\s*updated_at\s*=\s*NOW\(\)/gi,
    'AS new ON DUPLICATE KEY UPDATE value = new.value, updated_at = NOW()',
  );

  const pragmaInfo = out.match(/^\s*PRAGMA table_info\((\w+)\)\s*$/i);
  if (pragmaInfo) {
    return `SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${pragmaInfo[1]}'`;
  }

  out = out.replace(
    /SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'/gi,
    'SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()',
  );
  out = out.replace(
    /SELECT COUNT\(\*\) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'/gi,
    'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()',
  );
  out = out.replace(
    /SELECT name FROM sqlite_master WHERE type='table' AND name='([^']+)'/gi,
    "SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$1'",
  );
  out = out.replace(
    /SELECT name FROM sqlite_master WHERE type='index' AND name='([^']+)'/gi,
    "SELECT INDEX_NAME AS name FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME = '$1' LIMIT 1",
  );

  out = quoteReservedIdentifiers(out);
  return out;
}

function quoteReservedIdentifiers(sql) {
  return sql
    .replace(/\bINSERT IGNORE INTO site_settings\s*\(\s*`?key`?\b/gi, 'INSERT IGNORE INTO site_settings (`key`')
    .replace(/\bINSERT INTO site_settings\s*\(\s*`?key`?\b/gi, 'INSERT INTO site_settings (`key`')
    .replace(/\bWHERE\s+`?key`?\s*=/gi, 'WHERE `key` =')
    .replace(/\bSELECT\s+`?key`?\s*,/gi, 'SELECT `key`,');
}
