import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';
import Conversations from './conversations';
import Objects from './objects';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages/messages';
/**
 * Message data interface
 */
export interface MessageData {
  id?: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: string;
  tool_call_id?: string;
  tool_output?: string;
  input_tokens_used?: number;
  output_tokens_used?: number;
  error?: string | null;
  object_id?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Message with object data interface
 */
export interface MessageWithObject extends MessageData {
  object?: string;
}

/**
 * Extended chat message for Claude
 */
export interface ExtendedChatMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string | Array<{
    type: string;
    tool_use_id?: string;
    content?: string;
    image_url?: {
      url: string;
    };
  }>;
  tool_call_id?: string;
  tool_output?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * Normalized message for client
 */
export interface NormalizedMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: any[];
  tool_call_id?: string;
  tool_calls: any[];
  tool_output: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Messages model class
 */
class Messages extends BaseModel {
  constructor() {
    super('messages');
  }

  /**
   * Add a message to a conversation
   * @param data - Message data
   * @param transaction - Optional transaction object
   * @returns Created message
   */
  async addMessage(data: MessageData, transaction: DB = db): Promise<MessageData> {
    // Use the transaction method if no transaction is provided
    if (!transaction) {
      return db.transaction(async (tx) => {
        return this._addMessageWithTransaction(data, tx);
      });
    }
    
    return this._addMessageWithTransaction(data, transaction);
  }

  /**
   * Internal method to add a message with a transaction
   * @param data - Message data
   * @param transaction - Transaction object
   * @returns Created message
   */
  private async _addMessageWithTransaction(data: MessageData, transaction: DB): Promise<MessageData> {
    const now = new Date().toISOString();
    
    // Prepare content
    let content = data.content;
    if (typeof content === 'object') {
      content = JSON.stringify(content);
    }
    
    // Prepare tool_calls
    let toolCalls = data.tool_calls;
    if (typeof toolCalls === 'object') {
      toolCalls = JSON.stringify(toolCalls);
    }
    
    // Prepare tool_output
    let toolOutput = data.tool_output;
    if (typeof toolOutput === 'object') {
      toolOutput = JSON.stringify(toolOutput);
    }
    
    const messageData: MessageData = {
      id: data.id || uuidv4(),
      conversation_id: data.conversation_id,
      role: data.role,
      content: content,
      tool_calls: toolCalls || undefined,
      tool_call_id: data.tool_call_id || undefined,
      tool_output: toolOutput || undefined,
      input_tokens_used: data.input_tokens_used,
      output_tokens_used: data.output_tokens_used,
      error: data.error || null,
      object_id: data.object_id || null,
      created_by: data.created_by,
      created_at: now,
      updated_at: now
    };
    
    // Create the message
    const message = await this.create<MessageData>(messageData, transaction);
    
    // Update conversation's last activity time
    await Conversations.updateLastActivity(data.conversation_id, transaction);
    
    return message;
  }

