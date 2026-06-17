import Database from 'better-sqlite3';
import path from 'path';
import mysql from 'mysql2/promise';
import { URL } from 'node:url';
import dotenv from 'dotenv';
import { SQLITE_SCHEMA, SQLITE_DEFAULT_SETTINGS, createMySQLTables } from './schema';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Use MySQL when DATABASE_URL is set, otherwise fall back to SQLite for Electron builds.
const useMySQL = process.env.DATABASE_URL || process.env.FORCE_MYSQL === 'true';

/** True when running against the embedded SQLite database (Electron / local dev). */
export const isElectron = !useMySQL && (process.env.ELECTRON === 'true' || process.env.NODE_ENV !== 'production');

let sqliteDb: any;
let mysqlPool: any;

if (isElectron) {
  // Embedded SQLite for the Electron desktop build.
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL'); // better concurrency

  sqliteDb.exec(SQLITE_SCHEMA);
  sqliteDb.exec(SQLITE_DEFAULT_SETTINGS);
} else {
  // MySQL for web/server deployments.
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_user:clc_password@localhost:3306/clc_finance';
  const url = new URL(connectionString);

  mysqlPool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 20,
    insecureAuth: true,
    connectTimeout: 60000,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(url.password),
      auth_gssapi_client: () => () => Buffer.from(url.password),
    },
  });

  createMySQLTables(mysqlPool).catch(console.error);
}

export type SqlParams = any[];

/**
 * Unified query interface that hides the SQLite (sync, better-sqlite3) vs
 * MySQL (async, mysql2) differences behind a single async API. Repositories
 * use these helpers with plain parameterised SQL instead of branching on the
 * database engine in every function.
 */
export const query = {
  /** Run a SELECT and return all matching rows. */
  async all<T = any>(sql: string, params: SqlParams = []): Promise<T[]> {
    if (isElectron) {
      return sqliteDb.prepare(sql).all(...params) as T[];
    }
    const [rows] = await mysqlPool.execute(sql, params);
    return rows as T[];
  },

  /** Run a SELECT and return the first row (or undefined). */
  async get<T = any>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    if (isElectron) {
      return sqliteDb.prepare(sql).get(...params) as T | undefined;
    }
    const [rows] = await mysqlPool.execute(sql, params);
    return (rows as T[])[0];
  },

  /** Run an INSERT/UPDATE/DELETE. */
  async run(sql: string, params: SqlParams = []): Promise<void> {
    if (isElectron) {
      sqliteDb.prepare(sql).run(...params);
      return;
    }
    await mysqlPool.execute(sql, params);
  },

  /** Run several statements atomically inside a transaction. */
  async transaction(statements: Array<{ sql: string; params?: SqlParams }>): Promise<void> {
    if (isElectron) {
      const tx = sqliteDb.transaction(() => {
        for (const s of statements) {
          sqliteDb.prepare(s.sql).run(...(s.params || []));
        }
      });
      tx();
      return;
    }
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      for (const s of statements) {
        await connection.execute(s.sql, s.params || []);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

/** Close the underlying database connection. */
export const closeConnection = async (): Promise<void> => {
  if (isElectron) {
    sqliteDb.close();
  } else {
    await mysqlPool.end();
  }
};
