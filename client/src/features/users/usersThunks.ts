import { createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from './usersApi';
import { User, PaginationMeta } from '@/types';
import { FetchUsersQueryParams } from './usersTypes';

export const fetchUsersThunk = createAsyncThunk<
  { users: User[]; pagination: PaginationMeta },
  FetchUsersQueryParams | undefined,
  { rejectValue: string }
>('users/fetchUsers', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await usersApi.getUsers(params);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch users');
  }
});

export const fetchUserByIdThunk = createAsyncThunk<
  { user: User },
  string,
  { rejectValue: string }
>('users/fetchUserById', async (userId, { rejectWithValue }) => {
  try {
    const response = await usersApi.getUserById(userId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch user details');
  }
});

export const updateUserProfileThunk = createAsyncThunk<
  { user: User },
  { userId: string; profileData: { name?: string; avatar?: string } },
  { rejectValue: string }
>('users/updateUserProfile', async ({ userId, profileData }, { rejectWithValue }) => {
  try {
    const response = await usersApi.updateUserProfile(userId, profileData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update user profile');
  }
});

export const updateUserRoleThunk = createAsyncThunk<
  { user: User },
  { userId: string; role: string },
  { rejectValue: string }
>('users/updateUserRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const response = await usersApi.updateUserRole(userId, role);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update user role');
  }
});

export const deleteUserThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    await usersApi.deleteUser(userId);
    return userId;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to delete user');
  }
});
