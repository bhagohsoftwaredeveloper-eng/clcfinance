/**
 * PostgreSQL schema definition.
 *
 * Notes on type choices:
 * - Date columns (join_date, event/donation/expense date) are TEXT and store
 *   ISO strings, matching how the app handles dates everywhere (no timezone
 *   surprises). created_at/updated_at use TIMESTAMP defaults.
 * - Money is NUMERIC(10,2); the API layer parses it back to a number.
 * - Enumerations are expressed with CHECK constraints.
 * - Tables are created in FK-dependency order.
 */

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Staff')),
    password TEXT,
    permissions TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    join_date TEXT NOT NULL,
    avatar_url TEXT,
    address TEXT,
    network VARCHAR(255) NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS giving_types (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    resource VARCHAR(50) NOT NULL CHECK (resource IN ('Main Hall', 'Community Room', 'Chapel'))
  )`,

  `CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(255) PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    member_id VARCHAR(255) REFERENCES members(id),
    amount NUMERIC(10,2) NOT NULL,
    date TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    giving_type_id VARCHAR(255) REFERENCES giving_types(id),
    service_time VARCHAR(255),
    recorded_by_id VARCHAR(255) REFERENCES users(id),
    reference VARCHAR(255)
  )`,

  `CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    recorded_by_id VARCHAR(255) REFERENCES users(id)
  )`,

  `CREATE TABLE IF NOT EXISTS donation_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS expense_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS service_times (
    id VARCHAR(255) PRIMARY KEY,
    time VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS networks (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'global',
    app_name VARCHAR(255) NOT NULL DEFAULT 'CLC Finances',
    logo_url VARCHAR(500) NOT NULL DEFAULT '/CLC logo2.png',
    theme VARCHAR(10) NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    backup_time VARCHAR(10) NOT NULL DEFAULT '02:00',
    backup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // Seed the singleton settings row.
  `INSERT INTO settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING`,

  // Seed a default administrator so a fresh database is still loginable.
  // Default credentials: username "admin", password "admin123" — change after first login.
  `INSERT INTO users (id, name, username, role, password, permissions)
   VALUES ('admin-1', 'Administrator', 'admin', 'Admin', 'admin123',
     '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true, "settings": true}')
   ON CONFLICT (id) DO NOTHING`,
];

/** Create all tables (idempotent) on the given pool. */
export const createPostgresTables = async (pool: any): Promise<void> => {
  try {
    for (const statement of STATEMENTS) {
      await pool.query(statement);
    }
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};
