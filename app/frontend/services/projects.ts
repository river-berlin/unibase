import { useApi } from './api';
import type { UUID } from '../src/backend-js-api';

export const useProjects = () => {
  const { api } = useApi();

  const projects = {
    // Get all projects in an organization
    getProjects: async (organizationId: UUID) => {
      return api.projects.getProjects(organizationId);
    },

    // Get a single project
    getProject: async (projectId: UUID) => {
      return api.projects.getProject(projectId);
    },

    // Create a new project
    createProject: async (data: {
      name: string;
      description?: string;
      organizationId: UUID;
      folderId?: UUID;
      icon?: string;
    }) => {
      return api.projects.createProject(data);
    },

    // Update a project
    updateProject: async (projectId: UUID, data: {
      name?: string;
      description?: string;
      folderId?: UUID;
      icon?: string;
    }) => {
      return api.projects.updateProject(projectId, data);
    },

    // Delete a project
    deleteProject: async (projectId: UUID) => {
      return api.projects.deleteProject(projectId);
    }
  };

  const folders = {
    // Get all folders in an organization
    getFolders: async (organizationId: UUID) => {
      return api.folders.getFolders(organizationId);
    },

    // Get a single folder
    getFolder: async (folderId: UUID) => {
      return api.folders.getFolder(folderId);
    },

    // Create a new folder
    createFolder: async (data: {
      name: string;
      organizationId: UUID;
      parentFolderId?: UUID;
    }) => {
      return api.folders.createFolder(data);
    },

    // Update a folder
    updateFolder: async (folderId: UUID, data: {
      name?: string;
      parentFolderId?: UUID;
    }) => {
      return api.folders.updateFolder(folderId, data);
    },

    // Delete a folder
    deleteFolder: async (folderId: UUID) => {
      return api.folders.deleteFolder(folderId);
    }
  };

  return {
    projects,
    folders
  };
};

export type ProjectsApi = ReturnType<typeof useProjects>; 