import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from './authTypes';
import { loginThunk, registerThunk, logoutThunk, fetchCurrentUserThunk } from './authThunks';
import { User } from '@/types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isInitializing = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload || 'Login failed';
    });

    // Register
    builder.addCase(registerThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload || 'Registration failed';
    });

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });

    // Fetch Current User
    builder.addCase(fetchCurrentUserThunk.pending, (state) => {
      state.isInitializing = true;
    });
    builder.addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
      state.isInitializing = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(fetchCurrentUserThunk.rejected, (state) => {
      state.isInitializing = false;
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
