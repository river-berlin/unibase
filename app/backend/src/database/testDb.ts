import { Kysely, SqliteDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Database } from './types';

export type TestDb = Kysely<Database>;

export async function createTestDb(): Promise<TestDb> {
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

  await migrateToLatest(db);
  return db;
}

async function migrateToLatest(db: TestDb) {
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
}

export async function dropAllTables(db: TestDb) {
  await db.schema
    .dropTable('messages')
    .ifExists()
    .execute();
  
  await db.schema
    .dropTable('conversations')
    .ifExists()
    .execute();
  
  await db.schema
    .dropTable('folders')
    .ifExists()
    .execute();
  
  await db.schema
    .dropTable('projects')
    .ifExists()
    .execute();
  
  await db.schema
    .dropTable('organization_members')
    .ifExists()
    .execute();
  
  await db.schema
    .dropTable('organizations')
    .ifExists()
    .execute();
  
  await db.schema
    .dropTable('users')
    .ifExists()
    .execute();
}

export async function cleanupTestDb(db: TestDb) {
  await dropAllTables(db);
  await db.destroy();
}