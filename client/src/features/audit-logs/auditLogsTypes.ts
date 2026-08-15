import { AuditLog, PaginationMeta } from '@/types';

export interface AuditLogsState {
  logs: AuditLog[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export interface FetchAuditLogsQueryParams {
  page?: number;
  limit?: number;
  user?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
}
