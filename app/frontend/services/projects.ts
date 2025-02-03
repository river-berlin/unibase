import { listAllFoldersInOrganization } from '../client/sdk.gen';
import { useApi } from './api';

export const useProjects = () => {
  return {
    folders: {
      getFolders: async (organizationId: string) => {
        const response = await listAllFoldersInOrganization({
          path: { organizationId },
        });
        return response.data;
      }
    }
  };
};

export type ProjectsApi = ReturnType<typeof useProjects>;