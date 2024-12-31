import request from 'supertest';
import { app, prisma } from '../../src/app.js';

describe('Project Management API', () => {
  let testUser;

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        email: 'project-test@example.com',
        password: 'hashedPassword123',
        name: 'Project Test User',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
      expect(response.body.userId).toBe(testUser.id);

      // Verify project was created in database
      const project = await prisma.project.findUnique({
        where: { id: response.body.id },
      });
      expect(project).toBeTruthy();
      expect(project.name).toBe(projectData.name);
    });

    it('should not create project without required fields', async () => {
      const projectData = {
        description: 'Missing name field',
      };

      await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(400);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete an existing project', async () => {
      // Create a project first
      const project = await prisma.project.create({
        data: {
          name: 'Project to Delete',
          description: 'This project will be deleted',
          userId: testUser.id,
        },
      });

      // Delete the project
      await request(app)
        .delete(`/api/projects/${project.id}`)
        .expect(204);

      // Verify project was deleted
      const deletedProject = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(deletedProject).toBeNull();
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .delete('/api/projects/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/projects', () => {
    it('should list all projects for a user', async () => {
      // Create multiple projects
      await prisma.project.createMany({
        data: [
          {
            name: 'Project 1',
            description: 'First project',
            userId: testUser.id,
          },
          {
            name: 'Project 2',
            description: 'Second project',
            userId: testUser.id,
          },
        ],
      });

      const response = await request(app)
        .get('/api/projects')
        .query({ userId: testUser.id })
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });
  });
}); 