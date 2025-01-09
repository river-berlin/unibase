import { ApiError } from '../types';

export class ApiClient {
  protected baseURL: string;
  protected token?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/ping`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  protected async request<T>(
    path: string,
    options: RequestInit = {},
    queryParams?: Record<string, string>
  ): Promise<T> {
    const headers = new Headers(options.headers);
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    
    if (options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const url = new URL(`${this.baseURL}${path}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw {
        ...error,
        status: response.status,
      } as ApiError;
    }

    return response.json();
  }

  protected get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, queryParams);
  }

  protected post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  protected patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  protected delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
} 