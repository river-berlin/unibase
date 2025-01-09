import type { LocalForage, LocalForageOptions } from '../types/localforage';

// Import localforage only in web environment
let localforage: LocalForage;

if (typeof window !== 'undefined') {
  // @ts-ignore - Import for web only
  import('localforage').then(module => {
    localforage = module.default;
    localforage.config({
      name: 'unibase',
      storeName: 'everything',
      description: 'Global state storage for Unibase'
    } as LocalForageOptions);
  }).catch(error => {
    console.error('Failed to load localforage:', error);
  });
} else {
  // Mock implementation for non-web environments
  localforage = {
    config: (_options: LocalForageOptions): void => {},
    getItem: async <T>(_key: string): Promise<T | null> => null,
    setItem: async <T>(_key: string, value: T): Promise<T> => value,
    removeItem: async (_key: string): Promise<void> => {},
    clear: async (): Promise<void> => {},
  };
}

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;  // MaterialCommunityIcons name
  lastModified: string;
  organizationId: string;  // Reference to organization
  file: {
    name: string;
    type: 'vocalcad' | 'stl';  // Restrict file types
    content: any;  // Arbitrary JSON content
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizationIds: string[];  // References to organizations
  preferences: {
    theme: 'light' | 'dark';
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  isDefault: boolean;
  userIds: string[];  // References to users
  createdAt: string;
  updatedAt: string;
}

export interface Everything {
  users: { [id: string]: User };
  organizations: { [id: string]: Organization };
  projects: { [id: string]: Project };  // Add projects to Everything
  currentUserId: string | null;
  currentOrganizationId: string | null;
  [key: string]: any;  // Allow for extensibility
}

class StorageService {
  private static instance: StorageService;
  private cache: { [key: string]: any } = {};

  private constructor() {
    // Initialize with empty cache
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize everything with a default organization and user
  async initialize(initialUser: Partial<User>): Promise<Everything> {
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Create dummy projects
    const dummyProjects: { [id: string]: Project } = {
      '1': {
        id: '1',
        name: 'Robot Arm',
        description: 'Articulated robotic arm with 6 DOF',
        icon: 'robot-industrial',
        lastModified: timestamp,
        organizationId: orgId,
        file: {
          name: 'robot_arm.json',
          type: 'vocalcad',
          content: {
            version: '1.0.0',
            type: 'robot_arm',
            joints: 6,
            dimensions: {
              base: { width: 100, height: 50 },
              segments: [200, 180, 150, 100, 50]
            }
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      '2': {
        id: '2',
        name: 'Chess Set',
        description: 'Complete chess set with custom pieces',
        icon: 'chess-king',
        lastModified: timestamp,
        organizationId: orgId,
        file: {
          name: 'chess_set.json',
          type: 'vocalcad',
          content: {
            version: '1.0.0',
            type: 'chess_set',
            pieces: ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'],
            dimensions: {
              board: { size: 400, squareSize: 50 },
              pieceHeight: { king: 75, queen: 70, bishop: 60, knight: 55, rook: 50, pawn: 45 }
            }
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      '3': {
        id: '3',
        name: 'Car Engine',
        description: 'V8 engine block with moving parts',
        icon: 'engine',
        lastModified: timestamp,
        organizationId: orgId,
        file: {
          name: 'engine.json',
          type: 'vocalcad',
          content: {
            version: '1.0.0',
            type: 'engine',
            configuration: 'V8',
            displacement: 5.0,
            components: ['block', 'pistons', 'crankshaft', 'valves'],
            dimensions: {
              bore: 94,
              stroke: 89,
              compression: 10.5
            }
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      '4': {
        id: '4',
        name: 'Architectural Model',
        description: 'Modern house design with interior',
        icon: 'home-modern',
        lastModified: timestamp,
        organizationId: orgId,
        file: {
          name: 'house.json',
          type: 'vocalcad',
          content: {
            version: '1.0.0',
            type: 'building',
            style: 'modern',
            floors: 2,
            rooms: ['living', 'kitchen', 'bedrooms', 'bathrooms'],
            dimensions: {
              width: 15000,
              length: 20000,
              height: 6000,
              rooms: {
                living: { width: 8000, length: 6000 },
                kitchen: { width: 4000, length: 5000 }
              }
            }
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      '5': {
        id: '5',
        name: 'Drone Design',
        description: 'Custom quadcopter frame design',
        icon: 'quadcopter',
        lastModified: timestamp,
        organizationId: orgId,
        file: {
          name: 'drone.json',
          type: 'vocalcad',
          content: {
            version: '1.0.0',
            type: 'drone',
            configuration: 'quadcopter',
            components: ['frame', 'motors', 'props', 'electronics'],
            dimensions: {
              frame: { width: 450, height: 100 },
              props: { diameter: 250, pitch: 4.8 },
              weight: 1200
            }
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    const defaultOrg: Organization = {
      id: orgId,
      name: 'Default Organization',
      isDefault: true,
      userIds: [userId],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const user: User = {
      id: userId,
      email: initialUser.email || '',
      name: initialUser.name || '',
      organizationIds: [orgId],
      preferences: {
        theme: 'light',
        ...initialUser.preferences,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const everything: Everything = {
      users: { [userId]: user },
      organizations: { [orgId]: defaultOrg },
      projects: dummyProjects,  // Add dummy projects
      currentUserId: userId,
      currentOrganizationId: orgId,
    };

    await this.setItem('everything', everything);
    return everything;
  }

  // Get everything
  async getEverything(): Promise<Everything | null> {
    return this.getItem('everything');
  }

  // Update everything
  async updateEverything(updates: Partial<Everything>): Promise<Everything> {
    const current = await this.getEverything();
    if (!current) {
      throw new Error('Data not initialized');
    }

    const updated = {
      ...current,
      ...updates,
    };

    await this.setItem('everything', updated);
    return updated;
  }

  // User methods
  async getCurrentUser(): Promise<User | null> {
    const everything = await this.getEverything();
    if (!everything?.currentUserId) return null;
    return everything.users[everything.currentUserId] || null;
  }

  async addUser(userData: Partial<User>): Promise<User> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const userId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const user: User = {
      id: userId,
      email: userData.email || '',
      name: userData.name || '',
      organizationIds: [],
      preferences: {
        theme: 'light',
        ...userData.preferences,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated = {
      ...everything,
      users: {
        ...everything.users,
        [userId]: user,
      },
    };

    await this.setItem('everything', updated);
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const user = everything.users[userId];
    if (!user) throw new Error('User not found');

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updated = {
      ...everything,
      users: {
        ...everything.users,
        [userId]: updatedUser,
      },
    };

    await this.setItem('everything', updated);
    return updatedUser;
  }

  // Organization methods
  async getCurrentOrganization(): Promise<Organization | null> {
    const everything = await this.getEverything();
    if (!everything?.currentOrganizationId) return null;
    return everything.organizations[everything.currentOrganizationId] || null;
  }

  async addOrganization(orgData: Partial<Organization>): Promise<Organization> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const orgId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const org: Organization = {
      id: orgId,
      name: orgData.name || 'New Organization',
      isDefault: false,
      userIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated = {
      ...everything,
      organizations: {
        ...everything.organizations,
        [orgId]: org,
      },
    };

    await this.setItem('everything', updated);
    return org;
  }

  async switchOrganization(orgId: string): Promise<Organization> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const org = everything.organizations[orgId];
    if (!org) throw new Error('Organization not found');

    const updated = {
      ...everything,
      currentOrganizationId: orgId,
    };

    await this.setItem('everything', updated);
    return org;
  }

  // Generic storage methods
  async getItem<T>(key: string): Promise<T | null> {
    if (this.cache[key] !== undefined) {
      return this.cache[key];
    }

    try {
      const value = await localforage.getItem<T>(key);
      if (value !== null) {
        this.cache[key] = value;
      }
      return value;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<T> {
    try {
      await localforage.setItem(key, value);
      this.cache[key] = value;
      return value;
    } catch (error) {
      console.error('Error setting item in storage:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
      delete this.cache[key];
    } catch (error) {
      console.error('Error removing item from storage:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await localforage.clear();
      this.cache = {};
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Project methods
  async getProjects(): Promise<{ [id: string]: Project }> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');
    return everything.projects;
  }

  async getProjectsByOrganization(orgId: string): Promise<Project[]> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');
    
    return Object.values(everything.projects).filter(
      project => project.organizationId === orgId
    );
  }

  async addProject(projectData: Partial<Project>): Promise<Project> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const projectId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const project: Project = {
      id: projectId,
      name: projectData.name || 'New Project',
      description: projectData.description || '',
      icon: projectData.icon || 'cube-outline',
      lastModified: timestamp,
      organizationId: projectData.organizationId || everything.currentOrganizationId || '',
      file: projectData.file || {
        name: projectData.name || 'New Project',
        type: 'vocalcad',
        content: {}
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated = {
      ...everything,
      projects: {
        ...everything.projects,
        [projectId]: project,
      },
    };

    await this.setItem('everything', updated);
    return project;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const project = everything.projects[projectId];
    if (!project) throw new Error('Project not found');

    const updatedProject = {
      ...project,
      ...updates,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = {
      ...everything,
      projects: {
        ...everything.projects,
        [projectId]: updatedProject,
      },
    };

    await this.setItem('everything', updated);
    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<void> {
    const everything = await this.getEverything();
    if (!everything) throw new Error('Data not initialized');

    const { [projectId]: removed, ...remainingProjects } = everything.projects;
    if (!removed) throw new Error('Project not found');

    const updated = {
      ...everything,
      projects: remainingProjects,
    };

    await this.setItem('everything', updated);
  }
}

// Export singleton instance
export const storage = StorageService.getInstance(); 