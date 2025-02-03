import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createTestDb, TestDb, cleanupTestDb} from '../../database/testDb';
import { Express } from 'express';
import { createApp } from '../../app';
import { AppServices } from '../../types';
import { Kysely } from 'kysely';
import { Database } from '../../database/types';
import jwt from 'jsonwebtoken';

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
export async function setupTestApp(services: Partial<AppServices> = {}): Promise<{ app: Express; db: TestDb }> {
  const db = await createTestDb();
  const app = createApp({ db, ...services });
  return { app, db };
}

export {cleanupTestDb}

/**
 * Creates a test user and returns common test entities
 */
export async function createTestUser(db: Kysely<Database>) {
  const userId = 'test-user-' + Date.now();
  
  await db
    .insertInto('users')
    .values({
      id: userId,
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      password_hash: 'hash',
      salt: 'salt',
      is_admin: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .execute();

  return { userId };
}

// Delete a test user
export async function deleteTestUser(db: TestDb, userId: string) {
  await db
    .deleteFrom('users')
    .where('id', '=', userId)
    .execute();
}