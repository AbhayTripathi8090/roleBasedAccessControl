import { User, PaginationMeta } from '@/types';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export interface FetchUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}