  /**
   * Add Claude messages to a conversation
   * @param messages - Extended chat messages
   * @param projectId - Project ID
   * @param userId - User ID
   * @param scad - SCAD code (optional)
   * @param transaction - Optional transaction object
   * @returns Normalized messages
   */
  async addClaudeMessages(
    messages: MessageParam[],
    projectId: string,
    userId: string,
    scad: string,
    transaction: DB = db
  ): Promise<NormalizedMessage[]> {
    return transaction.transaction(async (tx: DB) => {
      // Get or create conversation
      let conversation = await this.getOrCreateConversation(projectId, tx);

      // Create object record if there's SCAD code
      const objectId = scad ? await this.createObjectIfNeeded(scad, projectId, tx) : null;

      // Format and insert messages
      const formattedMessages: MessageData[] = [];
      for (const message of messages) {
        let normalizedContent;

        // Normalize content format
        if (typeof message.content === 'string') {
          normalizedContent = [{
            type: "text",
            text: message.content
          }];
        } else {
          normalizedContent = message.content;
        }

        formattedMessages.push({
          id: uuidv4(),
          conversation_id: conversation.id,
          role: message.role,
          content: JSON.stringify(normalizedContent),
          object_id: message.role === "assistant" ? objectId : null,
          tool_call_id: undefined,
          tool_calls: undefined,
          tool_output: undefined,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Insert all messages
      for (const messageData of formattedMessages) {
        await this.addMessage(messageData, tx);
      }

      // Update conversation's last activity time
      await Conversations.updateLastActivity(conversation.id, tx);

      // Return normalized messages
      return formattedMessages.map(message => ({
        id: message.id as string,
        conversation_id: message.conversation_id,
        role: message.role,
        content: JSON.parse(message.content),
        tool_call_id: message.tool_call_id,
        tool_calls: message.tool_calls ? JSON.parse(message.tool_calls) : [],
        tool_output: message.tool_output ? JSON.parse(message.tool_output as string) : [],
        created_by: message.created_by,
        created_at: message.created_at as string,
        updated_at: message.updated_at as string
      }));
    });
  }

  /**
   * Get or create a conversation for a project
   * @param projectId - Project ID
   * @param transaction - Transaction object
   * @returns Conversation ID
   */
  private async getOrCreateConversation(projectId: string, transaction: DB): Promise<{ id: string }> {
    const query = `
      SELECT id FROM conversations
      WHERE project_id = ? AND status = 'active'
      LIMIT 1
    `;
    
    const conversation = await transaction.get<{ id: string }>(query, [projectId]);
    
    if (conversation) {
      return conversation;
    }
    
    // Create new conversation
    const conversationId = uuidv4();
    const model = process.env.CLAUDE_BASE_URL + '--' + process.env.CLAUDE_MODEL;
    
    await Conversations.createConversation({
      id: conversationId,
      project_id: projectId,
      model: model,
      status: 'active'
    }, transaction);
    
    return { id: conversationId };
  }

  /**
   * Create an object record if needed
   * @param scad - SCAD code
   * @param transaction - Transaction object
   * @returns Object ID
   */
  private async createObjectIfNeeded(scad: string, projectId: string, transaction: DB): Promise<string> {
    const objectId = uuidv4();
    
    await Objects.createObject({
      id: objectId,
      object: scad,
      project_id: projectId
    }, transaction);
    
    return objectId;
  }

  /**
   * Get historical messages for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Extended chat messages
   */
  async getMessages(projectId: string, transaction: DB = db): Promise<ExtendedChatMessage[]> {
    // Get active conversation for project
    const conversation = await Conversations.findActiveByProject(projectId, transaction);
    
    if (!conversation) {
      return [];
    }
    
    // Get messages for conversation
    const query = `
      SELECT role, content, tool_calls, tool_call_id, tool_output
      FROM messages
      WHERE conversation_id = ? AND role != 'system'
      ORDER BY created_at ASC
    `;
    
    const messages = await transaction.all(query, [conversation.id]);
    
    return this.processMessages(messages);
  }

  /**
   * Process messages from database to ExtendedChatMessage format
   * @param messages - Raw messages from database
   * @returns Extended chat messages
   */
  private processMessages(messages: any[]): ExtendedChatMessage[] {
    const filtered: ExtendedChatMessage[] = [];

    messages.forEach((msg) => {
      if (msg.role === 'tool') {
        filtered.push({
          role: "tool",
          content: JSON.parse(msg.content),
          tool_call_id: msg.tool_call_id
        });
      } else if (msg.role === 'assistant') {
        const pushMsg = {
          role: "assistant",
          content: msg.content ? JSON.parse(msg.content) : [],
          tool_calls: msg.tool_calls ? JSON.parse(msg.tool_calls) : []
        };
        filtered.push(pushMsg as ExtendedChatMessage);
      } else if (msg.role === 'user') {
        filtered.push({
          role: "user",
          content: JSON.parse(msg.content)
        });
      }
    });

    return filtered;
  }

  /**
   * Find messages by conversation ID
   * @param conversationId - Conversation ID
   * @param transaction - Optional transaction object
   * @returns Messages in the conversation
   */
  async findByConversation(conversationId: string, transaction: DB = db): Promise<MessageData[]> {
    return this.findAll<MessageData>({
      where: { conversation_id: conversationId },
      orderBy: 'created_at ASC'
    }, transaction);
  }

  /**
   * Find messages with their associated objects
   * @param conversationId - Conversation ID
   * @param transaction - Optional transaction object
   * @returns Messages with object data
   */
  async findWithObjects(conversationId: string, transaction: DB = db): Promise<MessageWithObject[]> {
    const query = `
      SELECT m.*, o.object
      FROM ${this.tableName} m
      LEFT JOIN objects o ON m.object_id = o.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `;
    
    let rows: MessageWithObject[] = await transaction.all<MessageWithObject>(query, [conversationId]);
    
    // Parse JSON content
    return rows.map(row => {
      try {
        if (row.content && typeof row.content === 'string') {
          row.content = JSON.parse(row.content);
        }
        if (row.tool_calls && typeof row.tool_calls === 'string') {
          row.tool_calls = JSON.parse(row.tool_calls);
        }
        if (row.tool_output && typeof row.tool_output === 'string') {
          row.tool_output = JSON.parse(row.tool_output);
        }
      } catch (e) {
        // If parsing fails, keep as string
        console.error('Error parsing JSON in message:', e);
      }
      return row;
    });
  }

  /**
   * Find the last message in a conversation
   * @param conversationId - Conversation ID
   * @param transaction - Optional transaction object
   * @returns Last message or undefined
   */
  async findLastMessage(conversationId: string, transaction: DB = db): Promise<MessageData | undefined> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    let row: MessageData | undefined = await transaction.get<MessageData>(query, [conversationId]);
    
    if (row) {
      try {
        if (row.content && typeof row.content === 'string') {
          row.content = JSON.parse(row.content);
        }
        if (row.tool_calls && typeof row.tool_calls === 'string') {
          row.tool_calls = JSON.parse(row.tool_calls);
        }
        if (row.tool_output && typeof row.tool_output === 'string') {
          row.tool_output = JSON.parse(row.tool_output);
        }
      } catch (e) {
        // If parsing fails, keep as string
        console.error('Error parsing JSON in message:', e);
      }
    }
    
    return row;
  }

  /**
   * Update a message
   * @param id - Message ID
   * @param data - Message data to update
   * @param transaction - Optional transaction object
   * @returns Updated message
   */
  async updateMessage(id: string, data: Partial<MessageData>, transaction: DB = db): Promise<MessageData> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // Stringify content if it's an object
    if (updateData.content && typeof updateData.content === 'object') {
      updateData.content = JSON.stringify(updateData.content);
    }
    
    // Stringify tool_calls if it's an object
    if (updateData.tool_calls && typeof updateData.tool_calls === 'object') {
      updateData.tool_calls = JSON.stringify(updateData.tool_calls);
    }
    
    // Stringify tool_output if it's an object
    if (updateData.tool_output && typeof updateData.tool_output === 'object') {
      updateData.tool_output = JSON.stringify(updateData.tool_output);
    }

    return this.update<MessageData>(id, updateData, transaction);
  }

  /**
   * Normalize message content to a consistent format
   * @param content - Message content (string or content blocks)
   * @returns Normalized content blocks
   */
  normalizeMessage(content: string | any[]): any[] {
    if (typeof content === 'string') {
      return [{ type: 'text', text: content }];
    } else if (Array.isArray(content)) {
      return content.map(block => {
        if (typeof block === 'string') {
          return { type: 'text', text: block };
        } else if (block.type === 'text') {
          return { type: 'text', text: block.text };
        }
        return block;
      });
    }
    return [];
  }
}

export default new Messages(); 