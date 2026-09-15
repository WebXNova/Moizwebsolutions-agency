import mysql from 'mysql2/promise';
import { translateSql } from './sqlDialect.js';

const QUERY_TIMEOUT_MS = 30_000;
const CONNECT_TIMEOUT_MS = 10_000;

/**
 * Async MySQL adapter using a connection pool.
 *
 * The previous implementation blocked the Node.js event loop with a
 * synchronous worker wait. This adapter never blocks: every query is a Promise.
 *
 * Route handlers in this codebase are written against better-sqlite3's
 * synchronous API. Production therefore uses SQLite. This class exists so
 * MySQL cannot be re-enabled with the blocking worker pattern.
 */
export class MysqlDatabase {
  dialect = 'mysql';

  /** @type {import('mysql2/promise').Pool} */
  #pool;

  /**
   * @param {import('mysql2/promise').Pool} pool
   */
  constructor(pool) {
    this.#pool = pool;
  }

  /**
   * @param {string} sql
   * @param {unknown[]} [params]
   */
  async #execute(sql, params = []) {
    const translated = translateSql(sql);
    const [rows] = await this.#pool.query({
      sql: translated,
      timeout: QUERY_TIMEOUT_MS,
      values: params,
    });
    return rows;
  }

  /**
   * @param {string} sql
   */
  prepare(sql) {
    return {
      get: async (...params) => {
        const rows = await this.#execute(sql, params);
        return Array.isArray(rows) ? rows[0] : undefined;
      },
      all: async (...params) => {
        const rows = await this.#execute(sql, params);
        return Array.isArray(rows) ? rows : [];
      },
      run: async (...params) => {
        const result = await this.#execute(sql, params);
        if (Array.isArray(result)) {
          return { changes: result.length, lastInsertRowid: 0 };
        }
        return {
          changes: Number(result?.affectedRows ?? 0),
          lastInsertRowid: Number(result?.insertId ?? 0),
        };
      },
    };
  }

  /**
   * @param {string} sql
   */
  async exec(sql) {
    await this.#pool.query({ sql: translateSql(sql), timeout: QUERY_TIMEOUT_MS });
  }

  /**
   * @param {(...args: unknown[]) => unknown} fn
   */
  transaction(fn) {
    return async (...args) => {
      const connection = await this.#pool.getConnection();
      try {
        await connection.beginTransaction();
        const result = await fn(...args);
        await connection.commit();
        return result;
      } catch (error) {
        try {
          await connection.rollback();
        } catch {
          // original error matters more than rollback failure
        }
        throw error;
      } finally {
        connection.release();
      }
    };
  }

  /**
   * @param {string} name
   * @param {{ simple?: boolean }} [options]
   */
  pragma(name, options = {}) {
    const value = name === 'journal_mode' ? 'innodb' : 1;
    return options.simple ? value : [{ [name]: value }];
  }

  async ping() {
    const connection = await this.#pool.getConnection();
    try {
      await connection.ping();
    } finally {
      connection.release();
    }
  }

  async close() {
    await this.#pool.end();
  }
}

/**
 * Pool options used by createMysqlDatabase. Exported for tests.
 *
 * @param {{ host: string; port: number; user: string; password: string; name: string }} dbEnv
 */
export function mysqlPoolOptions(dbEnv) {
  return {
    host: dbEnv.host,
    port: dbEnv.port,
    user: dbEnv.user,
    password: dbEnv.password,
    database: dbEnv.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50,
    connectTimeout: CONNECT_TIMEOUT_MS,
    enableKeepAlive: true,
    charset: 'utf8mb4',
    multipleStatements: false,
    dateStrings: true,
    namedPlaceholders: false,
  };
}

/**
 * @param {{ host: string; port: number; user: string; password: string; name: string }} dbEnv
 */
export async function createMysqlDatabase(dbEnv) {
  const options = mysqlPoolOptions(dbEnv);
  let pool;
  try {
    pool = mysql.createPool(options);
    const probe = await pool.getConnection();
    probe.release();
  } catch (error) {
    if (error?.code !== 'ER_BAD_DB_ERROR') {
      if (pool) await pool.end().catch(() => {});
      throw error;
    }
    const { database, ...rest } = options;
    const bootstrap = await mysql.createConnection(rest);
    try {
      await bootstrap.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    } finally {
      await bootstrap.end();
    }
    pool = mysql.createPool(options);
  }

  const db = new MysqlDatabase(pool);
  await db.exec('SET NAMES utf8mb4');
  return db;
}
