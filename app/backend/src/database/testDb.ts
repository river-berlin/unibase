import { Kysely, SqliteDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Database } from './types';

export async function createTestDb() {
  // Use dev.db if TEST_USE_DEV_DB is set to 'true'
  const useDevDb = process.env.TEST_USE_DEV_DB === 'true';
  const dbPath = useDevDb ? './dev.db' : ':memory:';

  // If using dev.db, ensure it doesn't exist before tests
  if (useDevDb && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(dbPath)
    })
  });

  // Get all migration files from the dist directory
  const migrationsDir = path.join(process.cwd(), 'dist', 'database', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();

  // Run each migration
  for (const file of migrationFiles) {
    const migration = require(path.join(migrationsDir, file));
    await migration.up(db);
  }

  return db;
}

export async function cleanupTestDb(db: TestDb) {
  // Run all down migrations
  const migrationsDir = path.join(process.cwd(), 'dist', 'database', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort()
    .reverse();

  // Run each migration's down function
  for (const file of migrationFiles) {
    const migration = require(path.join(migrationsDir, file));
    await migration.down(db);
  }

  // Destroy the database connection
  await db.destroy();
}

export type TestDb = Kysely<Database>; 