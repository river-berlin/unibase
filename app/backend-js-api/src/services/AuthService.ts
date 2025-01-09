import { ApiClient } from '../utils/ApiClient';
import { LoginCredentials, RegisterData, User } from '../types';

export class AuthService extends ApiClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await this.post<{ token: string; user: User }>('/auth/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    const response = await this.post<{ token: string; user: User }>('/auth/register', data);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  logout(): void {
    this.clearToken();
  }
} 