/**
 * Data migration: normalise mismatched donation "network" values.
 *
 * The giving drawer stores the network name in the donations.category column.
 * Some older records were entered with typos, wrong casing, or the legacy
 * "Tithe" category, so they don't match any row in the networks table. This
 * script rewrites those values to their canonical network name.
 *
 * Safe to run repeatedly (idempotent) — records already using the correct
 * value are skipped. Runs inside a single transaction.
 *
 * Usage:
 *   node scripts/normalize-donation-networks.js            # apply changes
 *   node scripts/normalize-donation-networks.js --dry-run  # preview only
 *
 * Requires DATABASE_URL (same variable the app uses). On Railway/other cloud
 * Postgres, SSL is on by default; set DATABASE_SSL=false for plain local PG.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Pool } = require('pg');

// old value -> canonical network name (must exist in the networks table)
const MAP = {
  'Fab': 'FAB',
  'OVERCOMER & CONQUEROR': 'OVERCOMERS & CONQUEROR',
  'KINGDOM SOLDIER': 'KINGDOM SOLDIERS',
  'Phoenix': 'PHOENIX',
  'Tithe': 'N/A',
};

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Provide your PostgreSQL connection string.');
    process.exit(1);
  }
  const ssl = process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false };
  const pool = new Pool({ connectionString, ssl, connectionTimeoutMillis: 60000 });

  const client = await pool.connect();
  try {
    console.log(`Connected. ${DRY_RUN ? '[DRY RUN] ' : ''}Normalising donation networks...\n`);

    // Warn if any target network name is missing from the networks table.
    const { rows: netRows } = await client.query('SELECT name FROM networks');
    const networkNames = new Set(netRows.map((r) => r.name));
    for (const target of new Set(Object.values(MAP))) {
      if (!networkNames.has(target)) {
        console.warn(`  ! Warning: target network "${target}" not found in networks table.`);
      }
    }

    await client.query('BEGIN');
    let total = 0;
    for (const [oldValue, newValue] of Object.entries(MAP)) {
      const { rowCount } = await client.query(
        'UPDATE donations SET category = $1 WHERE category = $2',
        [newValue, oldValue]
      );
      if (rowCount > 0) {
        total += rowCount;
        console.log(`  ${rowCount} record(s): "${oldValue}" -> "${newValue}"`);
      }
    }

    if (DRY_RUN) {
      await client.query('ROLLBACK');
      console.log(`\n[DRY RUN] Would update ${total} record(s). No changes committed.`);
    } else {
      await client.query('COMMIT');
      console.log(`\nDone. ${total} record(s) updated.`);
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed (rolled back):', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
