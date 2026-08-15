import apiClient from '@/lib/axios';
import { ApiResponse, User, PaginationMeta } from '@/types';
import { FetchUsersQueryParams } from './usersTypes';

export const usersApi = {
  getUsers: async (
    params: FetchUsersQueryParams = {}
  ): Promise<ApiResponse<{ users: User[]; pagination: PaginationMeta }>> => {
    const response = await apiClient.get<{ users: User[]; pagination: PaginationMeta }>('/users', {
      params,
    });
    return response.data as unknown as ApiResponse<{ users: User[]; pagination: PaginationMeta }>;
  },

  getUserById: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get<{ user: User }>(`/users/${userId}`);
    return response.data as unknown as ApiResponse<{ user: User }>;
  },

  updateUserProfile: async (
    userId: string,
    profileData: { name?: string; avatar?: string }
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.patch<{ user: User }>(`/users/${userId}`, profileData);
    return response.data as unknown as ApiResponse<{ user: User }>;
  },

  updateUserRole: async (
    userId: string,
    role: string
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.patch<{ user: User }>(`/users/${userId}/role`, { role });
    return response.data as unknown as ApiResponse<{ user: User }>;
  },

  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<null>(`/users/${userId}`);
    return response.data as unknown as ApiResponse<null>;
  },
};
