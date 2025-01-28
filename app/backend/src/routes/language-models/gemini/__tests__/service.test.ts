import { describe, it, expect } from '@jest/globals';
import { generateObjects } from '../service';
import { createMockGemini, mockReasoning, mockScene } from './common';
import { TestDb } from '../../../../database/testDb';
import { setupTestApp, cleanupTestDb } from '../../../__tests__/common';
import { v4 as uuidv4 } from 'uuid';

describe('Gemini Service', () => {
  let db: TestDb;
  let projectId: string;
  let userId: string;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    
    // Create test user and project
    userId = uuidv4();
    projectId = uuidv4();
    const organizationId = uuidv4();
    const now = new Date().toISOString();

    await db
      .insertInto('users')
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    await db
      .insertInto('organizations')
      .values({
        id: organizationId,
        name: 'Test Org',
        created_at: now,
        updated_at: now,
        is_default: 1
      })
      .execute();

    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: organizationId,
        user_id: userId,
        role: 'owner',
        created_at: now
      })
      .execute();

    await db
      .insertInto('projects')
      .values({
        id: projectId,
        name: 'Test Project',
        organization_id: organizationId,
        created_by: userId,
        last_modified_by: userId,
        created_at: now,
        updated_at: now,
        icon: 'default'
      })
      .execute();
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should generate objects and store conversation', async () => {
    let callCount = 0;
    const mockGemini = {
      getGenerativeModel: () => ({
        generateContent: async () => {
          callCount++;
          return {
            response: {
              text: () => callCount === 1 ? mockReasoning : JSON.stringify(mockScene)
            }
          };
        }
      })
    } as any;

    const result = await generateObjects(
      'create a cube',
      { x: 0, y: 0, z: 0 },
      null,
      projectId,
      userId,
      db,
      mockGemini
    );

    // Check result
    expect(result.json).toEqual(mockScene);
    expect(result.reasoning).toBe(mockReasoning);
    expect(result.messageId).toBeDefined();

    // Check conversation was created
    const conversation = await db
      .selectFrom('conversations')
      .selectAll()
      .where('project_id', '=', projectId)
      .executeTakeFirst();

    expect(conversation).toBeTruthy();
    expect(conversation?.status).toBe('active');
    expect(conversation?.model).toBe('gemini-2.0-flash-exp');

    // Check messages were created
    const messages = await db
      .selectFrom('messages')
      .selectAll()
      .where('conversation_id', '=', conversation!.id)
      .execute();

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('create a cube');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe(mockReasoning);
    expect(messages[1].tool_calls).toBe(JSON.stringify(mockScene));
  });

  it('should validate manual JSON', async () => {
    const mockGemini = createMockGemini();
    const invalidScene = { objects: [{ type: 'invalid' }] };

    await expect(generateObjects(
      'create a cube',
      { x: 0, y: 0, z: 0 },
      invalidScene as any,
      projectId,
      userId,
      db,
      mockGemini
    )).rejects.toThrow('Invalid manual JSON');
  });

  it('should reuse existing conversation', async () => {
    const mockGemini = createMockGemini(JSON.stringify(mockScene));
    const now = new Date().toISOString();
    const conversationId = uuidv4();

    // Create existing conversation
    await db
      .insertInto('conversations')
      .values({
        id: conversationId,
        project_id: projectId,
        model: 'gemini-2.0-flash-exp',
        status: 'active',
        updated_at: now
      })
      .execute();

    const result = await generateObjects(
      'create a cube',
      { x: 0, y: 0, z: 0 },
      null,
      projectId,
      userId,
      db,
      mockGemini
    );

    // Check messages were added to existing conversation
    const messages = await db
      .selectFrom('messages')
      .selectAll()
      .where('conversation_id', '=', conversationId)
      .execute();

    expect(messages).toHaveLength(2);
  });
}); 