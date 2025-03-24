import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the outermost directory
// __dirname gives the directory of the current file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Users } from "../database/models";

// Create an async function to run the query
async function main() {
  try {
    // Query the users table
    const rows = await Users.findAll();
    console.table(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Run the main function
main();