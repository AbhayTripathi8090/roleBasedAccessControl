import { createSlice } from '@reduxjs/toolkit';
import { ProjectsState } from './projectsTypes';
import { fetchProjectsThunk, createProjectThunk, deleteProjectThunk } from './projectsThunks';

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder.addCase(fetchProjectsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.projects = action.payload.projects;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchProjectsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch projects';
    });

    // Create Project
    builder.addCase(createProjectThunk.fulfilled, (state, action) => {
      state.projects.unshift(action.payload.project);
    });

    // Delete Project
    builder.addCase(deleteProjectThunk.fulfilled, (state, action) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
    });
  },
});

export const { clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
