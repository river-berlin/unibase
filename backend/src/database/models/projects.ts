import { BaseModel } from './base-model';
import { v4 as uuidv4 } from 'uuid';
import { db, DB } from '../db';
import OrganizationMembers from './organization-members';

/**
 * Project data interface
 */
export interface ProjectData {
  id?: string;
  name: string;
  description?: string | null;
  organization_id: string;
  folder_id?: string | null;
  icon: string;
  created_by: string;
  last_modified_by?: string;
  created_at?: string;
  updated_at?: string;
  use_for_training?: boolean | number;
}

/**
 * Extended project data with folder and creator information
 */
export interface ProjectWithDetails extends ProjectData {
  folder_name?: string | null;
  folder_path?: string | null;
  created_by_name?: string;
}

/**
 * Project model class
 */
class Projects extends BaseModel {
  constructor() {
    super('projects');
  }

  /**
   * Create a new project
   * @param data - Project data
   * @param transaction - Optional transaction object
   * @returns Created project
   */
  async createProject(data: ProjectData, transaction: DB = db): Promise<ProjectData> {
    const now = new Date().toISOString();
    const projectData: ProjectData = {
      id: data.id || uuidv4(),
      name: data.name,
      description: data.description || null,
      organization_id: data.organization_id,
      folder_id: data.folder_id || null,
      icon: data.icon,
      created_by: data.created_by,
      last_modified_by: data.created_by,
      created_at: now,
      updated_at: now,
      use_for_training: data.use_for_training !== undefined ? data.use_for_training : 0
    };

    return this.create<ProjectData>(projectData, transaction);
  }

  /**
   * Find projects by organization ID
   * @param organizationId - Organization ID
   * @param transaction - Optional transaction object
   * @returns Projects belonging to the organization
   */
  async findByOrganization(organizationId: string, transaction: DB = db): Promise<ProjectData[]> {
    return this.findAll<ProjectData>({
      where: { organization_id: organizationId },
      orderBy: 'updated_at DESC'
    }, transaction);
  }

  /**
   * Find projects by folder ID
   * @param folderId - Folder ID
   * @param transaction - Optional transaction object
   * @returns Projects in the folder
   */
  async findByFolder(folderId: string, transaction: DB = db): Promise<ProjectData[]> {
    return this.findAll<ProjectData>({
      where: { folder_id: folderId },
      orderBy: 'name ASC'
    }, transaction);
  }

  /**
   * Find a project by ID with folder and creator details
   * @param projectId - Project ID
   * @param transaction - Optional transaction object
   * @returns Project with details or undefined
   */
  async findByIdWithDetails(projectId: string, transaction: DB = db): Promise<ProjectWithDetails | undefined> {
    const query = `
      SELECT p.*, f.name as folder_name, f.path as folder_path, u.name as created_by_name
      FROM projects p
      LEFT JOIN folders f ON p.folder_id = f.id
      INNER JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `;
    
    return transaction.get<ProjectWithDetails>(query, [projectId]);
  }

  /**
   * Check if a user has access to a project
   * @param projectId - Project ID
   * @param userId - User ID
   * @param transaction - Optional transaction object
   * @returns True if user has access
   */
  async userHasAccess(projectId: string, userId: string, transaction: DB = db): Promise<boolean> {
    // First get the project to find its organization
    const project = await this.findById<ProjectData>(projectId, transaction);
    if (!project) {
      return false;
    }
    
    // Check if user is a member of the organization
    return OrganizationMembers.isMember(project.organization_id, userId, transaction);
  }

  /**
   * Update a project
   * @param id - Project ID
   * @param data - Project data to update
   * @param userId - User ID making the update
   * @param transaction - Optional transaction object
   * @returns Updated project
   */
  async updateProject(id: string, data: Partial<ProjectData>, userId: string, transaction: DB = db): Promise<ProjectData> {
    const updateData = {
      ...data,
      last_modified_by: userId,
      updated_at: new Date().toISOString()
    };

    return this.update<ProjectData>(id, updateData, transaction);
  }

  /**
   * Move a project to a different folder
   * @param id - Project ID
   * @param folderId - New folder ID
   * @param userId - User ID making the update
   * @param transaction - Optional transaction object
   * @returns Updated project
   */
  async moveToFolder(id: string, folderId: string | null, userId: string, transaction: DB = db): Promise<ProjectData> {
    return this.updateProject(id, { folder_id: folderId }, userId, transaction);
  }

  /**
   * Mark or unmark a project for training
   * @param id - Project ID
   * @param useForTraining - Whether to use for training (true/false)
   * @param userId - User ID making the update
   * @param transaction - Optional transaction object
   * @returns Updated project
   */
  async setTrainingStatus(id: string, useForTraining: boolean, userId: string, transaction: DB = db): Promise<ProjectData> {
    return this.updateProject(id, { use_for_training: useForTraining ? 1 : 0 }, userId, transaction);
  }
}

export default new Projects(); 