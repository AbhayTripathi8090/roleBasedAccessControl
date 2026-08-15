import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api';
import { AuditLog, PaginationMeta } from '@/types';
import { FetchAuditLogsQueryParams } from './auditLogsTypes';

export const fetchAuditLogsThunk = createAsyncThunk<
  { logs: AuditLog[]; pagination: PaginationMeta },
  FetchAuditLogsQueryParams | undefined,
  { rejectValue: string }
>('auditLogs/fetchAuditLogs', async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.user) queryParams.append('user', params.user);
    if (params.action) queryParams.append('action', params.action);
    if (params.resource) queryParams.append('resource', params.resource);
    if (params.resourceId) queryParams.append('resourceId', params.resourceId);

    const response = await apiRequest<{ logs: AuditLog[]; pagination: PaginationMeta }>(
      `/audit-logs?${queryParams.toString()}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch audit logs');
  }
});
