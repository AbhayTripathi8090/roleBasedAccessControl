import { Project, PaginationMeta } from '@/types';

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export interface FetchProjectsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: string;
  members?: string[];
}
