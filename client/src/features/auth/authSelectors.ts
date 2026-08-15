import { RootState } from '@/store';

export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectIsInitializing = (state: RootState) => state.auth.isInitializing;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
