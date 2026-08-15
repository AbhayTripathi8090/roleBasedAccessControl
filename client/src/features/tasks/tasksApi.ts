import apiClient from '@/lib/axios';
import { ApiResponse, Task, PaginationMeta } from '@/types';
import { FetchTasksQueryParams, CreateTaskPayload } from './tasksTypes';

export const tasksApi = {
  getTasks: async (
    params: FetchTasksQueryParams = {}
  ): Promise<ApiResponse<{ tasks: Task[]; pagination: PaginationMeta }>> => {
    const response = await apiClient.get<{ tasks: Task[]; pagination: PaginationMeta }>('/tasks', {
      params,
    });
    return response.data as unknown as ApiResponse<{ tasks: Task[]; pagination: PaginationMeta }>;
  },

  getTaskById: async (taskId: string): Promise<ApiResponse<{ task: Task }>> => {
    const response = await apiClient.get<{ task: Task }>(`/tasks/${taskId}`);
    return response.data as unknown as ApiResponse<{ task: Task }>;
  },

  createTask: async (taskData: CreateTaskPayload): Promise<ApiResponse<{ task: Task }>> => {
    const response = await apiClient.post<{ task: Task }>('/tasks', taskData);
    return response.data as unknown as ApiResponse<{ task: Task }>;
  },

  updateTask: async (
    taskId: string,
    taskData: Partial<CreateTaskPayload>
  ): Promise<ApiResponse<{ task: Task }>> => {
    const response = await apiClient.patch<{ task: Task }>(`/tasks/${taskId}`, taskData);
    return response.data as unknown as ApiResponse<{ task: Task }>;
  },

  deleteTask: async (taskId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<null>(`/tasks/${taskId}`);
    return response.data as unknown as ApiResponse<null>;
  },
};
