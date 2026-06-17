import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createPostgresTables } from './schema';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * The pool and schema bootstrap are created lazily on first query rather than
 * at import time. This matters because Next.js imports route modules during the
 * build ("Collecting page data") — connecting or throwing at import time would
 * break the build on hosts where DATABASE_URL is only present at runtime.
 */
let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Provide your PostgreSQL connection string, e.g. ' +
        'postgresql://user:password@host:5432/database'
    );
  }

  // Cloud Postgres (Supabase / Neon / Railway / RDS) requires SSL. SSL is on by
  // default; set DATABASE_SSL=false for a plain local/internal Postgres.
  const ssl = process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false };

  pool = new Pool({
    connectionString,
    ssl,
    max: 20,
    connectionTimeoutMillis: 60000,
  });

  // Create the schema once, on first use.
  ready = createPostgresTables(pool);
  return pool;
}

/** Resolve the pool and make sure the schema exists before any query runs. */
async function getReadyPool(): Promise<Pool> {
  const p = getPool();
  await ready;
  return p;
}

/**
 * The repositories are written with `?` placeholders (the SQLite/MySQL style).
 * Postgres uses positional `$1, $2, ...`, so we translate on the way through.
 * None of our SQL contains a literal `?`, so a simple sequential replace is safe.
 */
function toPgPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

/** pg rejects `undefined` bind values; normalise them to NULL. */
function normaliseParams(params: any[]): any[] {
  return params.map((p) => (p === undefined ? null : p));
}

export type SqlParams = any[];

/**
 * Unified async query interface over the Postgres pool. Repositories use these
 * helpers with plain parameterised SQL and never touch the driver directly.
 */
export const query = {
  /** Run a SELECT and return all matching rows. */
  async all<T = any>(sql: string, params: SqlParams = []): Promise<T[]> {
    const p = await getReadyPool();
    const result = await p.query(toPgPlaceholders(sql), normaliseParams(params));
    return result.rows as T[];
  },

  /** Run a SELECT and return the first row (or undefined). */
  async get<T = any>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    const p = await getReadyPool();
    const result = await p.query(toPgPlaceholders(sql), normaliseParams(params));
    return result.rows[0] as T | undefined;
  },

  /** Run an INSERT/UPDATE/DELETE. */
  async run(sql: string, params: SqlParams = []): Promise<void> {
    const p = await getReadyPool();
    await p.query(toPgPlaceholders(sql), normaliseParams(params));
  },

  /** Run several statements atomically inside a transaction. */
  async transaction(statements: Array<{ sql: string; params?: SqlParams }>): Promise<void> {
    const p = await getReadyPool();
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      for (const s of statements) {
        await client.query(toPgPlaceholders(s.sql), normaliseParams(s.params || []));
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

/** Close the underlying database connection pool (no-op if never opened). */
export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    ready = null;
  }
};
