import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface Folder {
  id: string;
  name: string;
  path: string;
  parent_folder_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  body: {
    name: string;
    organizationId: string;
    parentFolderId?: string;
  };
}

const router = Router();

/**
 * Create a new folder
 * 
 * @route POST /folders
 */
router.post(
  '/',
  [
    authenticateToken,
    body('name').trim().notEmpty(),
    body('organizationId').notEmpty()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { name, organizationId, parentFolderId } = req.body;

      // Verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', organizationId)
        .where('user_id', '=', req.user.id)
        .executeTakeFirst();

      if (!hasAccess) {
        return res.status(403).json({ error: 'No access to this organization' });
      }

      // If parent folder specified, verify it exists and is in the same organization
      if (parentFolderId) {
        const parentFolder = await db
          .selectFrom('folders')
          .select(['id', 'path'])
          .where('id', '=', parentFolderId)
          .where('organization_id', '=', organizationId)
          .executeTakeFirst();

        if (!parentFolder) {
          return res.status(404).json({ error: 'Parent folder not found' });
        }
      }

      const now = new Date().toISOString();
      const folderId = uuidv4();

      // Create folder
      await db
        .insertInto('folders')
        .values({
          id: folderId,
          name,
          organization_id: organizationId,
          parent_folder_id: parentFolderId || null,
          path: parentFolderId ? `${parentFolderId}/${name}` : name,
          created_at: now,
          updated_at: now
        })
        .execute();

      const folder = await db
        .selectFrom('folders')
        .select([
          'id',
          'name',
          'path',
          'parent_folder_id',
          'created_at',
          'updated_at'
        ])
        .where('id', '=', folderId)
        .executeTakeFirst();

      res.status(201).json(folder);
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Error creating folder' });
    }
  }
);

export default router; 