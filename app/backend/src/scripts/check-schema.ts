import Database from 'better-sqlite3';

const db = new Database('dev.db');
const tableInfo = db.prepare('PRAGMA table_info(messages)').all();
console.table(tableInfo);
db.close(); 