import { parentPort } from 'node:worker_threads';
import mysql from 'mysql2/promise';

/** @type {import('mysql2/promise').Connection | null} */
let connection = null;

function serialize(value) {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') {
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = serialize(nested);
    }
    return out;
  }
  return value;
}

function connectionOptions(config) {
  return {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true,
    dateStrings: true,
    charset: 'utf8mb4',
  };
}

async function connect(config) {
  const options = connectionOptions(config);
  try {
    connection = await mysql.createConnection(options);
  } catch (error) {
    if (error?.code !== 'ER_BAD_DB_ERROR') throw error;
    const { database, ...rest } = options;
    const bootstrap = await mysql.createConnection(rest);
    try {
      await bootstrap.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    } finally {
      await bootstrap.end();
    }
    connection = await mysql.createConnection(options);
  }
  await connection.query('SET NAMES utf8mb4');
  await connection.query('SET SESSION sql_mode = CONCAT(@@sql_mode, ",NO_ENGINE_SUBSTITUTION")');
  return { threadId: connection.threadId };
}

async function dispatch(op, payload) {
  switch (op) {
    case 'connect':
      return connect(payload.config);
    case 'execute': {
      const params = Array.isArray(payload.params) ? payload.params : [];
      const [rows] = params.length > 0 || /\?/.test(payload.sql)
        ? await connection.execute(payload.sql, params)
        : await connection.query(payload.sql);
      return serialize(rows);
    }
    case 'query': {
      const [rows] = await connection.query(payload.sql, payload.params ?? []);
      return serialize(rows);
    }
    case 'begin':
      await connection.beginTransaction();
      return { ok: true };
    case 'commit':
      await connection.commit();
      return { ok: true };
    case 'rollback':
      await connection.rollback();
      return { ok: true };
    case 'close':
      if (connection) {
        await connection.end();
        connection = null;
      }
      return { ok: true };
    default:
      throw new Error(`Unknown MySQL worker op: ${op}`);
  }
}

parentPort.on('message', async ({ lockSab, port, op, payload }) => {
  const lock = new Int32Array(lockSab);
  try {
    const result = await dispatch(op, payload ?? {});
    port.postMessage({ ok: true, result });
  } catch (error) {
    port.postMessage({
      ok: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: error?.code,
        errno: error?.errno,
        sqlState: error?.sqlState,
      },
    });
  } finally {
    Atomics.notify(lock, 0);
    port.close();
  }
});
