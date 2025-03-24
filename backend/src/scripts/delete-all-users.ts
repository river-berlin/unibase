import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

const parentDir = path.resolve(__dirname, '../../../');

// Load environment variables from the outermost directory
dotenv.config({ path: path.resolve(parentDir, '.env') });

console.log('path', path.resolve(parentDir, '.env'));

import { db } from "../database/db";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteAllUsers() {
  try {
    // Get count of users first
    const countResult = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const userCount = countResult?.count || 0;
    
    console.log(`Found ${userCount} users in the database.`);
    
    if (userCount === 0) {
      console.log('No users to delete.');
      return;
    }

    // Prompt for confirmation
    rl.question(`Are you sure you want to delete all ${userCount} users? This action cannot be undone. (yes/no): `, async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        // Start a transaction for safety
        await db.transaction(async (tx) => {
          // Delete related records first (organization_members, messages, etc.)
          await tx.run('DELETE FROM organization_members WHERE user_id IN (SELECT id FROM users)');
          await tx.run('DELETE FROM messages WHERE created_by IN (SELECT id FROM users)');
          
          // Finally delete the users
          const result = await tx.run('DELETE FROM users');
          console.log(`Deleted ${result.changes} users successfully.`);
        });
        
        console.log('All users have been deleted.');
      } else {
        console.log('Operation cancelled.');
      }
      
      rl.close();
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    rl.close();
  }
}

// Handle proper cleanup when the script exits
rl.on('close', () => {
  console.log('Exiting script.');
  process.exit(0);
});

// Run the main function
deleteAllUsers(); 