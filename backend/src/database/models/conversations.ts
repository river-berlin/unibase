import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';

/**
 * Conversation data interface
 */
export interface ConversationData {
  id: string;
  project_id: string;
  model: string;
  status: 'active' | 'archived' | 'deleted';
  updated_at: string;
}

/**
 * Conversations model class
 */
class Conversations extends BaseModel {
  constructor() {
    super('conversations');
  }

  /**
   * Create a new conversation
   * @param data - Conversation data
   * @param transaction - Optional transaction object
   * @returns Created conversation
   */
  async createConversation(data: ConversationData, transaction: DB = db): Promise<ConversationData> {
    return this.create<ConversationData>(data, transaction);
  }

  /**
   * Find active conversation for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Active conversation or undefined
   */
  async findActiveByProject(projectId: string, transaction: DB = db): Promise<ConversationData> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE project_id = ? AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
     const result = await transaction.get<ConversationData>(query, [projectId]);

     if (result == undefined){
       throw new Error("Could not retrieve conversation for project - there is an issue with project creation or inappropriate deletion somewhere!");
     }

     return result
  }

  /**
   * Find all conversations for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Conversations for the project
   */
  async findByProject(projectId: string, transaction: DB = db): Promise<ConversationData[]> {
    return this.findAll<ConversationData>({
      where: { project_id: projectId },
      orderBy: 'updated_at DESC'
    }, transaction);
  }

  /**
   * Archive a conversation
   * @param id - Conversation ID
   * @param transaction - Optional transaction object
   * @returns Updated conversation
   */
  async archiveConversation(id: string, transaction: DB = db): Promise<ConversationData> {
    const updateData = {
      status: 'archived',
      updated_at: new Date().toISOString()
    };

    return this.update<ConversationData>(id, updateData, transaction);
  }

  /**
   * Delete a conversation (mark as deleted)
   * @param id - Conversation ID
   * @param transaction - Optional transaction object
   * @returns Updated conversation
   */
  async deleteConversation(id: string, transaction: DB = db): Promise<ConversationData> {
    const updateData = {
      status: 'deleted',
      updated_at: new Date().toISOString()
    };

    return this.update<ConversationData>(id, updateData, transaction);
  }

  /**
   * Update conversation's last update time
   * @param id - Conversation ID
   * @param transaction - Optional transaction object
   * @returns Updated conversation
   */
  async updateLastActivity(id: string, transaction: DB = db): Promise<ConversationData> {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    return this.update<ConversationData>(id, updateData, transaction);
  }
}

export default new Conversations(); 