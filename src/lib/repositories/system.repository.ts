import { query } from '../db/connection';

/**
 * Clear all user-entered records (expenses, donations, events, members) in a
 * single transaction. The users table is intentionally preserved.
 */
export const resetSystemData = () =>
  query.transaction([
    { sql: 'DELETE FROM expenses' },
    { sql: 'DELETE FROM donations' },
    { sql: 'DELETE FROM events' },
    { sql: 'DELETE FROM members' },
  ]);
