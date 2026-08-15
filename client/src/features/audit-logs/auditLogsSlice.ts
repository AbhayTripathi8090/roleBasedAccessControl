import { createSlice } from '@reduxjs/toolkit';
import { AuditLogsState } from './auditLogsTypes';
import { fetchAuditLogsThunk } from './auditLogsThunks';

const initialState: AuditLogsState = {
  logs: [],
  pagination: null,
  isLoading: false,
  error: null,
};

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    clearAuditLogsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAuditLogsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.logs = action.payload.logs;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchAuditLogsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch audit logs';
    });
  },
});

export const { clearAuditLogsError } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;
