'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import {
  fetchTasksThunk,
  createTaskThunk,
  updateTaskThunk,
  updateTaskStatusThunk,
  deleteTaskThunk,
} from '@/features/tasks/tasksThunks';
import {
  selectTasksList,
  selectTasksPagination,
  selectTasksLoading,
  selectTasksError,
} from '@/features/tasks/tasksSelectors';
import { fetchProjectsThunk } from '@/features/projects/projectsThunks';
import { selectProjectsList } from '@/features/projects/projectsSelectors';
import { fetchUsersThunk } from '@/features/users/usersThunks';
import { selectUsersList } from '@/features/users/usersSelectors';
import { usePermissions } from '@/hooks/usePermissions';
import { Can } from '@/components/common/Can';
import { Task, TaskStatus, TaskPriority, User, Project } from '@/types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  AlertTriangle,
} from 'lucide-react';

const taskFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Task title must be at least 2 characters')
    .max(150, 'Task title cannot exceed 150 characters'),
  description: z.string().optional(),
  project: z.string().min(1, 'Project selection is required'),
  assignedTo: z.string().nullable().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().nullable().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { can } = usePermissions();

  const tasks = useAppSelector(selectTasksList);
  const pagination = useAppSelector(selectTasksPagination);
  const isLoading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);

  const projects = useAppSelector(selectProjectsList);
  const allUsers = useAppSelector(selectUsersList);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Quick Status updating state
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      project: '',
      assignedTo: null,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: '',
    },
  });

  const loadTasks = useCallback(() => {
    dispatch(
      fetchTasksThunk({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      })
    );
  }, [dispatch, page, search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    dispatch(fetchProjectsThunk({ limit: 100 }));
    dispatch(fetchUsersThunk({ limit: 100 }));
  }, [dispatch]);

  const handleCreateSubmit: SubmitHandler<TaskFormData> = async (data) => {
    const payload = {
      ...data,
      assignedTo: data.assignedTo && data.assignedTo.trim() !== '' ? data.assignedTo : null,
      dueDate: data.dueDate && data.dueDate.trim() !== '' ? data.dueDate : null,
    };
    const resultAction = await dispatch(createTaskThunk(payload as any));
    if (createTaskThunk.fulfilled.match(resultAction)) {
      setIsCreateOpen(false);
      reset();
      loadTasks();
    }
  };

  const handleEditSubmit: SubmitHandler<TaskFormData> = async (data) => {
    if (!editingTask) return;
    const payload = {
      ...data,
      assignedTo: data.assignedTo && data.assignedTo.trim() !== '' ? data.assignedTo : null,
      dueDate: data.dueDate && data.dueDate.trim() !== '' ? data.dueDate : null,
    };
    const resultAction = await dispatch(
      updateTaskThunk({ taskId: editingTask._id, taskData: payload as any })
    );
    if (updateTaskThunk.fulfilled.match(resultAction)) {
      setEditingTask(null);
      reset();
      loadTasks();
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    await dispatch(updateTaskStatusThunk({ taskId, status: newStatus }));
    setUpdatingTaskId(null);
    loadTasks();
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    await dispatch(deleteTaskThunk(taskToDelete._id));
    setTaskToDelete(null);
    loadTasks();
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('description', task.description || '');
    setValue(
      'project',
      typeof task.project === 'object' ? (task.project as Project)._id : task.project
    );
    setValue(
      'assignedTo',
      task.assignedTo
        ? typeof task.assignedTo === 'object'
          ? (task.assignedTo as User).id
          : task.assignedTo
        : null
    );
    setValue('priority', task.priority);
    setValue('status', task.status);
    setValue('dueDate', task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case TaskPriority.MEDIUM:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case TaskStatus.REVIEW:
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case TaskStatus.IN_PROGRESS:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" /> Workspace Tasks
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tasks Management
          </h1>
          <p className="text-sm text-slate-400">
            Track deliverables, update assignment statuses, and enforce project workflows.
          </p>
        </div>

        <Can action="create_task">
          <button
            onClick={() => {
              reset();
              setIsCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all duration-150 flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </Can>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl transition-all focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value={TaskStatus.TODO}>TODO</option>
              <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
              <option value={TaskStatus.REVIEW}>REVIEW</option>
              <option value={TaskStatus.COMPLETED}>COMPLETED</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl transition-all focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value={TaskPriority.LOW}>LOW</option>
            <option value={TaskPriority.MEDIUM}>MEDIUM</option>
            <option value={TaskPriority.HIGH}>HIGH</option>
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
            onClick={loadTasks}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tasks Table / Cards */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 sm:px-6">Task Title & Description</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Project</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-2">
                        <div className="w-48 h-3.5 bg-slate-800 rounded" />
                        <div className="w-64 h-2.5 bg-slate-800/60 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="w-20 h-6 bg-slate-800 rounded-lg" /></td>
                    <td className="py-4 px-4"><div className="w-16 h-5 bg-slate-800 rounded-md" /></td>
                    <td className="py-4 px-4"><div className="w-24 h-4 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-4 hidden lg:table-cell"><div className="w-20 h-4 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-4 text-right"><div className="w-12 h-8 bg-slate-800 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckSquare className="w-8 h-8 text-slate-600" />
                      <p className="font-semibold text-slate-400">No tasks found</p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        No tasks match your current query or role permissions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const projectObj = typeof task.project === 'object' ? (task.project as Project) : null;
                  const assigneeObj = typeof task.assignedTo === 'object' ? (task.assignedTo as User) : null;
                  const canStatusOnly = can('update_task_status', task);
                  const canFullEdit = can('update_task', task);
                  const canDelete = can('delete_task', task);

                  return (
                    <tr key={task._id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Title & Description */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-xs sm:text-sm">{task.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {task.description || 'No description provided.'}
                          </p>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-4">
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            disabled={!canStatusOnly || updatingTaskId === task._id}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all focus:outline-none cursor-pointer disabled:cursor-not-allowed ${getStatusBadge(
                              task.status
                            )} bg-slate-950/60`}
                          >
                            <option value={TaskStatus.TODO}>TODO</option>
                            <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                            <option value={TaskStatus.REVIEW}>REVIEW</option>
                            <option value={TaskStatus.COMPLETED}>COMPLETED</option>
                          </select>
                          {updatingTaskId === task._id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 absolute right-2 top-1.5" />
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-4 px-4">
                        {assigneeObj ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-500/30">
                              {assigneeObj.name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-200 truncate max-w-[100px]">
                              {assigneeObj.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <span className="text-xs text-slate-300 font-medium">
                          {projectObj ? projectObj.name : 'N/A'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canFullEdit && (
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                              title="Edit Full Task"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setTaskToDelete(task)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
              <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} Tasks Total)
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

      {/* Create / Edit Task Modal Dialog */}
      {(isCreateOpen || editingTask) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-extrabold text-white">
                {editingTask ? 'Edit Task Details' : 'Create New Task'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTask(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(editingTask ? handleEditSubmit : handleCreateSubmit)}
              className="space-y-4"
            >
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Implement Authorization Middleware"
                  {...register('title')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
                {errors.title && <p className="text-xs text-rose-400 font-medium">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific task instructions..."
                  {...register('description')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>

              {/* Project Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Project
                </label>
                <select
                  {...register('project')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                >
                  <option value="">Select Target Project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.status})
                    </option>
                  ))}
                </select>
                {errors.project && <p className="text-xs text-rose-400 font-medium">{errors.project.message}</p>}
              </div>

              {/* Assignee Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Assign Task To
                </label>
                <select
                  {...register('assignedTo')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                  >
                    <option value={TaskPriority.LOW}>LOW</option>
                    <option value={TaskPriority.MEDIUM}>MEDIUM</option>
                    <option value={TaskPriority.HIGH}>HIGH</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                  >
                    <option value={TaskStatus.TODO}>TODO</option>
                    <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                    <option value={TaskStatus.REVIEW}>REVIEW</option>
                    <option value={TaskStatus.COMPLETED}>COMPLETED</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Due Date
                </label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingTask ? 'Update Task' : 'Create Task'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setTaskToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Task?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{taskToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
