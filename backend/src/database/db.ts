import sqlite3 from 'sqlite3';
import path from 'path';

export type SQLiteDatabase = sqlite3.Database;
export type QueryParams = any[] | Record<string, any>;

export interface RunResult {
  lastID: number;
  changes: number;
}

// Track if the database has been closed
let dbClosed = false;

if (!process.env.DB_PATH) {
  throw new Error('DB_PATH is not set');
}

const topPath = path.resolve(__dirname, '../../../');

// Always use dev.db for all environments
const dbPath = path.resolve(topPath, process.env.DB_PATH);

// Enable verbose mode for debugging
sqlite3.verbose();

// Create database connection
const sqliteDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

/**
 * Database wrapper class with transaction support
 */
export class DB {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  /**
   * Run a query that doesn't return rows
   * @param sql SQL query
   * @param params Query parameters
   * @returns Promise with run result
   */
  async run(sql: string, params: QueryParams = []): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this);
      });
    });
  }

  /**
   * Get a single row
   * @param sql SQL query
   * @param params Query parameters
   * @returns Promise with the row or undefined
   */
  async get<T = any>(sql: string, params: QueryParams = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as T);
      });
    });
  }

  /**
   * Get multiple rows
   * @param sql SQL query
   * @param params Query parameters
   * @returns Promise with rows
   */
  async all<T = any>(sql: string, params: QueryParams = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as T[]);
      });
    });
  }

  /**
   * Execute SQL statements
   * @param sql SQL statements
   * @returns Promise
   */
  async exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Begin a transaction
   * @returns Promise with transaction object
   */
  async beginTransaction(): Promise<DB> {
    await this.run('BEGIN TRANSACTION');
    return this;
  }

  /**
   * Commit a transaction
   * @returns Promise
   */
  async commit(): Promise<void> {
    await this.run('COMMIT');
  }

  /**
   * Rollback a transaction
   * @returns Promise
   */
  async rollback(): Promise<void> {
    await this.run('ROLLBACK');
  }

  /**
   * Run a function in a transaction
   * @param fn Function to run in transaction
   * @returns Promise with function result
   */
  async transaction<T>(fn: (tx: DB) => Promise<T>): Promise<T> {
    await this.beginTransaction();
    try {
      const result = await fn(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  /**
   * Close the database connection
   * @returns Promise
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        dbClosed = true;
        resolve();
      });
    });
  }
}

// Export a singleton instance
export const db = new DB(sqliteDb);

// Close the database when the process exits, but only if not already closed
process.on('exit', () => {
  if (!dbClosed) {
    sqliteDb.close();
  }
});