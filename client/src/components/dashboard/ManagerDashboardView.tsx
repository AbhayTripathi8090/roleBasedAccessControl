'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { fetchProjectsThunk } from '@/features/projects/projectsThunks';
import { selectProjectsList, selectProjectsPagination } from '@/features/projects/projectsSelectors';
import { fetchTasksThunk } from '@/features/tasks/tasksThunks';
import { selectTasksList } from '@/features/tasks/tasksSelectors';
import { TaskStatus } from '@/types';
import { Shield, FolderKanban, Users, CheckSquare, Clock, ArrowRight } from 'lucide-react';

export function ManagerDashboardView() {
  const dispatch = useAppDispatch();

  const projects = useAppSelector(selectProjectsList);
  const projectsPagination = useAppSelector(selectProjectsPagination);
  const tasks = useAppSelector(selectTasksList);

  useEffect(() => {
    dispatch(fetchProjectsThunk({ limit: 100 }));
    dispatch(fetchTasksThunk({ limit: 100 }));
  }, [dispatch]);

  const ownedProjectsCount = projectsPagination?.total ?? projects.length;

  // Calculate unique team members across managed projects
  const teamMemberIds = new Set<string>();
  projects.forEach((proj) => {
    if (Array.isArray(proj.members)) {
      proj.members.forEach((m) => {
        const id = typeof m === 'object' ? m.id : m;
        if (id) teamMemberIds.add(id);
      });
    }
  });

  const pendingTasksCount = tasks.filter(
    (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.REVIEW
  ).length;

  const completedTasksCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-slate-800 relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> Project Manager Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Manager Operations & Team Deliverables
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Real-time API tracking for managed projects, assigned team members, pending deliverables, and completed tasks.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Owned Projects */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Owned Projects</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{ownedProjectsCount}</p>
          <p className="text-[11px] text-slate-500">Managed project initiatives</p>
        </div>

        {/* Team Members */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Members</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{teamMemberIds.size}</p>
          <p className="text-[11px] text-slate-500">Unique members across projects</p>
        </div>

        {/* Pending Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{pendingTasksCount}</p>
          <p className="text-[11px] text-slate-500">Tasks in TODO / IN_PROGRESS / REVIEW</p>
        </div>

        {/* Completed Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{completedTasksCount}</p>
          <p className="text-[11px] text-slate-500">Tasks successfully finished</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-base text-white">Project Management</h3>
          <p className="text-xs text-slate-400">
            Create new project workspaces, assign project members, and modify status properties.
          </p>
          <Link
            href="/dashboard/projects"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold w-fit transition-all flex items-center gap-2"
          >
            <span>Manage Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-base text-white">Task Assignment</h3>
          <p className="text-xs text-slate-400">
            Create deliverables, assign tasks to team members, and manage priorities.
          </p>
          <Link
            href="/dashboard/tasks"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold w-fit transition-all flex items-center gap-2"
          >
            <span>Manage Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
