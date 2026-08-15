import { createSlice } from '@reduxjs/toolkit';
import { UsersState } from './usersTypes';
import { fetchUsersThunk, updateUserRoleThunk, deleteUserThunk } from './usersThunks';

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder.addCase(fetchUsersThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsersThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchUsersThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch users';
    });

    // Update Role
    builder.addCase(updateUserRoleThunk.fulfilled, (state, action) => {
      const updatedUser = action.payload.user;
      state.users = state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    });

    // Delete User
    builder.addCase(deleteUserThunk.fulfilled, (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
