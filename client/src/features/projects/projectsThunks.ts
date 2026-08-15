import { createAsyncThunk } from '@reduxjs/toolkit';
import { projectsApi } from './projectsApi';
import { Project, PaginationMeta } from '@/types';
import { FetchProjectsQueryParams, CreateProjectPayload } from './projectsTypes';

export const fetchProjectsThunk = createAsyncThunk<
  { projects: Project[]; pagination: PaginationMeta },
  FetchProjectsQueryParams | undefined,
  { rejectValue: string }
>('projects/fetchProjects', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await projectsApi.getProjects(params);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch projects');
  }
});

export const fetchProjectByIdThunk = createAsyncThunk<
  { project: Project },
  string,
  { rejectValue: string }
>('projects/fetchProjectById', async (projectId, { rejectWithValue }) => {
  try {
    const response = await projectsApi.getProjectById(projectId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch project details');
  }
});

export const createProjectThunk = createAsyncThunk<
  { project: Project },
  CreateProjectPayload,
  { rejectValue: string }
>('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const response = await projectsApi.createProject(projectData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create project');
  }
});

export const updateProjectThunk = createAsyncThunk<
  { project: Project },
  { projectId: string; projectData: Partial<CreateProjectPayload> },
  { rejectValue: string }
>('projects/updateProject', async ({ projectId, projectData }, { rejectWithValue }) => {
  try {
    const response = await projectsApi.updateProject(projectId, projectData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update project');
  }
});

export const deleteProjectThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('projects/deleteProject', async (projectId, { rejectWithValue }) => {
  try {
    await projectsApi.deleteProject(projectId);
    return projectId;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to delete project');
  }
});

export const addProjectMemberThunk = createAsyncThunk<
  { project: Project },
  { projectId: string; userId: string },
  { rejectValue: string }
>('projects/addProjectMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    const response = await projectsApi.addMember(projectId, userId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to add project member');
  }
});

export const removeProjectMemberThunk = createAsyncThunk<
  { project: Project },
  { projectId: string; userId: string },
  { rejectValue: string }
>('projects/removeProjectMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    const response = await projectsApi.removeMember(projectId, userId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to remove project member');
  }
});
