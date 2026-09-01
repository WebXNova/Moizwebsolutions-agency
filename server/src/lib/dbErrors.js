/**
 * Translate SQLite constraint failures into controlled API responses.
 * Raw SQL is never returned to the client.
 *
 * @param {unknown} error
 * @returns {{ status: number; code: string; message: string } | null}
 */
export function isDuplicateKeyError(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  return (code.startsWith('SQLITE_CONSTRAINT') && code.includes('UNIQUE')) || code === 'ER_DUP_ENTRY';
}

export function translateDbError(error) {
  const code = typeof error?.code === 'string' ? error.code : '';

  if (code === 'ER_DUP_ENTRY') {
    return {
      status: 409,
      code: 'conflict',
      message: 'A record with those details already exists.',
    };
  }
  if (code === 'ER_NO_REFERENCED_ROW_2' || code === 'ER_NO_REFERENCED_ROW') {
    return {
      status: 400,
      code: 'invalid_reference',
      message: 'That related record does not exist.',
    };
  }
  if (code === 'ER_BAD_NULL_ERROR') {
    return {
      status: 400,
      code: 'validation_failed',
      message: 'A required field is missing.',
    };
  }
  if (code === 'ER_ROW_IS_REFERENCED_2' || code === 'ER_ROW_IS_REFERENCED') {
    return {
      status: 400,
      code: 'constraint_failed',
      message: 'That change could not be saved.',
    };
  }

  if (!code.startsWith('SQLITE_CONSTRAINT')) return null;

  if (code.includes('UNIQUE')) {
    return {
      status: 409,
      code: 'conflict',
      message: 'A record with those details already exists.',
    };
  }
  if (code.includes('FOREIGNKEY')) {
    return {
      status: 400,
      code: 'invalid_reference',
      message: 'That related record does not exist.',
    };
  }
  if (code.includes('NOTNULL')) {
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
