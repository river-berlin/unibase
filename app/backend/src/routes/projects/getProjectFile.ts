import { Router, Request, Response } from 'express';
import { GetObjectCommand, PutObjectCommand, NoSuchKey } from '@aws-sdk/client-s3';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';
import { s3 } from '../../services/s3.js';

interface User {
  id: string;
  email: string;
}

interface Project {
  organization_id: string;
  created_by: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
  params: {
    projectId: string;
  };
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'voicecad';

const router = Router();

/**
 * Get project file from S3
 * If file doesn't exist, creates an empty one
 * 
 * @route GET /projects/:projectId/file
 */
router.get('/:projectId/file', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // First get the project to check permissions
    const project = await db
      .selectFrom('projects')
      .select(['organization_id', 'created_by'])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst() as Project | undefined;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify user has access to this project's organization
    const hasAccess = await db
      .selectFrom('organization_members')
      .select('user_id')
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.id)
      .executeTakeFirst();

    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this project' });
    }

    const fileName = `${req.params.projectId}.voiceCAD`;

    try {
      // Try to get existing file
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName
      });
      
      const response = await s3.send(getCommand);
      const fileContent = await response.Body?.transformToString();
      
      res.json(JSON.parse(fileContent || '{"objects": []}'));
    } catch (error) {
      if (error instanceof NoSuchKey) {
        // File doesn't exist, create empty one
        const emptyFile = { objects: [] };
        
        const putCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: JSON.stringify(emptyFile),
          ContentType: 'application/json'
        });
        
        await s3.send(putCommand);
        res.json(emptyFile);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching project file:', error);
    res.status(500).json({ error: 'Error fetching project file' });
  }
});

export default router; 