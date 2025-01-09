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