import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';
import Conversations from './conversations';
import Objects from './objects';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages/messages';
import { TextPart, ImagePart } from 'ai';
/**
 * Message data interface
 */
export interface MessageData {
  id?: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: any; // Can be string (serialized) or direct object
  tool_calls?: any; // Can be string (serialized) or direct object
  tool_call_id?: string;
  tool_output?: any; // Can be string (serialized) or direct object
  input_tokens_used?: number;
  output_tokens_used?: number;
  error?: string | null;
  already_trained?: boolean; // Whether this message has been used as training data
  trained_at?: string; // Timestamp when the message was used for training
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
   * Add multiple messages to a conversation
   * @param data - Array of message data
   * @param transaction - Optional transaction object
   * @returns Created messages
   */
  async addMessages(data: MessageData[], transaction: DB = db): Promise<MessageData[]> {
    for (const message of data) {
      await this.addMessage(message, transaction);
    }
    return data;
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
   * Get historical messages for a project
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Extended chat messages
   */
  async getMessages(projectId: string, transaction: DB = db): Promise<MessageData[]> {
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
   * Process messages from database to MessageData format
   * @param messages - Raw messages from database
   * @returns Message data
   */
  private processMessages(messages: any[]): MessageData[] {
    const filtered: MessageData[] = [];

    messages.forEach((msg) => {
      try {
        // Parse content if it's a string
        let parsedContent = msg.content;
        if (typeof parsedContent === 'string') {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch (e) {
            // If parsing fails, keep as string and wrap in a text block
            parsedContent = [{ type: 'text', text: parsedContent }];
          }
        }

        // Parse tool_calls if it's a string
        let parsedToolCalls = msg.tool_calls || [];
        if (typeof parsedToolCalls === 'string') {
          try {
            parsedToolCalls = JSON.parse(parsedToolCalls);
          } catch (e) {
            console.error('Error parsing tool_calls:', e);
            parsedToolCalls = [];
          }
        }

        if (msg.role === 'assistant') {
          const pushMsg = {
            role: "assistant",
            content: parsedContent,
            tool_calls: parsedToolCalls
          };
          filtered.push(pushMsg as MessageData);
        } else if (msg.role === 'user') {
          filtered.push({
            role: "user",
            content: parsedContent,
            conversation_id: msg.conversation_id,
            created_by: msg.created_by
          });
        }
      } catch (e) {
        console.error('Error processing message:', e, msg);
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
    const messages = await this.findAll<MessageData>({
      where: { conversation_id: conversationId },
      orderBy: 'created_at ASC'
    }, transaction);
    
    // Deserialize JSON fields
    return messages.map(msg => this.deserializeMessageFields(msg));
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
      return this.deserializeMessageFields(row);
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
    // Prepare update data with timestamp
    const baseUpdateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // Serialize all JSON fields before saving
    const updateData = this.serializeMessageFields(baseUpdateData);

    return this.update<MessageData>(id, updateData, transaction);
  }

  /**
   * Normalize message content to a consistent format
   * @param content - Message content (string or content blocks)
   * @returns Normalized content blocks
   */
  normalizeMessageContent(content: string | any[]): (TextPart | ImagePart)[] {
    if (typeof content === 'string') {
      return [{ type: 'text', text: content } as TextPart];
    } else if (Array.isArray(content)) {
      return content.map(block => {
        if (typeof block === 'string') {
          return { type: 'text', text: block } as TextPart;
        } else if (block.type === 'text') {
          return { type: 'text', text: block.text } as TextPart;
        } else if (block.type === 'image' && block.image) {
          return { type: 'image', image: block.image } as ImagePart;
        }
        return block as TextPart | ImagePart;
      });
    }
    return [];
  }

  /**
   * Helper method to deserialize JSON fields in a message
   * @param message - The message to deserialize
   * @returns The deserialized message
   */
  private deserializeMessageFields(message: MessageData): MessageData {
    try {
      // Create a copy of the message to avoid modifying the original
      const result = { ...message };
      
      // Parse content if it's a string
      if (result.content && typeof result.content === 'string') {
        try {
          result.content = JSON.parse(result.content);
        } catch (e) {
          // If parsing fails, keep as string
          console.error('Error parsing content JSON:', e);
        }
      }
      
      // Parse tool_calls if it's a string
      if (result.tool_calls && typeof result.tool_calls === 'string') {
        try {
          result.tool_calls = JSON.parse(result.tool_calls);
        } catch (e) {
          // If parsing fails, keep as string
          console.error('Error parsing tool_calls JSON:', e);
        }
      }
      
      // Parse tool_output if it's a string
      if (result.tool_output && typeof result.tool_output === 'string') {
        try {
          result.tool_output = JSON.parse(result.tool_output);
        } catch (e) {
          // If parsing fails, keep as string
          console.error('Error parsing tool_output JSON:', e);
        }
      }
      
      return result;
    } catch (e) {
      console.error('Error deserializing message fields:', e);
      return message; // Return original if any error occurs
    }
  }
  
  /**
   * Helper method to serialize JSON fields in a message
   * @param message - The message to serialize
   * @returns The serialized message
   */
  private serializeMessageFields(message: Partial<MessageData>): Partial<MessageData> {
    try {
      // Create a copy of the message to avoid modifying the original
      const result = { ...message };
      
      // Stringify content if it's an object
      if (result.content && typeof result.content === 'object') {
        result.content = JSON.stringify(result.content);
      }
      
      // Stringify tool_calls if it's an object
      if (result.tool_calls && typeof result.tool_calls === 'object') {
        result.tool_calls = JSON.stringify(result.tool_calls);
      }
      
      // Stringify tool_output if it's an object
      if (result.tool_output && typeof result.tool_output === 'object') {
        result.tool_output = JSON.stringify(result.tool_output);
      }
      
      return result;
    } catch (e) {
      console.error('Error serializing message fields:', e);
      return message; // Return original if any error occurs
    }
  }
}



export default new Messages();