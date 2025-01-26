import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { Database as DatabaseType } from './types';

// Create database connection
const dialect = new SqliteDialect({
  database: new Database(
    process.env.NODE_ENV === 'test' 
      ? ':memory:' 
      : process.env.NODE_ENV === 'production'
      ? '/data/vocalcad.db'
      : './dev.db'
  )
});

// Export the database instance
export const db = new Kysely<DatabaseType>({
  dialect
}); 