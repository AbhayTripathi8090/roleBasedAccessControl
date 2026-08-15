import { createSlice } from '@reduxjs/toolkit';
import { TasksState } from './tasksTypes';
import { fetchTasksThunk, createTaskThunk, updateTaskStatusThunk, deleteTaskThunk } from './tasksThunks';

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasksThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasksThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload.tasks;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchTasksThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch tasks';
    });

    // Create Task
    builder.addCase(createTaskThunk.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload.task);
    });

    // Update Task Status
    builder.addCase(updateTaskStatusThunk.fulfilled, (state, action) => {
      const updatedTask = action.payload.task;
      state.tasks = state.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t));
    });

    // Delete Task
    builder.addCase(deleteTaskThunk.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
    });
  },
});

export const { clearTasksError } = tasksSlice.actions;
export default tasksSlice.reducer;
