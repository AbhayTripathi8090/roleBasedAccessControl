import { Task, PaginationMeta } from '@/types';

export interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export interface FetchTasksQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  project: string;
  assignedTo?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}
