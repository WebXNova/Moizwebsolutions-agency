/**
 * Atomic display_order rewrite for a CMS collection.
 *
 * `ids` must be a permutation of every row currently in `table`.
 * Partial lists are rejected so a failed client cannot leave duplicate orders.
 *
 * Table names are caller-controlled constants, never request input.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {{
 *   table: string;
 *   ids: unknown;
 *   resourceLabel: string;
 * }} options
 */
export function applyReorder(db, { table, ids, resourceLabel }) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {
      ok: false,
      status: 400,
      code: 'validation_failed',
      message: 'Provide a non-empty ids array.',
    };
  }

  const ordered = ids.map((id) => String(id ?? '').trim()).filter(Boolean);
  if (ordered.length !== ids.length) {
    return {
      ok: false,
      status: 400,
      code: 'validation_failed',
      message: 'Every reorder id must be a non-empty string.',
    };
  }

  if (new Set(ordered).size !== ordered.length) {
    return {
      ok: false,
      status: 400,
      code: 'validation_failed',
      message: 'Reorder ids must be unique.',
    };
  }

  const existing = db.prepare(`SELECT id FROM ${table}`).all().map((row) => row.id);
  if (ordered.length !== existing.length) {
    return {
      ok: false,
      status: 400,
      code: 'validation_failed',
      message: `Reorder must include every ${resourceLabel} exactly once.`,
    };
  }

  const existingSet = new Set(existing);
  for (const id of ordered) {
    if (!existingSet.has(id)) {
      return {
        ok: false,
        status: 400,
        code: 'validation_failed',
        message: `Unknown ${resourceLabel} id.`,
      };
    }
  }

  const update = db.prepare(
    `UPDATE ${table} SET display_order = ?, updated_at = datetime('now') WHERE id = ?`,
  );
  const tx = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => update.run(index + 1, id));
  });
  tx(ordered);

  return { ok: true };
}
