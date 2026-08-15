import { RootState } from '@/store';

export const selectUsersState = (state: RootState) => state.users;
export const selectUsersList = (state: RootState) => state.users.users;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUsersPagination = (state: RootState) => state.users.pagination;
export const selectUsersLoading = (state: RootState) => state.users.isLoading;
export const selectUsersError = (state: RootState) => state.users.error;
