import { isValidObjectId } from 'mongoose';
import { ProjectModel } from './project.model';
import { IProjectDocument } from './project.types';
import { GetProjectsQueryInput, CreateProjectInput, UpdateProjectInput, AddProjectMemberInput } from './project.validation';
import { UserModel } from '../users/user.model';
import { IUserDocument, UserRole } from '../users/user.types';
import { ApiError } from '../../utils/ApiError';
import { verifyResourceAccess, toIdString } from '../../utils/authorization';
import { auditLogService } from '../audit-logs/auditLog.service';
import { AuditAction } from '../audit-logs/auditLog.types';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export class ProjectService {
  /**
   * Get paginated projects list scoped by user role & membership
   */
  async getProjects(query: GetProjectsQueryInput, currentUser: IUserDocument) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const currentUserId = toIdString(currentUser._id);
    const filter: Record<string, any> = {};

    if (currentUser.role === UserRole.MANAGER) {
      filter.$or = [
        { owner: currentUserId },
        { members: currentUserId },
      ];
    } else if (currentUser.role === UserRole.USER) {
      filter.members = currentUserId;
    }

    if (query.search) {
      const sanitizedSearch = escapeRegex(query.search);
      const searchRegex = { $regex: sanitizedSearch, $options: 'i' };
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: [{ name: searchRegex }, { description: searchRegex }] },
        ];
        delete filter.$or;
      } else {
        filter.$or = [{ name: searchRegex }, { description: searchRegex }];
      }
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [projects, total] = await Promise.all([
      ProjectModel.find(filter)
        .populate('owner', 'name email avatar role')
        .populate('members', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Create a new project (ADMIN or MANAGER)
   */
  async createProject(input: CreateProjectInput, currentUser: IUserDocument): Promise<IProjectDocument> {
    const currentUserId = toIdString(currentUser._id);

    const memberSet = new Set(input.members || []);
    memberSet.add(currentUserId);

    const project = await ProjectModel.create({
      name: input.name,
      description: input.description || '',
      status: input.status,
      owner: currentUserId,
      members: Array.from(memberSet),
    });

    // Record CREATE_PROJECT audit log
    await auditLogService.logAction({
      userId: currentUser._id,
      action: AuditAction.CREATE_PROJECT,
      resource: 'Project',
      resourceId: project._id,
      metadata: { name: project.name, status: project.status },
    });

    return project.populate([
      { path: 'owner', select: 'name email avatar role' },
      { path: 'members', select: 'name email avatar role' },
    ]);
  }

  /**
   * Get single project details by ID with resource-level authorization
   */
  async getProjectById(projectId: string, currentUser: IUserDocument): Promise<IProjectDocument> {
    if (!isValidObjectId(projectId)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

    const project = await ProjectModel.findById(projectId)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      currentUser,
      { ownerId: project.owner, memberIds: project.members },
      'Access Denied: You do not have permission to view this project'
    );

    return project;
  }

  /**
   * Update project details (Project Owner or Admin)
   */
  async updateProject(
    projectId: string,
    input: UpdateProjectInput,
    currentUser: IUserDocument
  ): Promise<IProjectDocument> {
    if (!isValidObjectId(projectId)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      currentUser,
      { ownerId: project.owner },
      'Access Denied: Only the project owner or an Admin can modify this project'
    );

    if (input.name !== undefined) project.name = input.name;
    if (input.description !== undefined) project.description = input.description;
    if (input.status !== undefined) project.status = input.status;
    if (input.members !== undefined) {
      const ownerId = toIdString(project.owner);
      const memberSet = new Set(input.members);
      memberSet.add(ownerId);
      project.members = Array.from(memberSet) as any;
    }

    await project.save();

    // Record UPDATE_PROJECT audit log
    await auditLogService.logAction({
      userId: currentUser._id,
      action: AuditAction.UPDATE_PROJECT,
      resource: 'Project',
      resourceId: project._id,
      metadata: { updatedFields: Object.keys(input) },
    });

    return project.populate([
      { path: 'owner', select: 'name email avatar role' },
      { path: 'members', select: 'name email avatar role' },
    ]);
  }

  /**
   * Delete a project (Project Owner or Admin)
   */
  async deleteProject(projectId: string, currentUser: IUserDocument): Promise<void> {
    if (!isValidObjectId(projectId)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      currentUser,
      { ownerId: project.owner },
      'Access Denied: Only the project owner or an Admin can delete this project'
    );

    await project.deleteOne();

    // Record DELETE_PROJECT audit log
    await auditLogService.logAction({
      userId: currentUser._id,
      action: AuditAction.DELETE_PROJECT,
      resource: 'Project',
      resourceId: projectId,
      metadata: { projectName: project.name },
    });
  }

  /**
   * Add a member to project (Project Owner or Admin)
   */
  async addProjectMember(
    projectId: string,
    input: AddProjectMemberInput,
    currentUser: IUserDocument
  ): Promise<IProjectDocument> {
    if (!isValidObjectId(projectId)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

    if (!isValidObjectId(input.userId)) {
      throw new ApiError(400, 'Invalid User ID format');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      currentUser,
      { ownerId: project.owner },
      'Access Denied: Only the project owner or an Admin can manage project members'
    );

    const userToAdd = await UserModel.findById(input.userId);
    if (!userToAdd) {
      throw new ApiError(404, 'User to add does not exist');
    }

    const alreadyMember = project.members.some((m) => toIdString(m) === input.userId);
    if (alreadyMember) {
      throw new ApiError(400, 'User is already a member of this project');
    }

    project.members.push(userToAdd._id as any);
    await project.save();

    // Record ADD_PROJECT_MEMBER audit log
    await auditLogService.logAction({
      userId: currentUser._id,
      action: AuditAction.ADD_PROJECT_MEMBER,
      resource: 'Project',
      resourceId: project._id,
      metadata: { addedUserId: input.userId, addedUserEmail: userToAdd.email },
    });

    return project.populate([
      { path: 'owner', select: 'name email avatar role' },
      { path: 'members', select: 'name email avatar role' },
    ]);
  }

  /**
   * Remove a member from project (Project Owner or Admin)
   */
  async removeProjectMember(
    projectId: string,
    targetUserId: string,
    currentUser: IUserDocument
  ): Promise<IProjectDocument> {
    if (!isValidObjectId(projectId)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

    if (!isValidObjectId(targetUserId)) {
      throw new ApiError(400, 'Invalid User ID format');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      currentUser,
      { ownerId: project.owner },
      'Access Denied: Only the project owner or an Admin can manage project members'
    );

    if (toIdString(project.owner) === targetUserId) {
      throw new ApiError(400, 'Cannot remove the project owner from project members');
    }

    const isMember = project.members.some((m) => toIdString(m) === targetUserId);
    if (!isMember) {
      throw new ApiError(400, 'User is not a member of this project');
    }

    project.members = project.members.filter((m) => toIdString(m) !== targetUserId) as any;
    await project.save();

    return project.populate([
      { path: 'owner', select: 'name email avatar role' },
      { path: 'members', select: 'name email avatar role' },
    ]);
  }
}

export const projectService = new ProjectService();
