import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';

/**
 * Organization member data interface
 */
export interface OrganizationMemberData {
  id?: string;
  organization_id: string;
  user_id: string;
  role?: 'owner' | 'admin' | 'member';
  created_at?: string;
}

/**
 * Organization member with user data interface
 */
export interface OrganizationMemberWithUser extends OrganizationMemberData {
  name?: string;
  email?: string;
}

/**
 * OrganizationMembers model class
 */
class OrganizationMembers extends BaseModel {
  constructor() {
    super('organization_members');
  }

  /**
   * Add a user to an organization
   * @param data - Membership data
   * @param transaction - Optional transaction object
   * @returns Created membership
   */
  async addMember(data: OrganizationMemberData, transaction: DB = db): Promise<OrganizationMemberData> {
    const memberData: OrganizationMemberData = {
      id: data.id || uuidv4(),
      organization_id: data.organization_id,
      user_id: data.user_id,
      role: data.role || 'member',
      created_at: new Date().toISOString()
    };

    if (transaction) {
      return this.create<OrganizationMemberData>(memberData, transaction);
    } else {
      return db.transaction(async (tx) => {
          return this.create<OrganizationMemberData>(memberData, tx);
      });
    }
  }

  /**
   * Find members of an organization
   * @param organizationId - Organization ID
   * @param transaction - Optional transaction object
   * @returns Members of the organization
   */
  async findByOrganization(organizationId: string, transaction: DB = db): Promise<OrganizationMemberWithUser[]> {
    const query = `
      SELECT om.*, u.name, u.email 
      FROM ${this.tableName} om
      JOIN users u ON om.user_id = u.id
      WHERE om.organization_id = ?
      ORDER BY u.name ASC
    `;
    
    if (transaction) {
      return transaction.all<OrganizationMemberWithUser>(query, [organizationId]);
    } else {
      return db.all<OrganizationMemberWithUser>(query, [organizationId]);
    }
  }

  /**
   * Find members of an organization - simple version does not include user data
   * @param organizationId - Organization ID
   * @param transaction - Optional transaction object
   * @returns Members of the organization
   */
  async simpleFindByOrganization(organizationId: string, transaction: DB = db): Promise<OrganizationMemberData[]> {
    return this.findAll<OrganizationMemberData>({
      where: { organization_id: organizationId }
    }, transaction);
  }

  /**
   * Find organizations a user belongs to
   * @param userId - User ID
   * @param transaction - Optional transaction object
   * @returns Memberships of the user
   */
  async findByUser(userId: string, transaction: DB = db): Promise<OrganizationMemberData[]> {
    if (transaction) {
      return this.findAll<OrganizationMemberData>({
        where: { user_id: userId }
      }, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return this.findAll<OrganizationMemberData>({
          where: { user_id: userId }
        }, db);
      });
    }
  }

  /**
   * Check if a user is a member of an organization
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param transaction - Optional transaction object
   * @returns True if user is a member
   */
  async isMember(organizationId: string, userId: string, transaction: DB = db): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM ${this.tableName} 
      WHERE organization_id = ? AND user_id = ?
    `;
    
    if (transaction) {
      const result = await transaction.get<{ count: number }>(query, [organizationId, userId]);
      return result ? result.count > 0 : false;
    } else {
      return import('../db.js').then(async ({ db }) => {
        const result = await db.get<{ count: number }>(query, [organizationId, userId]);
        return result ? result.count > 0 : false;
      });
    }
  }

  /**
   * Check if a user has a specific role in an organization
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param roles - Role or roles to check
   * @param transaction - Optional transaction object
   * @returns True if user has the role
   */
  async hasRole(
    organizationId: string, 
    userId: string, 
    roles: string | string[], 
    transaction: DB = db
  ): Promise<boolean> {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const placeholders = roleArray.map(() => '?').join(', ');
    
    const query = `
      SELECT COUNT(*) as count 
      FROM ${this.tableName} 
      WHERE organization_id = ? AND user_id = ? AND role IN (${placeholders})
    `;
    
    const params = [organizationId, userId, ...roleArray];
    
    if (transaction) {
      const result = await transaction.get<{ count: number }>(query, params);
      return result ? result.count > 0 : false;
    } else {
      return import('../db.js').then(async ({ db }) => {
        const result = await db.get<{ count: number }>(query, params);
        return result ? result.count > 0 : false;
      });
    }
  }

  /**
   * Update a member's role
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param role - New role
   * @param transaction - Optional transaction object
   * @returns Updated membership
   */
  async updateRole(
    organizationId: string, 
    userId: string, 
    role: 'owner' | 'admin' | 'member', 
    transaction: DB = db
  ): Promise<OrganizationMemberData | undefined> {
    // Use the transaction method if no transaction is provided
    if (!transaction) {
      return import('../db.js').then(({ db }) => {
        return db.transaction(async (tx) => {
          return this._updateRoleWithTransaction(organizationId, userId, role, tx);
        });
      });
    }
    
    return this._updateRoleWithTransaction(organizationId, userId, role, transaction);
  }

  /**
   * Internal method to update a member's role with a transaction
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param role - New role
   * @param transaction - Transaction object
   * @returns Updated membership
   */
  private async _updateRoleWithTransaction(
    organizationId: string, 
    userId: string, 
    role: 'owner' | 'admin' | 'member', 
    transaction: DB
  ): Promise<OrganizationMemberData | undefined> {
    const query = `
      UPDATE ${this.tableName} 
      SET role = ? 
      WHERE organization_id = ? AND user_id = ?
    `;
    
    const result = await transaction.run(query, [role, organizationId, userId]);
    
    if (result.changes === 0) {
      throw new Error('Membership not found');
    }
    
    // Get the updated membership
    const getQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE organization_id = ? AND user_id = ?
    `;
    
    return transaction.get<OrganizationMemberData>(getQuery, [organizationId, userId]);
  }

  /**
   * Remove a member from an organization
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param transaction - Optional transaction object
   * @returns True if removed
   */
  async removeMember(organizationId: string, userId: string, transaction: DB = db): Promise<boolean> {
    const query = `
      DELETE FROM ${this.tableName} 
      WHERE organization_id = ? AND user_id = ?
    `;
    
    if (transaction) {
      const result = await transaction.run(query, [organizationId, userId]);
      return result.changes > 0;
    } else {
      return import('../db.js').then(async ({ db }) => {
        const result = await db.run(query, [organizationId, userId]);
        return result.changes > 0;
      });
    }
  }
}

export default new OrganizationMembers(); 