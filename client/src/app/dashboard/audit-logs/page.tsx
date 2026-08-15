'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { fetchAuditLogsThunk } from '@/features/audit-logs/auditLogsThunks';
import {
  selectAuditLogsList,
  selectAuditLogsPagination,
  selectAuditLogsLoading,
  selectAuditLogsError,
} from '@/features/audit-logs/auditLogsSelectors';
import { AuditLog, User, UserRole } from '@/types';
import { ProtectedPage } from '@/components/common/ProtectedPage';
import {
  FileText,
  Filter,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LogIn,
  UserPlus,
  UserCheck,
  FolderPlus,
  FolderMinus,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Code,
  Tag,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const dispatch = useAppDispatch();

  const logs = useAppSelector(selectAuditLogsList);
  const pagination = useAppSelector(selectAuditLogsPagination);
  const isLoading = useAppSelector(selectAuditLogsLoading);
  const error = useAppSelector(selectAuditLogsError);

  // Filters & Pagination State
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Expanded metadata row state
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadAuditLogs = useCallback(() => {
    dispatch(
      fetchAuditLogsThunk({
        page,
        limit: 15,
        action: actionFilter || undefined,
        resource: resourceFilter || undefined,
      })
    );
  }, [dispatch, page, actionFilter, resourceFilter]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const toggleMetadataExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionBadgeStyle = (action: string) => {
    if (action.includes('DELETE')) {
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: FolderMinus,
      };
    }
    if (action.includes('CREATE')) {
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: FolderPlus,
      };
    }
    if (action === 'LOGIN') {
      return {
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        icon: LogIn,
      };
    }
    if (action === 'CHANGE_ROLE') {
      return {
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        icon: Shield,
      };
    }
    return {
      badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      icon: FileText,
    };
  };

  return (
    <ProtectedPage roles={[UserRole.ADMIN]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Security Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Audit Logs
            </h1>
            <p className="text-sm text-slate-400">
              Chronological immutable audit stream tracking system security events, modifications, and user access.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-56 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl transition-all focus:outline-none"
              >
                <option value="">All Audit Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="CREATE_USER">CREATE_USER</option>
                <option value="UPDATE_USER">UPDATE_USER</option>
                <option value="CHANGE_ROLE">CHANGE_ROLE</option>
                <option value="DELETE_USER">DELETE_USER</option>
                <option value="CREATE_PROJECT">CREATE_PROJECT</option>
                <option value="UPDATE_PROJECT">UPDATE_PROJECT</option>
                <option value="DELETE_PROJECT">DELETE_PROJECT</option>
                <option value="ADD_PROJECT_MEMBER">ADD_PROJECT_MEMBER</option>
                <option value="CREATE_TASK">CREATE_TASK</option>
                <option value="UPDATE_TASK">UPDATE_TASK</option>
                <option value="UPDATE_TASK_STATUS">UPDATE_TASK_STATUS</option>
                <option value="DELETE_TASK">DELETE_TASK</option>
              </select>
            </div>

            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-48 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl transition-all focus:outline-none"
            >
              <option value="">All Resources</option>
              <option value="User">Resource: User</option>
              <option value="Project">Resource: Project</option>
              <option value="Task">Resource: Task</option>
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
              onClick={loadAuditLogs}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Audit Log Stream Table */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource & ID</th>
                  <th className="py-3.5 px-4 text-right">Metadata</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4 sm:px-6"><div className="w-28 h-3.5 bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="w-32 h-4 bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="w-24 h-5 bg-slate-800 rounded-md" /></td>
                      <td className="py-4 px-4"><div className="w-28 h-4 bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4 text-right"><div className="w-8 h-8 bg-slate-800 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-600" />
                        <p className="font-semibold text-slate-400">No audit logs found</p>
                        <p className="text-xs text-slate-500 max-w-xs">
                          No audit events match your selected action or resource filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const userObj = typeof log.user === 'object' ? (log.user as User) : null;
                    const actionInfo = getActionBadgeStyle(log.action);
                    const ActionIcon = actionInfo.icon;
                    const isExpanded = expandedLogId === log._id;

                    return (
                      <React.Fragment key={log._id}>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          {/* Timestamp */}
                          <td className="py-4 px-4 sm:px-6 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</span>
                            </div>
                          </td>

                          {/* User */}
                          <td className="py-4 px-4">
                            {userObj ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-500/30 shrink-0">
                                  {userObj.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate text-xs">{userObj.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{userObj.email}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-xs">System</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${actionInfo.badge}`}>
                              <ActionIcon className="w-3 h-3" />
                              {log.action}
                            </span>
                          </td>

                          {/* Resource & ID */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                <Database className="w-3 h-3 text-indigo-400" />
                                {log.resource}
                              </span>
                              {log.resourceId && (
                                <p className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]" title={log.resourceId}>
                                  ID: {log.resourceId}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Metadata Expand Toggle */}
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => toggleMetadataExpand(log._id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors inline-flex items-center gap-1 text-xs"
                            >
                              <Code className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Metadata Payload Row */}
                        {isExpanded && (
                          <tr className="bg-slate-950/80 border-b border-slate-800/80">
                            <td colSpan={5} className="p-4 sm:px-6">
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                  <span className="flex items-center gap-1.5 text-indigo-400">
                                    <Tag className="w-3.5 h-3.5" /> Audit Event Payload JSON
                                  </span>
                                  <span>Log Reference: {log._id}</span>
                                </div>
                                <pre className="p-3 rounded-lg bg-slate-950 text-indigo-300 text-xs font-mono overflow-x-auto border border-slate-800">
                                  {JSON.stringify(log.metadata || {}, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
                <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} Log Records Total)
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
      </div>
    </ProtectedPage>
  );
}
