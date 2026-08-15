import apiClient from '@/lib/axios';
import { ApiResponse, Project, PaginationMeta } from '@/types';
import { FetchProjectsQueryParams, CreateProjectPayload } from './projectsTypes';

export const projectsApi = {
  getProjects: async (
    params: FetchProjectsQueryParams = {}
  ): Promise<ApiResponse<{ projects: Project[]; pagination: PaginationMeta }>> => {
    const response = await apiClient.get<{ projects: Project[]; pagination: PaginationMeta }>(
      '/projects',
      { params }
    );
    return response.data as unknown as ApiResponse<{ projects: Project[]; pagination: PaginationMeta }>;
  },

  getProjectById: async (projectId: string): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.get<{ project: Project }>(`/projects/${projectId}`);
    return response.data as unknown as ApiResponse<{ project: Project }>;
  },

  createProject: async (
    projectData: CreateProjectPayload
  ): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.post<{ project: Project }>('/projects', projectData);
    return response.data as unknown as ApiResponse<{ project: Project }>;
  },

  updateProject: async (
    projectId: string,
    projectData: Partial<CreateProjectPayload>
  ): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.patch<{ project: Project }>(`/projects/${projectId}`, projectData);
    return response.data as unknown as ApiResponse<{ project: Project }>;
  },

  deleteProject: async (projectId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<null>(`/projects/${projectId}`);
    return response.data as unknown as ApiResponse<null>;
  },

  addMember: async (
    projectId: string,
    userId: string
  ): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.post<{ project: Project }>(`/projects/${projectId}/members`, { userId });
    return response.data as unknown as ApiResponse<{ project: Project }>;
  },

  removeMember: async (
    projectId: string,
    userId: string
  ): Promise<ApiResponse<{ project: Project }>> => {
    const response = await apiClient.delete<{ project: Project }>(`/projects/${projectId}/members/${userId}`);
    return response.data as unknown as ApiResponse<{ project: Project }>;
  },
};
