/**
 * Data-access facade.
 *
 * This module preserves the original `@/lib/database` import surface so the API
 * routes don't need to change, while the actual implementation now lives in a
 * clean layered structure:
 *
 *   db/connection.ts   – engine setup + unified async query interface
 *   db/schema.ts       – SQLite/MySQL table definitions
 *   repositories/*     – one module per aggregate (members, donations, ...)
 *
 * Prefer importing directly from the repositories in new code.
 */
import { closeConnection } from './db/connection';

export * from './repositories/members.repository';
export * from './repositories/events.repository';
export * from './repositories/donations.repository';
export * from './repositories/expenses.repository';
export * from './repositories/users.repository';
export * from './repositories/lookups.repository';
export * from './repositories/settings.repository';
export * from './repositories/system.repository';

/** Close the underlying database connection. */
export const closeDatabase = closeConnection;
