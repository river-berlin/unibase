import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TestDb, createTestDb } from '../../database/testDb';
import { createApp } from '../../app';
import { Express } from 'express';

/**
 * Creates a mock Express request object with common properties
 */
export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    params: {},
    query: {},
    body: {},
    ...overrides
  };
}

/**
 * Creates a mock Express response object with jest mock functions
 */
export function createMockResponse(): {
  mockRes: Partial<Response>;
  mockJson: jest.Mock;
  mockStatus: jest.Mock;
  mockSend: jest.Mock;
} {
  const mockJson = jest.fn();
  const mockStatus = jest.fn();
  const mockSend = jest.fn();

  const mockRes: Partial<Response> = {
    json: mockJson,
    status: mockStatus.mockReturnThis(),
    send: mockSend
  };

  return { mockRes, mockJson, mockStatus, mockSend };
}

/**
 * Creates a test database and app instance for testing
 */
export async function setupTestApp() {
  const db = await createTestDb();
  const app = createApp(db);
  
  return {
    db,
    app
  };
}

/**
 * Cleans up test database
 */
export async function cleanupTestDb(db: TestDb) {
  await db.destroy();
}

/**
 * Creates a test user and returns common test entities
 */
export async function createTestUser(db: TestDb) {
  const userId = uuidv4();

  await db
    .insertInto('users')
    .values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'hash',
      salt: 'salt',
      is_admin: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .execute();

  return {
    userId
  };
} 