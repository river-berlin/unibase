const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const AWS = require('aws-sdk');
const app = require('../../src/app');
const prisma = new PrismaClient();

// Configure AWS to use LocalStack
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  s3ForcePathStyle: true,
  region: 'us-east-1',
});

const BUCKET_NAME = 'voicecad-files';

describe('File Management API', () => {
  let testUser;
  let testProject;

  beforeAll(async () => {
    // Create S3 bucket
    try {
      await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
    } catch (error) {
      console.log('Bucket might already exist:', error.message);
    }
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.file.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        email: 'file-test@example.com',
        password: 'hashedPassword123',
        name: 'File Test User',
      },
    });

    // Create a test project
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'A test project for file uploads',
        userId: testUser.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up S3 files after each test
    const { Contents } = await s3.listObjects({ Bucket: BUCKET_NAME }).promise();
    if (Contents && Contents.length > 0) {
      await s3
        .deleteObjects({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: Contents.map(({ Key }) => ({ Key })),
          },
        })
        .promise();
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // Optionally delete the test bucket
    try {
      await s3.deleteBucket({ Bucket: BUCKET_NAME }).promise();
    } catch (error) {
      console.log('Error deleting bucket:', error.message);
    }
  });

  describe('POST /api/files/upload', () => {
    it('should upload a file to S3 and create database record', async () => {
      const testBuffer = Buffer.from('test file content');
      const fileName = 'test.txt';

      const response = await request(app)
        .post('/api/files/upload')
        .field('userId', testUser.id)
        .field('projectId', testProject.id)
        .attach('file', testBuffer, fileName)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(fileName);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.projectId).toBe(testProject.id);

      // Verify file exists in S3
      const s3Object = await s3
        .getObject({
          Bucket: BUCKET_NAME,
          Key: response.body.key,
        })
        .promise();

      expect(s3Object.Body.toString()).toBe('test file content');

      // Verify database record
      const file = await prisma.file.findUnique({
        where: { id: response.body.id },
      });
      expect(file).toBeTruthy();
      expect(file.name).toBe(fileName);
    });
  });

  describe('DELETE /api/files/:id', () => {
    it('should delete file from S3 and database', async () => {
      // First upload a file
      const testBuffer = Buffer.from('test file content');
      const fileName = 'test.txt';

      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .field('userId', testUser.id)
        .field('projectId', testProject.id)
        .attach('file', testBuffer, fileName);

      // Then delete it
      await request(app)
        .delete(`/api/files/${uploadResponse.body.id}`)
        .expect(204);

      // Verify file is deleted from S3
      try {
        await s3
          .getObject({
            Bucket: BUCKET_NAME,
            Key: uploadResponse.body.key,
          })
          .promise();
        fail('File should not exist in S3');
      } catch (error) {
        expect(error.code).toBe('NoSuchKey');
      }

      // Verify database record is deleted
      const file = await prisma.file.findUnique({
        where: { id: uploadResponse.body.id },
      });
      expect(file).toBeNull();
    });

    it('should return 404 for non-existent file', async () => {
      await request(app)
        .delete('/api/files/non-existent-id')
        .expect(404);
    });
  });
}); 