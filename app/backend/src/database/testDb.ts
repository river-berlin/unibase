import { Kysely, SqliteDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Database } from './types';

export async function createTestDb() {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(':memory:')
    })
  });

  // Get all migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts'))
    .sort();

  // Run each migration
  for (const file of migrationFiles) {
    const migration = require(path.join(migrationsDir, file));
    await migration.up(db);
  }

  return db;
}

export type TestDb = Kysely<Database>; 