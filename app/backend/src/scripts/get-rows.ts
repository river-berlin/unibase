import Database from 'better-sqlite3';

const db = new Database('dev.db');

// Query the first 10 rows from the messages table
const rows = db.prepare('SELECT * FROM messages LIMIT 10').all();

console.table(rows);

db.close(); 