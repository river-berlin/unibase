import { db } from '../database/db.js';

/**
 * Get all folders in an organization that a user has access to
 */
export async function getUserFolders(userId, organizationId) {
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
    .where('organization_members.user_id', '=', userId)
    .where('folders.organization_id', '=', organizationId)
    .orderBy('folders.path')
    .execute();

  return folders;
}

/**
 * Get all files (projects) in a specific folder
 */
export async function getFolderContents(folderId, organizationId, userId) {
  // First verify user has access to this organization
  const hasAccess = await db
    .selectFrom('organization_members')
    .select('user_id')
    .where('organization_id', '=', organizationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  if (!hasAccess) {
    throw new Error('User does not have access to this organization');
  }

  // Get all projects in the folder
  const projects = await db
    .selectFrom('projects')
    .select([
      'projects.id',
      'projects.name',
      'projects.description',
      'projects.icon',
      'projects.created_at',
      'projects.updated_at',
      'users.name as created_by_name'
    ])
    .innerJoin('users', 'users.id', 'projects.created_by')
    .where('projects.folder_id', '=', folderId)
    .where('projects.organization_id', '=', organizationId)
    .orderBy('projects.name')
    .execute();

  // Get all subfolders
  const subfolders = await db
    .selectFrom('folders')
    .select([
      'id',
      'name',
      'path',
      'created_at',
      'updated_at'
    ])
    .where('parent_folder_id', '=', folderId)
    .where('organization_id', '=', organizationId)
    .orderBy('name')
    .execute();

  return {
    projects,
    subfolders
  };
}

/**
 * Get all projects owned by a user in an organization
 */
export async function getUserProjects(userId, organizationId) {
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
    .where('projects.created_by', '=', userId)
    .where('projects.organization_id', '=', organizationId)
    .orderBy(['folders.path', 'projects.name'])
    .execute();

  return projects;
}

/**
 * Get full folder path hierarchy
 */
export async function getFolderHierarchy(folderId, organizationId) {
  const hierarchy = [];
  let currentFolder = await db
    .selectFrom('folders')
    .select(['id', 'name', 'parent_folder_id'])
    .where('id', '=', folderId)
    .where('organization_id', '=', organizationId)
    .executeTakeFirst();

  while (currentFolder) {
    hierarchy.unshift(currentFolder);
    if (!currentFolder.parent_folder_id) break;

    currentFolder = await db
      .selectFrom('folders')
      .select(['id', 'name', 'parent_folder_id'])
      .where('id', '=', currentFolder.parent_folder_id)
      .where('organization_id', '=', organizationId)
      .executeTakeFirst();
  }

  return hierarchy;
} 