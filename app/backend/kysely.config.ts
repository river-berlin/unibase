import { defineConfig } from 'kysely-ctl';
import Database from 'better-sqlite3';
import { SqliteDialect } from 'kysely';

let dbPath: string;

if (process.env.NODE_ENV === 'test') {
  dbPath = ':memory:';
} else if (process.env.NODE_ENV === 'production') {
  dbPath = '/data/vocalcad.db';
} else {
  dbPath = './dev.db';
}

export default defineConfig({
  dialect: new SqliteDialect({
    database: new Database(dbPath)
  }),
  migrations: {
    migrationFolder: './src/database/migrations'
  }
}); 