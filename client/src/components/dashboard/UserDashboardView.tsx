'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { fetchTasksThunk } from '@/features/tasks/tasksThunks';
import { selectTasksList, selectTasksPagination } from '@/features/tasks/tasksSelectors';
import { fetchProjectsThunk } from '@/features/projects/projectsThunks';
import { selectProjectsList, selectProjectsPagination } from '@/features/projects/projectsSelectors';
import { TaskStatus } from '@/types';
import { CheckSquare, Clock, CheckCircle2, FolderKanban, ArrowRight } from 'lucide-react';

export function UserDashboardView() {
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectTasksList);
  const tasksPagination = useAppSelector(selectTasksPagination);
  const projects = useAppSelector(selectProjectsList);
  const projectsPagination = useAppSelector(selectProjectsPagination);

  useEffect(() => {
    dispatch(fetchTasksThunk({ limit: 100 }));
    dispatch(fetchProjectsThunk({ limit: 100 }));
  }, [dispatch]);

  const assignedTasksCount = tasksPagination?.total ?? tasks.length;
  const assignedProjectsCount = projectsPagination?.total ?? projects.length;

  const completedTasksCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const tasksDueSoonCount = tasks.filter(
    (t) => t.status !== TaskStatus.COMPLETED && (t.dueDate || t.status === TaskStatus.IN_PROGRESS)
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <CheckSquare className="w-3.5 h-3.5" /> My Deliverables Workspace
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Member Workstation & Task Stream
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Real-time API tracking for your assigned tasks, active projects, tasks due soon, and completed deliverables.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Assigned Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Tasks</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{assignedTasksCount}</p>
          <p className="text-[11px] text-slate-500">Tasks assigned to you</p>
        </div>

        {/* Tasks Due Soon */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks Due Soon</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{tasksDueSoonCount}</p>
          <p className="text-[11px] text-slate-500">Active or in-progress tasks</p>
        </div>

        {/* Completed Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{completedTasksCount}</p>
          <p className="text-[11px] text-slate-500">Successfully finished tasks</p>
        </div>

        {/* Assigned Projects */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Projects</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{assignedProjectsCount}</p>
          <p className="text-[11px] text-slate-500">Projects where you are a member</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-base text-white">Update Task Status</h3>
          <p className="text-xs text-slate-400">
            View assigned task details and update task status (TODO, IN_PROGRESS, REVIEW, COMPLETED).
          </p>
          <Link
            href="/dashboard/tasks"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold w-fit transition-all flex items-center gap-2"
          >
            <span>My Tasks Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-base text-white">Joined Projects</h3>
          <p className="text-xs text-slate-400">
            Browse projects you are currently a member of and review project details.
          </p>
          <Link
            href="/dashboard/projects"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold w-fit border border-slate-700 transition-all flex items-center gap-2"
          >
            <span>My Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
