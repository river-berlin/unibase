import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';

const router = Router();

// Create project
router.post('/', authenticateToken, async (req, res) => {
  const { name, description, organizationId, folderId } = req.body;

  if (!name || !organizationId) {
    return res.status(400).json({ error: 'Name and organizationId are required' });
  }

  try {
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
        description,
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

// Get user's projects
router.get('/org/:organizationId', authenticateToken, async (req, res) => {
  try {
    const projects = await db
      .selectFrom('projects')
      .select([
        'projects.id',
        'projects.name',
        'projects.description',
        'projects.icon',
        'projects.folder_id',
        'projects.created_at',
        'projects.updated_at',
        'folders.name as folder_name',
        'folders.path as folder_path'
      ])
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
      .where('projects.organization_id', '=', req.params.organizationId)
      .orderBy(['folders.path', 'projects.name'])
      .execute();

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

// Get single project
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await db
      .selectFrom('projects')
      .select([
        'projects.id',
        'projects.name',
        'projects.description',
        'projects.organization_id',
        'projects.folder_id',
        'projects.icon',
        'projects.created_at',
        'projects.updated_at',
        'folders.name as folder_name',
        'folders.path as folder_path',
        'users.name as created_by_name'
      ])
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
      .innerJoin('users', 'users.id', 'projects.created_by')
      .where('projects.id', '=', req.params.projectId)
      .executeTakeFirst();

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

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
});

// Update project
router.patch('/:projectId', authenticateToken, async (req, res) => {
  const { name, description, folderId } = req.body;

  try {
    // First get the project to check permissions
    const project = await db
      .selectFrom('projects')
      .select(['organization_id', 'created_by'])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

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

    // Update project
    await db
      .updateTable('projects')
      .set({
        name: name || undefined,
        description: description || undefined,
        folder_id: folderId || null,
        last_modified_by: req.user.id,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', req.params.projectId)
      .execute();

    const updatedProject = await db
      .selectFrom('projects')
      .select([
        'id',
        'name',
        'description',
        'folder_id',
        'icon',
        'updated_at'
      ])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
});

// Delete project
router.delete('/:projectId', authenticateToken, async (req, res) => {
  try {
    // First get the project to check permissions
    const project = await db
      .selectFrom('projects')
      .select(['organization_id', 'created_by'])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify user has access to this project's organization
    const hasAccess = await db
      .selectFrom('organization_members')
      .select(['user_id', 'role'])
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.id)
      .executeTakeFirst();

    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this project' });
    }

    // Only allow deletion if user is owner/admin or created the project
    if (hasAccess.role !== 'owner' && hasAccess.role !== 'admin' && project.created_by !== req.user.id) {
      return res.status(403).json({ error: 'No permission to delete this project' });
    }

    await db
      .deleteFrom('projects')
      .where('id', '=', req.params.projectId)
      .execute();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
});

export default router; 