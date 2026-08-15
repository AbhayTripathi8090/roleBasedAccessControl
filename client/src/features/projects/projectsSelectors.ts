import { RootState } from '@/store';

export const selectProjectsState = (state: RootState) => state.projects;
export const selectProjectsList = (state: RootState) => state.projects.projects;
export const selectCurrentProject = (state: RootState) => state.projects.currentProject;
export const selectProjectsPagination = (state: RootState) => state.projects.pagination;
export const selectProjectsLoading = (state: RootState) => state.projects.isLoading;
export const selectProjectsError = (state: RootState) => state.projects.error;
