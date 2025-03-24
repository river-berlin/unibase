import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the outermost directory
// __dirname gives the directory of the current file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from "../database/db";

async function main() {
    try {
        // Get list of all tables
        console.log("Database Tables:");
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        console.table(tables);

        // For each table, get its schema
        for (const table of tables) {
            const tableName = table.name;
            console.log(`\nSchema for table: ${tableName}`);
            
            // Get table info (columns and their types)
            const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
            console.table(tableInfo);
            
            // Get indexes for the table
            console.log(`\nIndexes for table: ${tableName}`);
            const indexes = await db.all(`PRAGMA index_list(${tableName})`);
            console.table(indexes);
            
            // For each index, get the columns it covers
            for (const index of indexes) {
                console.log(`\nColumns in index: ${index.name}`);
                const indexInfo = await db.all(`PRAGMA index_info(${index.name})`);
                console.table(indexInfo);
            }
            
            // Get foreign keys
            console.log(`\nForeign keys for table: ${tableName}`);
            const foreignKeys = await db.all(`PRAGMA foreign_key_list(${tableName})`);
            console.table(foreignKeys);
        }
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        // Close the database connection
        await db.close();
        console.log("Database connection closed");
    }
}

main();