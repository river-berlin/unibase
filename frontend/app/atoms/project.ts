import { atom, useAtom } from 'jotai';

// Project interface
export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
  use_for_training?: boolean;
  already_trained?: boolean;
  trained_at?: string;
}

/**
 * Atom for storing the current project
 */
export const projectAtom = atom<Project | null>(null);

/**
 * Hook to get and set project
 */
export function useProject() {
  const [project, setProject] = useAtom(projectAtom);

  return {
    project,
    setProject
  };
} 