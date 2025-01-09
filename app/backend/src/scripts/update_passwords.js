import bcrypt from 'bcryptjs';
import { db } from '../database/db.js';

const PASSWORD = '123456abc';

async function updatePasswords() {
  try {
    // Get all users
    const users = await db
      .selectFrom('users')
      .select(['id'])
      .execute();

    for (const user of users) {
      // Generate new salt and hash for each user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(PASSWORD, salt);

      // Update user with new salt and password hash
      await db
        .updateTable('users')
        .set({
          salt,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .where('id', '=', user.id)
        .execute();

      console.log(`Updated user ${user.id}`);
    }

    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  }
}

updatePasswords(); 