
import { BackendApi } from '../src/backend-js-api';
import localforage from 'localforage';
import { useEffect, useState } from 'react';
import type { User } from '../src/backend-js-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Initialize localforage only in client side
if (typeof window !== 'undefined') {
  localforage.config({
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ],
    name: 'unibase'
  });
}

// Helper function for typed storage access
const storage = {
  getItem: async <T>(key: string): Promise<T | null> => {
    if (typeof window === 'undefined') return null;
    return localforage.getItem<T>(key);
  },
  setItem: async <T>(key: string, value: T): Promise<T> => {
    if (typeof window === 'undefined') return value;
    return localforage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return localforage.removeItem(key);
  }
};

export const useApi = () => {
  const [apiClient] = useState(() => new BackendApi(API_URL));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize token from storage if it exists
    const initializeToken = async () => {
      const token = await storage.getItem<string>('token');
      if (token) {
        apiClient.setToken(token);
      }
      setIsInitialized(true);
    };

    initializeToken();
  }, [apiClient]);

  const auth = {
    login: async (email: string, password: string) => {
      console.log('login', email, password);
      const response = await apiClient.auth.login({ email, password });
      console.log('response', response);
      if (response.token) {
        await storage.setItem('token', response.token);
        await storage.setItem('user', response.user);
      }

      return response;
    },

    register: async (email: string, password: string, name: string) => {
      const response = await apiClient.auth.register({ email, password, name });
      if (response.token) {
        await storage.setItem('token', response.token);
        await storage.setItem('user', response.user);
      }
      return response;
    },

    logout: async () => {
      apiClient.auth.logout();
      await storage.removeItem('token');
      await storage.removeItem('user');
    },

    getCurrentUser: async () => {
      return storage.getItem('user');
    },

    isAuthenticated: async () => {
      const token = await storage.getItem<string>('token');
      return !!token;
    },
  };

  // Admin service for admin-specific API calls
  const admin = {
    getUsers: async (): Promise<User[]> => {
      return apiClient.get('/admin/users');
    },

    updateUserRole: async (userId: string, data: { isAdmin: boolean }): Promise<void> => {
      return apiClient.patch(`/admin/users/${userId}/role`, data);
    },

    deleteUser: async (userId: string): Promise<void> => {
      return apiClient.delete(`/admin/users/${userId}`);
    }
  };

  return {
    api: apiClient,
    auth,
    admin,
    isInitialized
  };
};

export type Api = ReturnType<typeof useApi>; 