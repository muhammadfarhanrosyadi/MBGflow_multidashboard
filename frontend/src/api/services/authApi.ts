/**
 * src/api/services/authApi.ts
 * Auth-related API calls.
 */
import apiClient from '../client';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  name?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  message?: string;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
  message?: string;
}

export const authApi = {
  login(payload: LoginPayload): Promise<import('axios').AxiosResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', payload);
  },

  me(): Promise<import('axios').AxiosResponse<MeResponse>> {
    return apiClient.get<MeResponse>('/auth/me');
  },

  logout(): void {
    // JWT is stateless — just remove the token client-side
    const token = localStorage.getItem('scm_token');
    if (token) {
      apiClient.post('/auth/logout').catch(() => { /* fire-and-forget */ });
    }
  },
};
