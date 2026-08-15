import apiClient from '@/lib/axios';
import { ApiResponse, User } from '@/types';
import { LoginPayload, RegisterPayload } from './authTypes';

export const authApi = {
  login: async (credentials: LoginPayload): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.post<{ user: User }>('/auth/login', credentials);
    return response.data as unknown as ApiResponse<{ user: User }>;
  },

  register: async (userData: RegisterPayload): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.post<{ user: User }>('/auth/register', userData);
    return response.data as unknown as ApiResponse<{ user: User }>;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<null>('/auth/logout');
    return response.data as unknown as ApiResponse<null>;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data as unknown as ApiResponse<{ user: User }>;
  },
};
