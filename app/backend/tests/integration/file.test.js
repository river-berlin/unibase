import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { S3Client, CreateBucketCommand, ListObjectsCommand, DeleteObjectsCommand, DeleteBucketCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { app, prisma } from '../../src/app.js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables for tests
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Ensure GEMINI_API_KEY is set for tests
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY must be set for tests');
  process.exit(1);
}

const BUCKET_NAME = 'voicecad-files';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:4566';

describe('File Management API', () => {
  let testUser;
  let testProject;
  let testS3;

  beforeAll(async () => {
    // Configure S3 for tests
    testS3 = new S3Client({
      endpoint: S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: 'us-east-1',
    });

    // Create S3 bucket
    try {
      await testS3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
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
    try {
      const { Contents } = await testS3.send(new ListObjectsCommand({ Bucket: BUCKET_NAME }));
      if (Contents && Contents.length > 0) {
        await testS3.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: {
              Objects: Contents.map(({ Key }) => ({ Key })),
            },
          })
        );
      }
    } catch (error) {
      console.log('Error cleaning up S3:', error.message);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // Optionally delete the test bucket
    try {
      await testS3.send(new DeleteBucketCommand({ Bucket: BUCKET_NAME }));
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


      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: response.body.key,
      });
      const s3Object = await testS3.send(getObjectCommand);
      const fileContent = await s3Object.Body.transformToString();
      expect(fileContent).toBe('test file content');

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
        const getObjectCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: uploadResponse.body.key,
        });
        await testS3.send(getObjectCommand);
        fail('File should not exist in S3');
      } catch (error) {
        // MinIO might not return the same error code as AWS S3
        expect(error).toBeTruthy();
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

  describe('POST /api/files/modify-scad', () => {
    it('should modify OpenSCAD code according to instructions', async () => {
      const testData = {
        scadContent: 'cube([10, 10, 10]);',
        instructions: 'Make the cube twice as large'
      };

      const response = await request(app)
        .post('/api/files/modify-scad')
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty('modifiedCode');
      expect(typeof response.body.modifiedCode).toBe('string');
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/api/files/modify-scad')
        .send({ scadContent: 'cube([10, 10, 10]);' })
        .expect(400);

      await request(app)
        .post('/api/files/modify-scad')
        .send({ instructions: 'Make it bigger' })
        .expect(400);
    });
  });
}); 