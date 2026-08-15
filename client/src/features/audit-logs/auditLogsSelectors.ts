import { RootState } from '@/store';

export const selectAuditLogsState = (state: RootState) => state.auditLogs;
export const selectAuditLogsList = (state: RootState) => state.auditLogs.logs;
export const selectAuditLogsPagination = (state: RootState) => state.auditLogs.pagination;
export const selectAuditLogsLoading = (state: RootState) => state.auditLogs.isLoading;
export const selectAuditLogsError = (state: RootState) => state.auditLogs.error;
