/**
 * Database schema definitions. Kept in one place so the SQLite and MySQL
 * table layouts stay in sync. The DDL is identical in intent across both
 * engines, with type/dialect differences where required.
 */

export const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
    password TEXT,
    permissions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    join_date TEXT NOT NULL,
    avatar_url TEXT,
    address TEXT,
    network TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    resource TEXT NOT NULL CHECK (resource IN ('Main Hall', 'Community Room', 'Chapel'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL,
    member_id TEXT REFERENCES members(id),
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    giving_type_id TEXT REFERENCES giving_types(id),
    service_time TEXT,
    recorded_by_id TEXT REFERENCES users(id),
    reference TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    recorded_by_id TEXT REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS donation_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expense_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS service_times (
    id TEXT PRIMARY KEY,
    time TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS giving_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS networks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    app_name TEXT NOT NULL DEFAULT 'CLC Finances',
    logo_url TEXT NOT NULL DEFAULT '/CLC logo2.png',
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    backup_time TEXT NOT NULL DEFAULT '02:00',
    backup_enabled BOOLEAN NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

export const SQLITE_DEFAULT_SETTINGS = `
  INSERT OR IGNORE INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES
  ('global', 'CLC Finances', '/CLC logo2.png', 'dark', '02:00', 1, CURRENT_TIMESTAMP);
`;

/** Create the MySQL tables (the pool variant uses parameterised execute calls). */
export const createMySQLTables = async (pool: any): Promise<void> => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('Admin', 'Staff') NOT NULL,
        password TEXT,
        permissions TEXT NOT NULL
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(255),
        join_date DATETIME NOT NULL,
        avatar_url TEXT,
        address TEXT,
        network VARCHAR(255) NOT NULL
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        description TEXT NOT NULL,
        resource ENUM('Main Hall', 'Community Room', 'Chapel') NOT NULL
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS donations (
        id VARCHAR(255) PRIMARY KEY,
        donor_name VARCHAR(255) NOT NULL,
        member_id VARCHAR(255),
        FOREIGN KEY (member_id) REFERENCES members(id),
        amount DECIMAL(10,2) NOT NULL,
        date DATETIME NOT NULL,
        category VARCHAR(255) NOT NULL,
        giving_type_id VARCHAR(255),
        FOREIGN KEY (giving_type_id) REFERENCES giving_types(id),
        service_time VARCHAR(255),
        recorded_by_id VARCHAR(255),
        FOREIGN KEY (recorded_by_id) REFERENCES users(id),
        reference VARCHAR(255)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(255) PRIMARY KEY,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATETIME NOT NULL,
        category VARCHAR(255) NOT NULL,
        recorded_by_id VARCHAR(255),
        FOREIGN KEY (recorded_by_id) REFERENCES users(id)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS donation_categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS service_times (
        id VARCHAR(255) PRIMARY KEY,
        time VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS giving_types (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS networks (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'global',
        app_name VARCHAR(255) NOT NULL DEFAULT 'CLC Finances',
        logo_url VARCHAR(500) NOT NULL DEFAULT '/CLC logo2.png',
        theme ENUM('light', 'dark') NOT NULL DEFAULT 'dark',
        backup_time VARCHAR(10) NOT NULL DEFAULT '02:00',
        backup_enabled BOOLEAN NOT NULL DEFAULT 1,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};
