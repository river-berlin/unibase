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
      created_at: now,
      updated_at: now
    };

    return this.create<ObjectData>(objectData, transaction);
  }

  /**
   * Find objects by message ID
   * @param messageId - Message ID
   * @param transaction - Optional transaction object
   * @returns Object or undefined
   */
  async findByMessage(messageId: string, transaction: DB = db): Promise<ObjectData | undefined> {
    const query = `
      SELECT o.* 
      FROM ${this.tableName} o
      JOIN messages m ON o.id = m.object_id
      WHERE m.id = ?
    `;
    
    return transaction.get<ObjectData>(query, [messageId]);
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
  async findByProject(projectId: string, transaction: DB = db): Promise<ObjectWithMessageData[]> {
    const query = `
      SELECT o.*, m.id as message_id, m.created_at as message_created_at 
      FROM ${this.tableName} o
      JOIN messages m ON o.id = m.object_id
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.project_id = ?
      ORDER BY o.updated_at DESC
    `;
    
    return transaction.all<ObjectWithMessageData>(query, [projectId]);
  }
}

export default new Objects(); 