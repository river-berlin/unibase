import React, { createContext, useContext } from 'react';
import { useStorage } from '../hooks/useStorage';
import type { Everything, User, Organization } from '../services/storage';

// Create context with the same shape as useStorage return value
interface StorageContextValue {
  // State
  everything: Everything | null;
  loading: boolean;
  error: Error | null;
  currentUser: User | null;
  currentOrganization: Organization | null;

  // Actions
  initialize: (initialUser: Partial<User>) => Promise<Everything>;
  updateEverything: (updates: Partial<Everything>) => Promise<Everything>;
  addUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<User>;
  addOrganization: (orgData: Partial<Organization>) => Promise<Organization>;
  switchOrganization: (orgId: string) => Promise<Organization>;
  clearError: () => void;

  // Helper getters
  users: { [id: string]: User };
  organizations: { [id: string]: Organization };
}

const StorageContext = createContext<StorageContextValue | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const storage = useStorage();

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
}

// Custom hook to use the storage context
export function useStorageContext() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorageContext must be used within a StorageProvider');
  }
  return context;
} 