/**
 * Script to assign usernames to existing users
 * 
 * This script should be run after the migration that adds the username column to the users table.
 * It will assign a unique username to all users who don't have one yet.
 */
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the outermost directory
// __dirname gives the directory of the current file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { db } from '../database/db';
import Users from '../database/models/users';


async function assignUsernames() {
  console.log('Starting username assignment for existing users...');
  
  try {
    // Get all users without a username
    const query = 'SELECT id, name FROM users WHERE username IS NULL';
    const usersWithoutUsername = await db.all(query);
    
    console.log(`Found ${usersWithoutUsername.length} users without a username.`);
    
    // Assign a username to each user
    for (const user of usersWithoutUsername) {
      try {
        // Generate a unique username based on the user's name
        const username = await Users.generateUniqueUsername(user.name);
        
        // Update the user with the new username
        const updateQuery = 'UPDATE users SET username = ? WHERE id = ?';
        await db.run(updateQuery, [username, user.id]);
        
        console.log(`Assigned username '${username}' to user ${user.id} (${user.name}).`);
      } catch (error) {
        console.error(`Failed to assign username to user ${user.id}:`, error);
      }
    }
    
    console.log('Username assignment completed.');
  } catch (error) {
    console.error('Error assigning usernames:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
assignUsernames();
