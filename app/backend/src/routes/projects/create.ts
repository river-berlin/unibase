import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  folder_id: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  body: {
    name: string;
    description?: string;
    organizationId: string;
    folderId?: string;
  };
}

const router = Router();

/**
 * Create a new project
 * 
 * @route POST /projects
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, organizationId, folderId } = req.body;

  if (!name || !organizationId) {
    return res.status(400).json({ error: 'Name and organizationId are required' });
  }

  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

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

    const now = new Date().toISOString();
    const projectId = uuidv4();

    // Create project
    await db
      .insertInto('projects')
      .values({
        id: projectId,
        name,
        description: description || null,
        organization_id: organizationId,
        folder_id: folderId || null,
        icon: 'default', // You might want to make this configurable
        created_by: req.user.id,
        last_modified_by: req.user.id,
        created_at: now,
        updated_at: now
      })
      .execute();

    const project = await db
      .selectFrom('projects')
      .select([
        'id',
        'name',
        'description',
        'folder_id',
        'icon',
        'created_at',
        'updated_at'
      ])
      .where('id', '=', projectId)
      .executeTakeFirst();

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
});

export default router; 