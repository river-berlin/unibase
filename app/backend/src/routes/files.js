import express from 'express';
import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma, s3 } from '../app.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const BUCKET_NAME = 'voicecad-files';

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { userId, projectId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const key = `${userId}/${Date.now()}-${req.file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
      })
    );

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        key,
        size: req.file.size,
        type: req.file.mimetype,
        userId,
        projectId,
      },
    });

    res.status(201).json(file);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Delete file
router.delete('/:id', async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.key,
      })
    );

    // Delete from database
    await prisma.file.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'File not found' });
    }
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

export default router; 