import { describe, it, expect } from '@jest/globals';
import { generateObjects } from '../service';
import { createMockOpenAI, mockReasoning, mockConfirmation } from './common';
import { TestDb } from '../../../../database/testDb';
import { setupTestApp, cleanupTestDb } from '../../../__tests__/common';
import { v4 as uuidv4 } from 'uuid';

describe('OpenAI Service - cuboid', () => {
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
    const mockOpenAI = createMockOpenAI();

    const result = await generateObjects(
      'create a cuboid',
      { x: 0, y: 0, z: 0 },
      undefined,
      projectId,
      userId,
      db,
      mockOpenAI
    );

    // Check result
    expect(result.reasoning).toBe(mockReasoning + mockConfirmation);
    expect(result.messageId).toBeDefined();
    expect(result?.toolCalls?.length).toBe(1);
    expect(result?.toolCalls?.[0]).toMatchObject({
      name: 'add_cuboid',
      args: JSON.stringify({
        width: 10,
        height: 10,
        depth: 10,
        objectId: 'test-cube-123'
      })
    });

    // Check conversation was created
    const conversation = await db
      .selectFrom('conversations')
      .selectAll()
      .where('project_id', '=', projectId)
      .executeTakeFirst();

    expect(conversation).toBeTruthy();
    expect(conversation?.status).toBe('active');
    expect(conversation?.model).toBe(process.env.OPENAI_BASE_URL + '--' + process.env.OPENAI_MODEL);

    // Check messages were created
    const messages = await db
      .selectFrom('messages')
      .selectAll()
      .where('conversation_id', '=', conversation!.id)
      .execute();

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('create a cuboid');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe(mockReasoning + mockConfirmation);
    expect(JSON.parse(messages[1].tool_calls as string)).toMatchObject([{
      name: 'add_cuboid',
      args: JSON.stringify({
        width: 10,
        height: 10,
        depth: 10,
        objectId: 'test-cube-123'
      })
    }]);
  });

  it('should reuse existing conversation', async () => {
    const mockOpenAI = createMockOpenAI();
    const now = new Date().toISOString();
    const conversationId = uuidv4();

    // Create existing conversation
    await db
      .insertInto('conversations')
      .values({
        id: conversationId,
        project_id: projectId,
        model: process.env.OPENAI_BASE_URL + '--' + process.env.OPENAI_MODEL,
        status: 'active',
        updated_at: now
      })
      .execute();

    await generateObjects(
      'create a cube',
      { x: 0, y: 0, z: 0 },
      undefined,
      projectId,
      userId,
      db,
      mockOpenAI
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