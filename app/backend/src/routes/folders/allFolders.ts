import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
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
  params: {
    organizationId: string;
  };
}

const router = Router();

/**
 * Get all folders accessible to the user in an organization
 * 
 * @route GET /folders/org/:organizationId
 */
router.get(
  '/org/:organizationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const folders = await db
        .selectFrom('folders')
        .select([
          'folders.id',
          'folders.name',
          'folders.path',
          'folders.parent_folder_id',
          'folders.created_at',
          'folders.updated_at'
        ])
        .innerJoin(
          'organization_members',
          'organization_members.organization_id',
          'folders.organization_id'
        )
        .where('organization_members.user_id', '=', req.user.id)
        .where('folders.organization_id', '=', req.params.organizationId)
        .orderBy('folders.path')
        .execute();

      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Error fetching folders' });
    }
  }
);

export default router; 