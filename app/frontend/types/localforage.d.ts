declare module 'localforage' {
  export interface LocalForageOptions {
    name?: string;
    storeName?: string;
    description?: string;
  }

  export interface LocalForage {
    config(options: LocalForageOptions): void;
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<T>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
  }

  const localforage: LocalForage;
  export default localforage;
}

// Export types for internal use
export type { LocalForage, LocalForageOptions } from 'localforage'; 