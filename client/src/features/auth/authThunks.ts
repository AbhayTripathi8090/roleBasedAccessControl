import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { User } from '@/types';
import { LoginPayload, RegisterPayload } from './authTypes';

export const loginThunk = createAsyncThunk<
  { user: User },
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const registerThunk = createAsyncThunk<
  { user: User },
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(userData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Logout failed');
  }
});

export const fetchCurrentUserThunk = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getCurrentUser();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch current user');
  }
});
