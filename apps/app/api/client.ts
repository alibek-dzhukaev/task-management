import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  ApiResponse,
  UserResponse,
  UpdateUserDto,
} from '@nx-fullstack/shared-types';

const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Auth endpoints
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Login failed');
    }

    return result.data;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Registration failed');
    }

    return result.data;
  }

  // Users endpoints
  async getUsers(token?: string): Promise<UserResponse[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/users/users`, {
      headers,
    });

    const result: ApiResponse<UserResponse[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to fetch users');
    }

    return result.data;
  }

  async getUser(id: string, token?: string): Promise<UserResponse> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/users/users/${id}`, {
      headers,
    });

    const result: ApiResponse<UserResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to fetch user');
    }

    return result.data;
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
    token?: string
  ): Promise<UserResponse> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/users/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const result: ApiResponse<UserResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to update user');
    }

    return result.data;
  }

  async deleteUser(id: string, token?: string): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/users/users/${id}`, {
      method: 'DELETE',
      headers,
    });

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete user');
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

