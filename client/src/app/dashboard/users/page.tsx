'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { fetchUsersThunk, updateUserRoleThunk, deleteUserThunk } from '@/features/users/usersThunks';
import {
  selectUsersList,
  selectUsersPagination,
  selectUsersLoading,
  selectUsersError,
} from '@/features/users/usersSelectors';
import { selectCurrentUser } from '@/features/auth/authSelectors';
import { User, UserRole } from '@/types';
import { ProtectedPage } from '@/components/common/ProtectedPage';
import {
  Users,
  Search,
  Filter,
  Trash2,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserCheck,
  UserX,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const users = useAppSelector(selectUsersList);
  const pagination = useAppSelector(selectUsersPagination);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Confirmation modal state for deletion
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Role update state
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const loadUsers = useCallback(() => {
    dispatch(
      fetchUsersThunk({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      })
    );
  }, [dispatch, page, search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRoleId(userId);
    await dispatch(updateUserRoleThunk({ userId, role: newRole }));
    setUpdatingRoleId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    await dispatch(deleteUserThunk(userToDelete.id));
    setIsDeleting(false);
    setUserToDelete(null);
    loadUsers();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case UserRole.MANAGER:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <ProtectedPage roles={[UserRole.ADMIN]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Admin Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-slate-400">
              Manage accounts, assign RBAC system roles, and govern active permissions.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-48 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl transition-all focus:outline-none"
            >
              <option value="">All System Roles</option>
              <option value={UserRole.ADMIN}>ADMIN Only</option>
              <option value={UserRole.MANAGER}>MANAGER Only</option>
              <option value={UserRole.USER}>USER Only</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadUsers}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* User Table */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">User Profile</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800" />
                          <div className="space-y-1">
                            <div className="w-28 h-3 bg-slate-800 rounded" />
                            <div className="w-40 h-2.5 bg-slate-800/60 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><div className="w-16 h-5 bg-slate-800 rounded-md" /></td>
                      <td className="py-4 px-4"><div className="w-14 h-5 bg-slate-800 rounded-md" /></td>
                      <td className="py-4 px-4 hidden md:table-cell"><div className="w-20 h-3 bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4 text-right"><div className="w-8 h-8 bg-slate-800 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-600" />
                        <p className="font-semibold text-slate-400">No users found</p>
                        <p className="text-xs text-slate-500 max-w-xs">
                          Try refining your search terms or role filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* User Profile */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                              {user.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                              ) : (
                                user.name.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-4 px-4">
                          <div className="relative inline-block">
                            <select
                              value={user.role}
                              disabled={isSelf || updatingRoleId === user.id}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all focus:outline-none cursor-pointer disabled:cursor-not-allowed ${getRoleBadge(
                                user.role
                              )} bg-slate-950/60`}
                            >
                              <option value={UserRole.ADMIN}>ADMIN</option>
                              <option value={UserRole.MANAGER}>MANAGER</option>
                              <option value={UserRole.USER}>USER</option>
                            </select>
                            {updatingRoleId === user.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 absolute right-2 top-1.2" />
                            )}
                          </div>
                        </td>

                        {/* Active Status */}
                        <td className="py-4 px-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                              <UserCheck className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold">
                              <UserX className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 hidden md:table-cell text-slate-400 text-[11px]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Delete Action */}
                        <td className="py-4 px-4 text-right">
                          {!isSelf ? (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Self</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing Page <strong className="text-white">{pagination.page}</strong> of{' '}
                <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} Users Total)
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-50 hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={!pagination.hasNextPage || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-50 hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal Dialog */}
        {userToDelete && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  onClick={() => setUserToDelete(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Delete User Account?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
