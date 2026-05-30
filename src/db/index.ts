import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('pawrecord.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await initializeSchema(db);
  return db;
}

async function initializeSchema(database: SQLite.SQLiteDatabase) {
  const statements = CREATE_TABLES.split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await database.execAsync(stmt + ';');
  }

  const version = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );

  if (!version) {
    await database.runAsync(
      'INSERT INTO schema_version (version) VALUES (?)',
      [SCHEMA_VERSION]
    );
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
