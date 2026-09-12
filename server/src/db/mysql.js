import { MessageChannel, Worker, receiveMessageOnPort } from 'node:worker_threads';
import { translateSql } from './sqlDialect.js';

const QUERY_TIMEOUT_MS = 60_000;

export class MysqlDatabase {
  dialect = 'mysql';

  /** @type {Worker} */
  #worker;

  constructor(config) {
    this.#worker = new Worker(new URL('./mysql-worker.js', import.meta.url));
    this.#worker.on('error', (error) => {
      throw error;
    });
    this.#call('connect', { config });
  }

  /**
   * @param {string} op
   * @param {Record<string, unknown>} [payload]
   */
  #call(op, payload = {}) {
    const sab = new SharedArrayBuffer(4);
    const lock = new Int32Array(sab);
    const { port1, port2 } = new MessageChannel();
    this.#worker.postMessage({ op, payload, lockSab: sab, port: port2 }, [port2]);
    const wait = Atomics.wait(lock, 0, 0, QUERY_TIMEOUT_MS);
    if (wait === 'timed-out') {
      port1.close();
      throw new Error(`MySQL ${op} timed out after ${QUERY_TIMEOUT_MS}ms`);
    }
    const received = receiveMessageOnPort(port1);
    port1.close();
    if (!received) {
      throw new Error(`MySQL worker returned no result for ${op}`);
    }
    const { ok, result, error } = received.message;
    if (!ok) {
      const err = new Error(error?.message || 'MySQL query failed');
      err.code = error?.code;
      err.errno = error?.errno;
      err.sqlState = error?.sqlState;
      throw err;
    }
    return result;
  }

  /**
   * @param {string} sql
   */
  prepare(sql) {
    const translated = translateSql(sql);
    return {
      get: (...params) => {
        const rows = this.#call('execute', { sql: translated, params });
        return Array.isArray(rows) ? rows[0] : undefined;
      },
      all: (...params) => {
        const rows = this.#call('execute', { sql: translated, params });
        return Array.isArray(rows) ? rows : [];
      },
      run: (...params) => {
        const result = this.#call('execute', { sql: translated, params });
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
  exec(sql) {
    this.#call('query', { sql: translateSql(sql) });
  }

  /**
   * @param {(...args: unknown[]) => unknown} fn
   */
  transaction(fn) {
    return (...args) => {
      this.#call('begin');
      try {
        const result = fn(...args);
        this.#call('commit');
        return result;
      } catch (error) {
        try {
          this.#call('rollback');
        } catch {
          // original error matters more than rollback failure
        }
        throw error;
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

  close() {
    try {
      this.#call('close');
    } catch {
      // already gone
    }
    this.#worker.terminate();
  }
}

/**
 * @param {{ host: string; port: number; user: string; password: string; name: string }} dbEnv
 */
export function createMysqlDatabase(dbEnv) {
  return new MysqlDatabase({
    host: dbEnv.host,
    port: dbEnv.port,
    user: dbEnv.user,
    password: dbEnv.password,
    database: dbEnv.name,
  });
}
