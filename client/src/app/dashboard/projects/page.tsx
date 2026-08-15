'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import {
  fetchProjectsThunk,
  createProjectThunk,
  updateProjectThunk,
  deleteProjectThunk,
  addProjectMemberThunk,
  removeProjectMemberThunk,
} from '@/features/projects/projectsThunks';
import {
  selectProjectsList,
  selectProjectsPagination,
  selectProjectsLoading,
  selectProjectsError,
} from '@/features/projects/projectsSelectors';
import { fetchUsersThunk } from '@/features/users/usersThunks';
import { selectUsersList } from '@/features/users/usersSelectors';
import { usePermissions } from '@/hooks/usePermissions';
import { Can } from '@/components/common/Can';
import { Project, ProjectStatus, User } from '@/types';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  UserPlus,
  UserMinus,
  Briefcase,
} from 'lucide-react';

const projectFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { can } = usePermissions();

  const projects = useAppSelector(selectProjectsList);
  const pagination = useAppSelector(selectProjectsPagination);
  const isLoading = useAppSelector(selectProjectsLoading);
  const error = useAppSelector(selectProjectsError);
  const allUsers = useAppSelector(selectUsersList);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [activeDetailsProject, setActiveDetailsProject] = useState<Project | null>(null);

  // Member Management State
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: ProjectStatus.PLANNING,
    },
  });

  const loadProjects = useCallback(() => {
    dispatch(
      fetchProjectsThunk({
        page,
        limit: 9,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    dispatch(fetchUsersThunk({ limit: 100 }));
  }, [dispatch]);

  const handleCreateSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    const resultAction = await dispatch(createProjectThunk(data));
    if (createProjectThunk.fulfilled.match(resultAction)) {
      setIsCreateOpen(false);
      reset();
      loadProjects();
    }
  };

  const handleEditSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    if (!editingProject) return;
    const resultAction = await dispatch(
      updateProjectThunk({ projectId: editingProject._id, projectData: data })
    );
    if (updateProjectThunk.fulfilled.match(resultAction)) {
      setEditingProject(null);
      reset();
      loadProjects();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    await dispatch(deleteProjectThunk(projectToDelete._id));
    setProjectToDelete(null);
    loadProjects();
  };

  const handleAddMember = async () => {
    if (!activeDetailsProject || !selectedMemberToAdd) return;
    setIsAddingMember(true);
    const resultAction = await dispatch(
      addProjectMemberThunk({
        projectId: activeDetailsProject._id,
        userId: selectedMemberToAdd,
      })
    );
    if (addProjectMemberThunk.fulfilled.match(resultAction)) {
      setActiveDetailsProject(resultAction.payload.project);
      setSelectedMemberToAdd('');
    }
    setIsAddingMember(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeDetailsProject) return;
    const resultAction = await dispatch(
      removeProjectMemberThunk({
        projectId: activeDetailsProject._id,
        userId,
      })
    );
    if (removeProjectMemberThunk.fulfilled.match(resultAction)) {
      setActiveDetailsProject(resultAction.payload.project);
    }
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setValue('name', proj.name);
    setValue('description', proj.description || '');
    setValue('status', proj.status);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case ProjectStatus.COMPLETED:
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" /> Workspace Projects
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Projects Management
          </h1>
          <p className="text-sm text-slate-400">
            Organize workspace initiatives, assign project members, and monitor operational progress.
          </p>
        </div>

        <Can action="create_project">
          <button
            onClick={() => {
              reset();
              setIsCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all duration-150 flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </Can>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl transition-all focus:outline-none"
          >
            <option value="">All Project Statuses</option>
            <option value={ProjectStatus.PLANNING}>PLANNING</option>
            <option value={ProjectStatus.ACTIVE}>ACTIVE</option>
            <option value={ProjectStatus.COMPLETED}>COMPLETED</option>
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
            onClick={loadProjects}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-12 bg-slate-800/60 rounded" />
              <div className="h-6 bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no projects matching your query or filters in this workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const ownerObj = typeof proj.owner === 'object' ? (proj.owner as User) : null;
            const membersList = Array.isArray(proj.members) ? proj.members : [];
            const canManage = can('update_project', proj);

            return (
              <div
                key={proj._id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 backdrop-blur-xl transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  {/* Card Header & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(
                        proj.status
                      )}`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer Info & Actions */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{membersList.length} Members</span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Owner: <span className="text-slate-300 font-medium">{ownerObj ? ownerObj.name : 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setActiveDetailsProject(proj)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <span>View Details & Members</span>
                    </button>

                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setProjectToDelete(proj)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <strong className="text-white">{pagination.page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} Projects Total)
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

      {/* Create / Edit Project Modal Dialog */}
      {(isCreateOpen || editingProject) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-extrabold text-white">
                {editingProject ? 'Edit Project Properties' : 'Create New Project'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingProject(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(editingProject ? handleEditSubmit : handleCreateSubmit)}
              className="space-y-4"
            >
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise RBAC Migration"
                  {...register('name')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
                {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of project goals and deliverables..."
                  {...register('description')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                >
                  <option value={ProjectStatus.PLANNING}>PLANNING</option>
                  <option value={ProjectStatus.ACTIVE}>ACTIVE</option>
                  <option value={ProjectStatus.COMPLETED}>COMPLETED</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingProject(null);
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
                    <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Project?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{projectToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
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

      {/* Project Details & Member Management Modal */}
      {activeDetailsProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(activeDetailsProject.status)}`}>
                  {activeDetailsProject.status}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {activeDetailsProject.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveDetailsProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeDetailsProject.description || 'No description provided.'}
            </p>

            {/* Project Members Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Project Members ({Array.isArray(activeDetailsProject.members) ? activeDetailsProject.members.length : 0})</span>
                </h4>
              </div>

              {/* Add Member Controls (Owner or Admin) */}
              {can('manage_project_members', activeDetailsProject) && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
                  <select
                    value={selectedMemberToAdd}
                    onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="">Select a user to add to project...</option>
                    {allUsers
                      .filter(
                        (u) =>
                          !Array.isArray(activeDetailsProject.members) ||
                          !activeDetailsProject.members.some((m) => (typeof m === 'object' ? m.id === u.id : m === u.id))
                      )
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) - {u.role}
                        </option>
                      ))}
                  </select>

                  <button
                    disabled={!selectedMemberToAdd || isAddingMember}
                    onClick={handleAddMember}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isAddingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>Add Member</span>
                  </button>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {Array.isArray(activeDetailsProject.members) &&
                  activeDetailsProject.members.map((memberItem) => {
                    const member = typeof memberItem === 'object' ? (memberItem as User) : null;
                    if (!member) return null;

                    const isOwner =
                      (typeof activeDetailsProject.owner === 'object'
                        ? activeDetailsProject.owner.id
                        : activeDetailsProject.owner) === member.id;

                    return (
                      <div
                        key={member.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white flex items-center gap-2">
                              <span>{member.name}</span>
                              {isOwner && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold uppercase">
                                  Owner
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">{member.email}</p>
                          </div>
                        </div>

                        {!isOwner && can('manage_project_members', activeDetailsProject) && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors"
                            title="Remove Member"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
