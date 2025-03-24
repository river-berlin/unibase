import { db, QueryParams, DB } from '../db';

/**
 * Options for findAll method
 */
export interface FindAllOptions {
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

/**
 * Base model class that provides common database operations
 */
export abstract class BaseModel {
  protected tableName: string;

  /**
   * @param tableName - The name of the database table
   */
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find a record by ID
   * @param id - The ID of the record to find
   * @param transaction - Optional transaction object
   * @returns The found record or undefined
   */
  async findById<T = any>(id: string, transaction: DB = db): Promise<T | undefined> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    return transaction.get<T>(query, [id]);
  }

  /**
   * Find all records
   * @param options - Query options
   * @param transaction - Optional transaction object
   * @returns Array of records
   */
  async findAll<T = any>(options: FindAllOptions = {}, transaction: DB = db): Promise<T[]> {
    // 1. Validate table name
    if (!/^[a-zA-Z0-9_]+$/.test(this.tableName)) {
      throw new Error(`Invalid table name: ${this.tableName}`);
    }

    let query = `SELECT * FROM "${this.tableName}"`;
    const params: any[] = [];

    // 2. Validate WHERE clause keys
    if (options.where && Object.keys(options.where).length > 0) {
      const whereClauses = [];
      for (const [key, value] of Object.entries(options.where)) {
        // Validate column name
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          throw new Error(`Invalid column name in where clause: ${key}`);
        }
        whereClauses.push(`"${key}" = ?`);
        params.push(value);
      }
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // 3. Validate and sanitize ORDER BY
    if (options.orderBy) {
      // Split by comma to handle multiple order by fields
      const orderByParts = options.orderBy.split(',').map(part => part.trim());
      const sanitizedParts = [];
      
      for (const part of orderByParts) {
        // Split by space to separate field and direction
        const [field, direction] = part.split(/\s+/);
        
        // Validate field name
        if (!/^[a-zA-Z0-9_]+$/.test(field)) {
          throw new Error(`Invalid field name in orderBy: ${field}`);
        }
        
        // Validate direction if present
        if (direction && !['ASC', 'DESC'].includes(direction.toUpperCase())) {
          throw new Error(`Invalid sort direction: ${direction}`);
        }
        
        // Add sanitized part
        sanitizedParts.push(`"${field}"${direction ? ' ' + direction.toUpperCase() : ''}`);
      }
      
      query += ` ORDER BY ${sanitizedParts.join(', ')}`;
    }

    // 4. LIMIT and OFFSET are safe because they use parameters
    if (options.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }

    if (options.offset) {
      query += ` OFFSET ?`;
      params.push(options.offset);
    }

    return transaction.all<T>(query, params);
  }

  /**
   * Create a new record
   * @param data - The data to insert
   * @param transaction - Optional transaction object
   * @returns The created record
   */
  async create<T = any>(data: Record<string, any>, transaction: DB = db): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    
    await transaction.run(query, values);
    
    // Return the created record
    const record = await transaction.get<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [data.id]);
    if (!record) {
      throw new Error(`Failed to retrieve created record with id ${data.id}`);
    }
    return record;
  }

  /**
   * Update a record
   * @param id - The ID of the record to update
   * @param data - The data to update
   * @param transaction - Optional transaction object
   * @returns The updated record
   */
  async update<T = any>(id: string, data: Record<string, any>, transaction: DB = db): Promise<T> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    
    await transaction.run(query, values);
    
    // Return the updated record
    const record = await transaction.get<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    if (!record) {
      throw new Error(`Failed to retrieve updated record with id ${id}`);
    }
    return record;
  }

  /**
   * Delete a record
   * @param id - The ID of the record to delete
   * @param transaction - Optional transaction object
   * @returns True if deleted, false if not found
   */
  async delete(id: string, transaction: DB = db): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    
    const result = await transaction.run(query, [id]);
    return result.changes > 0;
  }

  /**
   * Execute a raw query
   * @param sql - SQL query
   * @param params - Query parameters
   * @param transaction - Optional transaction object
   * @returns Query result
   */
  async query<T = any>(sql: string, params: QueryParams = [], transaction: DB = db): Promise<T[]> {
    return transaction.all<T>(sql, params);
  }

  /**
   * Execute a raw query that returns a single row
   * @param sql - SQL query
   * @param params - Query parameters
   * @param transaction - Optional transaction object
   * @returns Query result
   */
  async queryOne<T = any>(sql: string, params: QueryParams = [], transaction: DB = db): Promise<T | undefined> {
    return transaction.get<T>(sql, params);
  }
} 