import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';

/**
 * Object data interface
 */
export interface ObjectData {
  id?: string;
  object: string;
  created_at?: string;
  updated_at?: string;
  project_id: string;
  filepath?: string;
  filename?: string;
}

/**
 * Object with message data interface
 */
export interface ObjectWithMessageData extends ObjectData {
  message_id?: string;
  message_created_at?: string;
}

/**
 * Objects model class
 */
class Objects extends BaseModel {
  constructor() {
    super('objects');
  }

  /**
   * Create a new object
   * @param data - Object data
   * @param transaction - Optional transaction object
   * @returns Created object
   */
  async createObject(data: ObjectData, transaction: DB = db): Promise<ObjectData> {
    const now = new Date().toISOString();
    const objectData: ObjectData = {
      id: data.id || uuidv4(),
      object: data.object,
      project_id: data.project_id,
      filepath: data.filepath,
      filename: data.filename,
      created_at: now,
      updated_at: now
    };

    return this.create<ObjectData>(objectData, transaction);
  }

  /**
   * Update an object
   * @param id - Object ID
   * @param data - Object data to update
   * @param transaction - Optional transaction object
   * @returns Updated object
   */
  async updateObject(id: string, data: Partial<ObjectData>, transaction: DB = db): Promise<ObjectData> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    return this.update<ObjectData>(id, updateData, transaction);
  }

  /**
   * Find the latest object for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Latest object or undefined
   */
  async findLatestByProject(projectId: string, transaction: DB = db): Promise<ObjectData | undefined> {
    const query = `
      SELECT * 
      FROM ${this.tableName} 
      WHERE project_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    return transaction.get<ObjectData>(query, [projectId]);
  }

  /**
   * Find all objects for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Array of objects belonging to the project
   */
  async findAllObjectsInProject(projectId: string, transaction: DB = db): Promise<ObjectData[]> {
      const query = `
        SELECT * 
        FROM ${this.tableName} 
        WHERE project_id = ?
        ORDER BY updated_at DESC
      `;

      return transaction.all<ObjectData>(query, [projectId]);
  }

  /**
   * Find all objects for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Objects for the project
   */
  async findByProject(projectId: string, transaction: DB = db): Promise<ObjectData[]> {
    const query = `
      SELECT * 
      FROM ${this.tableName}
      WHERE project_id = ?
      ORDER BY updated_at DESC
    `;
    
    return transaction.all<ObjectData>(query, [projectId]);
  }

  /**
   * Delete an object
   * @param id - Object ID
   * @param transaction - Optional transaction object
   * @returns True if deleted, false if not found
   */
  async deleteObject(id: string, transaction: DB = db): Promise<boolean> {
    return this.delete(id, transaction);
  }
}

export default new Objects(); 