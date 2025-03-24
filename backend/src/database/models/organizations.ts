import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';

/**
 * Organization data interface
 */
export interface OrganizationData {
  id?: string;
  name: string;
  description?: string | null;
  is_default?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Organizations model class
 */
class Organizations extends BaseModel {
  constructor() {
    super('organizations');
  }

  /**
   * Create a new organization
   * @param data - Organization data
   * @param transaction - Optional transaction object
   * @returns Created organization
   */
  async createOrganization(data: OrganizationData, transaction: DB = db): Promise<OrganizationData> {
    const now = new Date().toISOString();
    const orgData: OrganizationData = {
      id: data.id || uuidv4(),
      name: data.name,
      description: data.description || null,
      is_default: data.is_default ? 1 : 0,
      created_at: now,
      updated_at: now
    };

    if (transaction) {
      return this.create<OrganizationData>(orgData, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          return this.create<OrganizationData>(orgData, tx);
        });
      });
    }
  }

  /**
   * Find the default organization
   * @param transaction - Optional transaction object
   * @returns Default organization or undefined
   */
  async findDefault(transaction: DB = db): Promise<OrganizationData | undefined> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_default = 1 LIMIT 1`;
    
    if (transaction) {
      return transaction.get<OrganizationData>(query);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.get<OrganizationData>(query);
      });
    }
  }

  /**
   * Find organizations by user ID (via organization_members)
   * @param userId - User ID
   * @param transaction - Optional transaction object
   * @returns Organizations the user belongs to
   */
  async findByUser(userId: string, transaction: DB = db): Promise<OrganizationData[]> {
    const query = `
      SELECT o.* 
      FROM ${this.tableName} o
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ?
      ORDER BY o.name ASC
    `;
    
    if (transaction) {
      return transaction.all<OrganizationData>(query, [userId]);
    } else {   
      return db.all<OrganizationData>(query, [userId]);
    }
  }

  /**
   * Update an organization
   * @param id - Organization ID
   * @param data - Organization data to update
   * @param transaction - Optional transaction object
   * @returns Updated organization
   */
  async updateOrganization(id: string, data: Partial<OrganizationData>, transaction: DB = db): Promise<OrganizationData> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    // Convert boolean is_default to number if present
    if (updateData.is_default !== undefined) {
      updateData.is_default = updateData.is_default ? 1 : 0;
    }

    if (transaction) {
      return this.update<OrganizationData>(id, updateData, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          return this.update<OrganizationData>(id, updateData, tx);
        });
      });
    }
  }

  /**
   * Set an organization as the default
   * @param id - Organization ID
   * @param transaction - Optional transaction object
   * @returns Updated organization
   */
  async setAsDefault(id: string, transaction: DB = db): Promise<OrganizationData> {
    // Use the transaction method if no transaction is provided
    if (!transaction) {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          return this._setAsDefaultWithTransaction(id, tx);
        });
      });
    }
    
    return this._setAsDefaultWithTransaction(id, transaction);
  }

  /**
   * Internal method to set an organization as default with a transaction
   * @param id - Organization ID
   * @param transaction - Transaction object
   * @returns Updated organization
   */
  private async _setAsDefaultWithTransaction(id: string, transaction: DB): Promise<OrganizationData> {
    // First, unset default for all organizations
    await transaction.run(`UPDATE ${this.tableName} SET is_default = 0`);
    
    // Then set the specified organization as default
    return this.updateOrganization(id, { is_default: 1 }, transaction);
  }
}

export default new Organizations(); 