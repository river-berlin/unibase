import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';

export interface FolderData {
  id?: string;
  name: string;
  organization_id: string;
  parent_folder_id?: string | null;
  path?: string;
  created_at?: string;
  updated_at?: string;
}

class Folders extends BaseModel {
  constructor() {
    super('folders');
  }

  /**
   * Create a new folder
   * @param data - Folder data
   * @param transaction - Optional transaction object
   * @returns Created folder
   */
  async createFolder(data: FolderData, transaction: DB = db): Promise<FolderData> {
    const now = new Date().toISOString();
    const folderId = data.id || uuidv4();
    
    // Generate path based on parent folder
    let path = '';
    if (data.parent_folder_id) {
      const parentFolder = await this.findById<FolderData>(data.parent_folder_id, transaction);
      if (!parentFolder) {
        throw new Error('Parent folder not found');
      }
      path = `${parentFolder.path}/${folderId}`;
    } else {
      path = `/${folderId}`;
    }
    
    const folderData: FolderData = {
      id: folderId,
      name: data.name,
      organization_id: data.organization_id,
      parent_folder_id: data.parent_folder_id || null,
      path: path,
      created_at: now,
      updated_at: now
    };

    if (transaction) {
      return this.create<FolderData>(folderData, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return this.create<FolderData>(folderData, db);
      });
    }
  }

  /**
   * Find folders by organization ID
   * @param organizationId - Organization ID
   * @param parentFolderId - Parent folder ID (null for root folders)
   * @param transaction - Optional transaction object
   * @returns Folders in the organization
   */
  async findByOrganization(
    organizationId: string, 
    parentFolderId: string | null = null, 
    transaction: DB = db
  ): Promise<FolderData[]> {
    const whereClause = {
      organization_id: organizationId,
      parent_folder_id: parentFolderId
    };
    
    if (transaction) {
      return this.findAll<FolderData>({
        where: whereClause,
        orderBy: 'name ASC'
      }, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return this.findAll<FolderData>({
          where: whereClause,
          orderBy: 'name ASC'
        }, db);
      });
    }
  }

  /**
   * Find all child folders (recursive)
   * @param folderId - Parent folder ID
   * @param transaction - Optional transaction object
   * @returns All child folders
   */
  async findAllChildren(folderId: string, transaction: DB = db): Promise<FolderData[]> {
    const query = `
      WITH RECURSIVE folder_tree AS (
        SELECT * FROM ${this.tableName} WHERE id = ?
        UNION ALL
        SELECT f.* FROM ${this.tableName} f
        JOIN folder_tree ft ON f.parent_folder_id = ft.id
      )
      SELECT * FROM folder_tree WHERE id != ?
      ORDER BY path
    `;
    
    if (transaction) {
      return transaction.all<FolderData>(query, [folderId, folderId]);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.all<FolderData>(query, [folderId, folderId]);
      });
    }
  }

  /**
   * Find folder ancestors
   * @param folderId - Folder ID
   * @param transaction - Optional transaction object
   * @returns Ancestor folders
   */
  async findAncestors(folderId: string, transaction: DB = db): Promise<FolderData[]> {
    const folder = await this.findById<FolderData>(folderId, transaction);
    if (!folder) {
      return [];
    }
    
    // Parse path to get ancestor IDs
    const pathParts = folder.path?.split('/').filter(Boolean) || [];
    if (pathParts.length <= 1) {
      return []; // No ancestors
    }
    
    // Remove the last part (current folder)
    pathParts.pop();
    
    const placeholders = pathParts.map(() => '?').join(', ');
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE id IN (${placeholders})
      ORDER BY path
    `;
    
    if (transaction) {
      return transaction.all<FolderData>(query, pathParts);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.all<FolderData>(query, pathParts);
      });
    }
  }

  /**
   * Update a folder
   * @param id - Folder ID
   * @param data - Folder data to update
   * @param transaction - Optional transaction object
   * @returns Updated folder
   */
  async updateFolder(id: string, data: Partial<FolderData>, transaction: DB = db): Promise<FolderData> {
    const updateData: Partial<FolderData> = {
      ...data,
      updated_at: new Date().toISOString()
    };

    // Don't allow updating organization_id or path directly
    delete updateData.organization_id;
    delete updateData.path;

    if (transaction) {
      return this.update<FolderData>(id, updateData, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return this.update<FolderData>(id, updateData, db);
      });
    }
  }

  /**
   * Move a folder to a different parent
   * @param id - Folder ID
   * @param newParentId - New parent folder ID (null for root)
   * @param transaction - Optional transaction object
   * @returns Updated folder
   */
  async moveFolder(id: string, newParentId: string | null, transaction: DB = db): Promise<FolderData> {
    if (transaction) {
      return this._moveFolderWithTransaction(id, newParentId, transaction);
    } else {
      return import('../db.js').then(({ db }) => {
        return db.transaction(tx => this._moveFolderWithTransaction(id, newParentId, tx));
      });
    }
  }

  /**
   * Internal method to move a folder with a transaction
   * @param id - Folder ID
   * @param newParentId - New parent folder ID (null for root)
   * @param transaction - Transaction object
   * @returns Updated folder
   * @private
   */
  private async _moveFolderWithTransaction(id: string, newParentId: string | null, transaction: DB): Promise<FolderData> {
    // Get the folder
    const folder = await this.findById<FolderData>(id, transaction);
    if (!folder) {
      throw new Error('Folder not found');
    }
    
    // Check if new parent exists (if not null)
    if (newParentId) {
      const newParent = await this.findById<FolderData>(newParentId, transaction);
      if (!newParent) {
        throw new Error('New parent folder not found');
      }
      
      // Check if new parent is not a descendant of this folder
      const descendants = await this.findAllChildren(id, transaction);
      if (descendants.some(d => d.id === newParentId)) {
        throw new Error('Cannot move a folder to its own descendant');
      }
    }
    
    // Generate new path
    let newPath = '';
    if (newParentId) {
      const newParent = await this.findById<FolderData>(newParentId, transaction);
      newPath = `${newParent?.path}/${id}`;
    } else {
      newPath = `/${id}`;
    }
    
    // Update the folder
    const query = `
      UPDATE ${this.tableName} 
      SET parent_folder_id = ?, path = ?, updated_at = ?
      WHERE id = ?
    `;
    
    await transaction.run(query, [
      newParentId, 
      newPath, 
      new Date().toISOString(),
      id
    ]);
    
    // Get all descendants
    const descendants = await this.findAllChildren(id, transaction);
    
    // Update paths of all descendants
    for (const descendant of descendants) {
      // Calculate new path by replacing the old prefix with the new one
      const oldPrefix = folder.path || '';
      const relativePath = descendant.path?.substring(oldPrefix.length) || '';
      const newDescendantPath = `${newPath}${relativePath}`;
      
      const updateQuery = `
        UPDATE ${this.tableName} 
        SET path = ?, updated_at = ?
        WHERE id = ?
      `;
      
      await transaction.run(updateQuery, [
        newDescendantPath, 
        new Date().toISOString(),
        descendant.id
      ]);
    }
    
    // Return the updated folder
    return this.findById<FolderData>(id, transaction) as Promise<FolderData>;
  }
}

export default new Folders(); 