import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables from the outermost directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from "../database/db";
import { Users } from "../database/models";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function listUsers() {
  try {
    // Ask for filter options
    console.log('List Users Options:');
    const filterEmail = await prompt('Filter by email (leave empty for no filter): ');
    const filterName = await prompt('Filter by name (leave empty for no filter): ');
    const isAdminStr = await prompt('Filter by admin status (yes/no/leave empty for all): ');
    
    const limitStr = await prompt('Number of users to show (default 10): ');
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    
    const offsetStr = await prompt('Offset (default 0): ');
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    
    // Build the where clause
    const where: Record<string, any> = {};
    
    if (filterEmail) {
      where.email = filterEmail;
    }
    
    if (filterName) {
      where.name = filterName;
    }
    
    if (isAdminStr.toLowerCase() === 'yes') {
      where.is_admin = 1;
    } else if (isAdminStr.toLowerCase() === 'no') {
      where.is_admin = 0;
    }
    
    // Get users with pagination
    const users = await Users.findAll({
      where,
      limit,
      offset,
      orderBy: 'created_at DESC'
    });
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM users';
    const countParams: any[] = [];
    
    if (Object.keys(where).length > 0) {
      const whereConditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
      const countQueryWithWhere = `${countQuery} WHERE ${whereConditions}`;
      Object.values(where).forEach(value => countParams.push(value));
      const countResult = await db.get<{ count: number }>(countQueryWithWhere, countParams);
      console.log(`Found ${countResult?.count || 0} users matching your criteria.`);
    } else {
      const countResult = await db.get<{ count: number }>(countQuery);
      console.log(`Total users: ${countResult?.count || 0}`);
    }
    
    console.log(`Showing ${users.length} users (offset: ${offset}, limit: ${limit}):`);
    
    if (users.length === 0) {
      console.log('No users found matching your criteria.');
    } else {
      // Format the output
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin ? 'Yes' : 'No',
        created_at: user.created_at,
        last_login: user.last_login_at || 'Never'
      }));
      
      console.table(formattedUsers);
    }
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
listUsers(); 