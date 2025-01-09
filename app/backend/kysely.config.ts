import { defineConfig } from 'kysely-ctl';
import Database from 'better-sqlite3';
import { SqliteDialect } from 'kysely';

export default defineConfig({
  dialect: new SqliteDialect({
    database: new Database(
      process.env.NODE_ENV === 'test' 
        ? ':memory:' 
        : process.env.NODE_ENV === 'production'
        ? '/data/vocalcad.db'
        : './dev.db'
    )
  }),
  migrations: {
    migrationFolder: './src/database/migrations'
  }
}); 