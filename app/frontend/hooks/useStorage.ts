import { useState, useEffect, useCallback } from 'react';
import { storage, Everything, User, Organization } from '../services/storage';

export function useStorage() {
  const [everything, setEverything] = useState<Everything | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await storage.getEverything();
        setEverything(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Computed values
  const currentUser = everything?.users[everything.currentUserId ?? ''] ?? null;
  const currentOrganization = everything?.organizations[everything.currentOrganizationId ?? ''] ?? null;

  // Actions
  const initialize = useCallback(async (initialUser: Partial<User>) => {
    try {
      const data = await storage.initialize(initialUser);
      setEverything(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize'));
      throw err;
    }
  }, []);

  const updateEverything = useCallback(async (updates: Partial<Everything>) => {
    try {
      const data = await storage.updateEverything(updates);
      setEverything(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update'));
      throw err;
    }
  }, []);

  const addUser = useCallback(async (userData: Partial<User>) => {
    try {
      const user = await storage.addUser(userData);
      const data = await storage.getEverything();
      setEverything(data);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add user'));
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const user = await storage.updateUser(userId, updates);
      const data = await storage.getEverything();
      setEverything(data);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user'));
      throw err;
    }
  }, []);

  const addOrganization = useCallback(async (orgData: Partial<Organization>) => {
    try {
      const org = await storage.addOrganization(orgData);
      const data = await storage.getEverything();
      setEverything(data);
      return org;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add organization'));
      throw err;
    }
  }, []);

  const switchOrganization = useCallback(async (orgId: string) => {
    try {
      const org = await storage.switchOrganization(orgId);
      const data = await storage.getEverything();
      setEverything(data);
      return org;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch organization'));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    everything,
    loading,
    error,
    currentUser,
    currentOrganization,

    // Actions
    initialize,
    updateEverything,
    addUser,
    updateUser,
    addOrganization,
    switchOrganization,
    clearError,

    // Helper getters
    users: everything?.users ?? {},
    organizations: everything?.organizations ?? {},
  };
} 