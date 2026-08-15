import { createAsyncThunk } from '@reduxjs/toolkit';
import { tasksApi } from './tasksApi';
import { Task, PaginationMeta } from '@/types';
import { FetchTasksQueryParams, CreateTaskPayload } from './tasksTypes';

export const fetchTasksThunk = createAsyncThunk<
  { tasks: Task[]; pagination: PaginationMeta },
  FetchTasksQueryParams | undefined,
  { rejectValue: string }
>('tasks/fetchTasks', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await tasksApi.getTasks(params);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch tasks');
  }
});

export const fetchTaskByIdThunk = createAsyncThunk<
  { task: Task },
  string,
  { rejectValue: string }
>('tasks/fetchTaskById', async (taskId, { rejectWithValue }) => {
  try {
    const response = await tasksApi.getTaskById(taskId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch task details');
  }
});

export const createTaskThunk = createAsyncThunk<
  { task: Task },
  CreateTaskPayload,
  { rejectValue: string }
>('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await tasksApi.createTask(taskData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create task');
  }
});

export const updateTaskStatusThunk = createAsyncThunk<
  { task: Task },
  { taskId: string; status: string },
  { rejectValue: string }
>('tasks/updateTaskStatus', async ({ taskId, status }, { rejectWithValue }) => {
  try {
    const response = await tasksApi.updateTask(taskId, { status });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update task status');
  }
});

export const updateTaskThunk = createAsyncThunk<
  { task: Task },
  { taskId: string; taskData: Partial<CreateTaskPayload> },
  { rejectValue: string }
>('tasks/updateTask', async ({ taskId, taskData }, { rejectWithValue }) => {
  try {
    const response = await tasksApi.updateTask(taskId, taskData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update task');
  }
});

export const deleteTaskThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    await tasksApi.deleteTask(taskId);
    return taskId;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to delete task');
  }
});
