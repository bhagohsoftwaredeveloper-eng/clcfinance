/**
 * Schema migration: make members.email optional.
 *
 * The member form, the server-side validator, and the API route all treat
 * email as an optional field — the route deliberately coerces a blank email
 * to NULL. The members.email column was still declared NOT NULL, so saving a
 * member without an email failed with error 23502.
 *
 * This drops the NOT NULL constraint. The UNIQUE constraint is intentionally
 * kept: Postgres allows multiple NULLs in a unique index, so any number of
 * members may have no email while real addresses stay unique.
 *
 * Also rewrites any empty-string emails to NULL. Empty strings DO collide
 * under the UNIQUE index, which would block a second member without an email.
 *
 * Safe to run repeatedly (idempotent). Runs inside a single transaction.
 *
 * Usage:
 *   node scripts/make-member-email-optional.js            # apply changes
 *   node scripts/make-member-email-optional.js --dry-run  # preview only
 *
 * Requires DATABASE_URL (same variable the app uses). On Railway/other cloud
 * Postgres, SSL is on by default; set DATABASE_SSL=false for plain local PG.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Pool } = require('pg');

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
    console.log(`Connected. ${DRY_RUN ? '[DRY RUN] ' : ''}Making members.email optional...\n`);

    const { rows: before } = await client.query(
      `SELECT is_nullable FROM information_schema.columns
       WHERE table_name = 'members' AND column_name = 'email'`
    );
    if (before.length === 0) {
      console.error('  ! members.email column not found — nothing to do.');
      process.exitCode = 1;
      return;
    }
    if (before[0].is_nullable === 'YES') {
      console.log('  members.email is already nullable — no constraint change needed.');
    } else {
      console.log('  members.email is currently NOT NULL — will drop the constraint.');
    }

    await client.query('BEGIN');

    // Empty strings would collide under the UNIQUE index; normalise them to NULL.
    const { rowCount: blanked } = await client.query(
      `UPDATE members SET email = NULL WHERE email = ''`
    );
    if (blanked > 0) {
      console.log(`  ${blanked} record(s): empty-string email -> NULL`);
    }

    await client.query('ALTER TABLE members ALTER COLUMN email DROP NOT NULL');
    console.log('  Dropped NOT NULL on members.email');

    if (DRY_RUN) {
      await client.query('ROLLBACK');
      console.log('\n[DRY RUN] No changes committed.');
    } else {
      await client.query('COMMIT');
      const { rows: after } = await client.query(
        `SELECT is_nullable FROM information_schema.columns
         WHERE table_name = 'members' AND column_name = 'email'`
      );
      console.log(`\nDone. members.email is_nullable = ${after[0].is_nullable}`);
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
