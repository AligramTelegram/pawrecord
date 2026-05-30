export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    date_of_birth TEXT,
    gender TEXT NOT NULL DEFAULT 'unknown',
    color TEXT,
    microchip_id TEXT,
    photo_uri TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vaccines (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_given TEXT NOT NULL,
    next_due TEXT,
    vet_name TEXT,
    batch_number TEXT,
    notes TEXT,
    reminder_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'daily',
    start_date TEXT NOT NULL,
    end_date TEXT,
    times_per_day INTEGER NOT NULL DEFAULT 1,
    reminder_times TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weight_logs (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    weight_kg REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vet_visits (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    reason TEXT NOT NULL,
    vet_name TEXT,
    clinic TEXT,
    diagnosis TEXT,
    treatment TEXT,
    cost REAL,
    currency TEXT NOT NULL DEFAULT 'USD',
    follow_up_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    hour INTEGER NOT NULL,
    minute INTEGER NOT NULL,
    days TEXT NOT NULL DEFAULT 'daily',
    enabled INTEGER NOT NULL DEFAULT 1,
    notification_ids TEXT,
    created_at TEXT NOT NULL
  );
`;
