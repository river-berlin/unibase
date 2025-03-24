import { authenticateUserAndGetSession, createUserAccountAndWorkspace } from '../client/sdk.gen';
import { client } from '../client/client.gen';
import localforage from 'localforage';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface User {
  id: string;
  email: string;
  name: string;
  organizations: Array<{
    id: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
  }>;
}

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

client.setConfig({
  auth: async () => {
    const token = await storage.getItem<string>('token');
    return token ? `${token}` : '';
  },
  baseUrl: API_URL,
});

export const useApi = () => {
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
        setIsInitialized(true);
        initPromise.resolve();
      }
    };

    initializeToken();
  }, []);

  const waitForInitialization = () => initPromise.promise;

  const auth = {
    login: async (email: string, password: string) => {
      const response = await authenticateUserAndGetSession({
        body: { email, password }
      });
      
      if (response.data?.token) {
        await storage.setItem('token', response.data.token);
      } else {
        throw new Error('Login failed - ' + response.error?.error);
      }

      return response.data;
    },

    register: async (email: string, password: string, name: string) => {
      const response = await createUserAccountAndWorkspace({
        body: { email, password, name }
      });
      
      if (response.data?.message) {
        const token = response.request.headers.get('Authorization')?.split(' ')[1];
        if (token) {
          await storage.setItem('token', token);
        }
      }
      return response.data;
    },

    logout: async () => {
      await storage.removeItem('token');
    },

    isAuthenticated: async () => {
      const token = await storage.getItem<string>('token');
      return !!token;
    },
  };

  return {
    auth,
    isInitialized,
    waitForInitialization
  };
};

export type Api = ReturnType<typeof useApi>; 