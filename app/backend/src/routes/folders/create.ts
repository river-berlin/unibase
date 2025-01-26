import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

interface CreateFolderRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
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
  async (req: CreateFolderRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user?.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const db = req.app.locals.db;
      const { name, organizationId, parentFolderId } = req.body;

      // Verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', organizationId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
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
          res.status(404).json({ error: 'Parent folder not found' });
          return;
        }

        // Check folder hierarchy depth
        const hierarchyDepth = parentFolder.path.split('/').filter(Boolean).length;
        if (hierarchyDepth >= 4) {
          res.status(400).json({ error: 'Maximum folder nesting depth (4) exceeded' });
          return;
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