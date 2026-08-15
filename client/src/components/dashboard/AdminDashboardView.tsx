'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { fetchUsersThunk } from '@/features/users/usersThunks';
import { selectUsersList, selectUsersPagination } from '@/features/users/usersSelectors';
import { fetchProjectsThunk } from '@/features/projects/projectsThunks';
import { selectProjectsList } from '@/features/projects/projectsSelectors';
import { fetchTasksThunk } from '@/features/tasks/tasksThunks';
import { selectTasksPagination } from '@/features/tasks/tasksSelectors';
import { fetchAuditLogsThunk } from '@/features/audit-logs/auditLogsThunks';
import { selectAuditLogsList } from '@/features/audit-logs/auditLogsSelectors';
import { UserRole, ProjectStatus, User } from '@/types';
import { Users, Shield, FolderKanban, CheckSquare, Activity, ArrowRight, Clock } from 'lucide-react';

export function AdminDashboardView() {
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectUsersList);
  const usersPagination = useAppSelector(selectUsersPagination);
  const projects = useAppSelector(selectProjectsList);
  const tasksPagination = useAppSelector(selectTasksPagination);
  const auditLogs = useAppSelector(selectAuditLogsList);

  useEffect(() => {
    dispatch(fetchUsersThunk({ limit: 100 }));
    dispatch(fetchProjectsThunk({ limit: 100 }));
    dispatch(fetchTasksThunk({ limit: 1 }));
    dispatch(fetchAuditLogsThunk({ limit: 5 }));
  }, [dispatch]);

  const totalUsersCount = usersPagination?.total ?? users.length;
  const managersCount = users.filter((u) => u.role === UserRole.MANAGER).length;
  const activeProjectsCount = projects.filter((p) => p.status === ProjectStatus.ACTIVE).length;
  const totalTasksCount = tasksPagination?.total ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-slate-800 relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> Admin System Overview
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Executive Security & Operations Dashboard
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Real-time metrics calculated directly from system APIs governing user accounts, projects, tasks, and audit logs.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalUsersCount}</p>
          <p className="text-[11px] text-slate-500">Registered platform accounts</p>
        </div>

        {/* Managers */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Managers</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{managersCount}</p>
          <p className="text-[11px] text-slate-500">Project managers active</p>
        </div>

        {/* Active Projects */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{activeProjectsCount}</p>
          <p className="text-[11px] text-slate-500">Projects currently active</p>
        </div>

        {/* Total Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalTasksCount}</p>
          <p className="text-[11px] text-slate-500">System task deliverables</p>
        </div>
      </div>

      {/* Recent Activity Audit Logs Stream */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Recent System Activity</span>
          </h3>
          <Link
            href="/dashboard/audit-logs"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>View Full Logs Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent audit log activity.</p>
          ) : (
            auditLogs.slice(0, 5).map((log) => {
              const userObj = typeof log.user === 'object' ? (log.user as User) : null;
              return (
                <div
                  key={log._id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-slate-200 font-medium">
                      {userObj ? userObj.name : 'System User'} executed {log.action} on {log.resource}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
