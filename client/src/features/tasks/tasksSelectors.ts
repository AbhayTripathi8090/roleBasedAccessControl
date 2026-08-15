import { RootState } from '@/store';

export const selectTasksState = (state: RootState) => state.tasks;
export const selectTasksList = (state: RootState) => state.tasks.tasks;
export const selectCurrentTask = (state: RootState) => state.tasks.currentTask;
export const selectTasksPagination = (state: RootState) => state.tasks.pagination;
export const selectTasksLoading = (state: RootState) => state.tasks.isLoading;
export const selectTasksError = (state: RootState) => state.tasks.error;
