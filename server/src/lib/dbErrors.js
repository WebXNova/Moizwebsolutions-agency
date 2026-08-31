/**
 * Translate SQLite constraint failures into controlled API responses.
 * Raw SQL is never returned to the client.
 *
 * @param {unknown} error
 * @returns {{ status: number; code: string; message: string } | null}
 */
export function translateDbError(error) {
  const sqliteCode = typeof error?.code === 'string' ? error.code : '';
  if (!sqliteCode.startsWith('SQLITE_CONSTRAINT')) return null;

  if (sqliteCode.includes('UNIQUE')) {
    return {
      status: 409,
      code: 'conflict',
      message: 'A record with those details already exists.',
    };
  }
  if (sqliteCode.includes('FOREIGNKEY')) {
    return {
      status: 400,
      code: 'invalid_reference',
      message: 'That related record does not exist.',
    };
  }
  if (sqliteCode.includes('NOTNULL')) {
    return {
      status: 400,
      code: 'validation_failed',
      message: 'A required field is missing.',
    };
  }

  return {
    status: 400,
    code: 'constraint_failed',
    message: 'That change could not be saved.',
  };
}
