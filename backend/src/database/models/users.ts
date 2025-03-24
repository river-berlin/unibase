import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { db, DB } from '../db';

export interface UserData {
  id?: string;
  email: string;
  name: string;
  password?: string; // Only used for creation, not stored
  password_hash?: string;
  salt?: string;
  is_admin?: number | boolean;
  stripe_customer_id?: string | null;
  avatar?: Buffer | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

class Users extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Create a new user
   * @param data - User data
   * @param transaction - Optional transaction object
   * @returns Created user (without password)
   */
  async createUser(data: UserData, transaction: DB = db): Promise<UserData> {
    if (!data.password) {
      throw new Error('Password is required');
    }

    const now = new Date().toISOString();
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(data.password, salt);
    
    const userData: UserData = {
      id: data.id || uuidv4(),
      email: data.email.toLowerCase(),
      name: data.name,
      password_hash: passwordHash,
      salt: salt,
      is_admin: data.is_admin ? 1 : 0,
      stripe_customer_id: data.stripe_customer_id || null,
      avatar: data.avatar || null,
      last_login_at: null,
      created_at: now,
      updated_at: now
    };

    if (transaction) {
      const user = await this.create<UserData>(userData, transaction);
      
      // Don't return sensitive information
      const safeUser = { ...user };
      delete safeUser.password_hash;
      delete safeUser.salt;
      
      return safeUser;
    } else {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          const user = await this.create<UserData>(userData, tx);
          
          // Don't return sensitive information
          const safeUser = { ...user };
          delete safeUser.password_hash;
          delete safeUser.salt;
          
          return safeUser;
        });
      });
    }
  }

  /**
   * Find a user by email
   * @param email - User email
   * @param transaction - Optional transaction object
   * @returns User or undefined
   */
  async findByEmail(email: string, transaction: DB = db): Promise<UserData | undefined> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = ? LIMIT 1`;
    
    if (transaction) {
      return transaction.get<UserData>(query, [email.toLowerCase()]);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.get<UserData>(query, [email.toLowerCase()]);
      });
    }
  }

  /**
   * Authenticate a user
   * @param email - User email
   * @param password - Plain text password
   * @param transaction - Optional transaction object
   * @returns Authenticated user or null
   */
  async authenticate(email: string, password: string, transaction: DB = db): Promise<UserData | null> {
    const user = await this.findByEmail(email, transaction);
    
    if (!user || !user.salt || !user.password_hash) {
      return null;
    }
    
    const passwordHash = this.hashPassword(password, user.salt);
    
    if (passwordHash !== user.password_hash) {
      return null;
    }
    
    // Update last login time
    await this.updateLastLogin(user.id as string, transaction);
    
    // Don't return sensitive information
    const authenticatedUser = { ...user };
    delete authenticatedUser.password_hash;
    delete authenticatedUser.salt;
    
    return authenticatedUser;
  }

  /**
   * Update a user's last login time
   * @param id - User ID
   * @param transaction - Optional transaction object
   * @returns Promise<void>
   */
  async updateLastLogin(id: string, transaction: DB = db): Promise<void> {
    const updateData = {
      last_login_at: new Date().toISOString()
    };

    if (transaction) {
      await this.update<UserData>(id, updateData, transaction);
    } else {
      await import('../db.js').then(({ db }) => {
        return this.update<UserData>(id, updateData, db);
      });
    }
  }

  /**
   * Update a user's password
   * @param id - User ID
   * @param newPassword - New plain text password
   * @param transaction - Optional transaction object
   * @returns Updated user (without password)
   */
  async updatePassword(id: string, newPassword: string, transaction: DB = db): Promise<UserData> {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(newPassword, salt);
    
    const updateData = {
      password_hash: passwordHash,
      salt: salt,
      updated_at: new Date().toISOString()
    };

    if (transaction) {
      const user = await this.update<UserData>(id, updateData, transaction);
      
      // Don't return sensitive information
      const safeUser = { ...user };
      delete safeUser.password_hash;
      delete safeUser.salt;
      
      return safeUser;
    } else {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          const user = await this.update<UserData>(id, updateData, tx);
          
          // Don't return sensitive information
          const safeUser = { ...user };
          delete safeUser.password_hash;
          delete safeUser.salt;
          
          return safeUser;
        });
      });
    }
  }

  /**
   * Update a user
   * @param id - User ID
   * @param data - User data to update
   * @param transaction - Optional transaction object
   * @returns Updated user (without password)
   */
  async updateUser(id: string, data: Partial<UserData>, transaction: DB = db): Promise<UserData> {
    const updateData: Partial<UserData> = {
      ...data,
      updated_at: new Date().toISOString()
    };

    // Convert boolean is_admin to number if present
    if (typeof updateData.is_admin === 'boolean') {
      updateData.is_admin = updateData.is_admin ? 1 : 0;
    }

    // Don't allow updating sensitive fields directly
    delete updateData.password_hash;
    delete updateData.salt;

    if (transaction) {
      const user = await this.update<UserData>(id, updateData, transaction);
      
      // Don't return sensitive information
      const safeUser = { ...user };
      delete safeUser.password_hash;
      delete safeUser.salt;
      
      return safeUser;
    } else {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          const user = await this.update<UserData>(id, updateData, tx);
          
          // Don't return sensitive information
          const safeUser = { ...user };
          delete safeUser.password_hash;
          delete safeUser.salt;
          
          return safeUser;
        });
      });
    }
  }

  /**
   * Hash a password with the given salt
   * @param password - Plain text password
   * @param salt - Salt
   * @returns Hashed password
   */
  hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }
}

export default new Users(); 