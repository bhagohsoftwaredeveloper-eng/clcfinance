import { query } from '../db/connection';

/**
 * Clear all user-entered records AND the configuration lists (categories,
 * giving types, service times, networks) in a single transaction. The users
 * table and app settings are intentionally preserved.
 *
 * Order matters: the data tables that hold foreign keys (donations →
 * giving_types) are cleared before the lookup tables they reference.
 */
export const resetSystemData = () =>
  query.transaction([
    // User-entered records first (they reference the lookup tables).
    { sql: 'DELETE FROM expenses' },
    { sql: 'DELETE FROM donations' },
    { sql: 'DELETE FROM events' },
    { sql: 'DELETE FROM members' },
    // Configuration / "manage" lists.
    { sql: 'DELETE FROM donation_categories' },
    { sql: 'DELETE FROM expense_categories' },
    { sql: 'DELETE FROM giving_types' },
    { sql: 'DELETE FROM service_times' },
    { sql: 'DELETE FROM networks' },
  ]);
