import { BackendApi } from '../src/backend-js-api';
import localforage from 'localforage';
import { useEffect, useState } from 'react';

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
  const [initPromise] = useState(() => {
    let resolve: () => void;
    const promise = new Promise<void>((r) => { resolve = r; });
    return { promise, resolve: resolve! };
  });

  useEffect(() => {
    const initializeToken = async () => {
      const token = await storage.getItem<string>('token');
      if (token) {
        apiClient.setToken(token);
      }
      setIsInitialized(true);
      initPromise.resolve();
    };

    initializeToken();
  }, [apiClient]);

  const waitForInitialization = () => initPromise.promise;

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


  return {
    api: apiClient,
    auth,
    isInitialized,
    waitForInitialization
  };
};

export type Api = ReturnType<typeof useApi>; 