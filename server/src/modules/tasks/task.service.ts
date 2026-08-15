import { isValidObjectId } from 'mongoose';
import { TaskModel } from './task.model';
import { ITaskDocument } from './task.types';
import { GetTasksQueryInput, CreateTaskInput, UpdateTaskInput } from './task.validation';
import { ProjectModel } from '../projects/project.model';
import { UserModel } from '../users/user.model';
import { IUserDocument, UserRole } from '../users/user.types';
import { ApiError } from '../../utils/ApiError';
import { verifyResourceAccess, toIdString, canAccessResource } from '../../utils/authorization';
import { auditLogService } from '../audit-logs/auditLog.service';
import { AuditAction } from '../audit-logs/auditLog.types';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export class TaskService {
  /**
   * Get paginated tasks list scoped by user role, project ownership, or assignment
   */
  async getTasks(query: GetTasksQueryInput, currentUser: IUserDocument) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const currentUserId = toIdString(currentUser._id);
    const filter: Record<string, any> = {};

    if (currentUser.role === UserRole.MANAGER) {
      const managerProjects = await ProjectModel.find({
        $or: [{ owner: currentUserId }, { members: currentUserId }],
      }).select('_id');

      const projectIds = managerProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    } else if (currentUser.role === UserRole.USER) {
      filter.$or = [
        { assignedTo: currentUserId },
        { createdBy: currentUserId },
      ];
    }

    if (query.project) {
      if (!isValidObjectId(query.project)) {
        throw new ApiError(400, 'Invalid Project ID format');
      }
      filter.project = query.project;
    }

    if (query.assignedTo) {
      if (!isValidObjectId(query.assignedTo)) {
        throw new ApiError(400, 'Invalid Assignee User ID format');
      }
      filter.assignedTo = query.assignedTo;
    }

    if (query.search) {
      const sanitizedSearch = escapeRegex(query.search);
      const searchRegex = { $regex: sanitizedSearch, $options: 'i' };
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: [{ title: searchRegex }, { description: searchRegex }] },
        ];
        delete filter.$or;
      } else {
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
      }
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    const [tasks, total] = await Promise.all([
      TaskModel.find(filter)
        .populate('project', 'name status owner')
        .populate('assignedTo', 'name email avatar role')
        .populate('createdBy', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaskModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks,
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
   * Create a task (ADMIN or MANAGER owning/managing project)
   */
  async createTask(input: CreateTaskInput, currentUser: IUserDocument): Promise<ITaskDocument> {
    if (!isValidObjectId(input.project)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

    const project = await ProjectModel.findById(input.project);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      currentUser,
      { ownerId: project.owner, memberIds: project.members },
      'Access Denied: You are not authorized to create tasks in this project'
    );

    const assignedToId =
      input.assignedTo && input.assignedTo.toString().trim() !== '' && input.assignedTo !== 'null'
        ? input.assignedTo
        : null;

    if (assignedToId) {
      if (!isValidObjectId(assignedToId)) {
        throw new ApiError(400, 'Invalid Assignee User ID format');
      }
      const assigneeUser = await UserModel.findById(assignedToId);
      if (!assigneeUser) {
        throw new ApiError(404, 'Assigned user does not exist');
      }
    }

    const task = await TaskModel.create({
      title: input.title,
      description: input.description || '',
      project: input.project,
      assignedTo: assignedToId,
      createdBy: currentUser._id,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });

    // Record CREATE_TASK audit log
    await auditLogService.logAction({
      userId: currentUser._id,
      action: AuditAction.CREATE_TASK,
      resource: 'Task',
      resourceId: task._id,
      metadata: { title: task.title, project: task.project, assignedTo: task.assignedTo },
    });

    return task.populate([
      { path: 'project', select: 'name status owner' },
      { path: 'assignedTo', select: 'name email avatar role' },
      { path: 'createdBy', select: 'name email avatar role' },
    ]);
  }

  /**
   * Get single task details by ID
   */
  async getTaskById(taskId: string, currentUser: IUserDocument): Promise<ITaskDocument> {
    if (!isValidObjectId(taskId)) {
      throw new ApiError(400, 'Invalid Task ID format');
    }

    const task = await TaskModel.findById(taskId)
      .populate('project', 'name status owner members')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const project = task.project as any;

    const canAccess =
      currentUser.role === UserRole.ADMIN ||
      toIdString(task.assignedTo?._id || task.assignedTo) === toIdString(currentUser._id) ||
      toIdString(task.createdBy?._id || task.createdBy) === toIdString(currentUser._id) ||
      (project && canAccessResource(currentUser, { ownerId: project.owner, memberIds: project.members }));

    if (!canAccess) {
      throw new ApiError(403, 'Access Denied: You do not have permission to view this task');
    }

    return task;
  }

  /**
   * Update task details (Admin/Manager full update vs User status-only update)
   */
  async updateTask(
    taskId: string,
    input: UpdateTaskInput,
    currentUser: IUserDocument
  ): Promise<ITaskDocument> {
    if (!isValidObjectId(taskId)) {
      throw new ApiError(400, 'Invalid Task ID format');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const project = await ProjectModel.findById(task.project);
    const currentUserId = toIdString(currentUser._id);

    if (currentUser.role === UserRole.USER) {
      const isAssignee = toIdString(task.assignedTo) === currentUserId;
      if (!isAssignee) {
        throw new ApiError(403, 'Access Denied: Users can only update tasks assigned to them');
      }

      if (
        input.title !== undefined ||
        input.description !== undefined ||
        input.assignedTo !== undefined ||
        input.priority !== undefined ||
        input.dueDate !== undefined
      ) {
        throw new ApiError(403, 'Access Denied: Regular users are only permitted to update task status');
      }
    }

    if (currentUser.role === UserRole.MANAGER && project) {
      const isProjectOwnerOrMember = canAccessResource(currentUser, {
        ownerId: project.owner,
        memberIds: project.members,
        creatorId: task.createdBy,
      });

      if (!isProjectOwnerOrMember) {
        throw new ApiError(403, 'Access Denied: You do not have permission to modify tasks in this project');
      }
    }

    if (input.assignedTo !== undefined) {
      const assignedToId =
        input.assignedTo && input.assignedTo.toString().trim() !== '' && input.assignedTo !== 'null'
          ? input.assignedTo
          : null;

      if (assignedToId) {
        if (!isValidObjectId(assignedToId)) {
          throw new ApiError(400, 'Invalid Assignee User ID format');
        }
        const assigneeUser = await UserModel.findById(assignedToId);
        if (!assigneeUser) {
          throw new ApiError(404, 'Assigned user does not exist');
        }
      }
      task.assignedTo = (assignedToId as any) || null;
    }

    const oldStatus = task.status;
    const isOnlyStatusUpdate =
      input.status !== undefined &&
      input.title === undefined &&
      input.description === undefined &&
      input.assignedTo === undefined &&
      input.priority === undefined &&
      input.dueDate === undefined;

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : null;

    await task.save();

    // Record Audit Log (UPDATE_TASK_STATUS vs UPDATE_TASK)
    const auditAction = isOnlyStatusUpdate ? AuditAction.UPDATE_TASK_STATUS : AuditAction.UPDATE_TASK;
    await auditLogService.logAction({
      userId: currentUser._id,
      action: auditAction,
      resource: 'Task',
      resourceId: task._id,
      metadata: { oldStatus, newStatus: task.status, updatedFields: Object.keys(input) },
    });

    return task.populate([
      { path: 'project', select: 'name status owner' },
      { path: 'assignedTo', select: 'name email avatar role' },
      { path: 'createdBy', select: 'name email avatar role' },
    ]);
  }

  /**
   * Delete a task (ADMIN or MANAGER owning/managing project)
   */
  async deleteTask(taskId: string, currentUser: IUserDocument): Promise<void> {
    if (!isValidObjectId(taskId)) {
      throw new ApiError(400, 'Invalid Task ID format');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const project = await ProjectModel.findById(task.project);

    if (currentUser.role !== UserRole.ADMIN) {
      if (currentUser.role === UserRole.USER) {
        throw new ApiError(403, 'Access Denied: Regular users cannot delete tasks');
      }

      if (currentUser.role === UserRole.MANAGER && project) {
        const canDelete = canAccessResource(currentUser, {
          ownerId: project.owner,
          creatorId: task.createdBy,
        });

        if (!canDelete) {
          throw new ApiError(403, 'Access Denied: You do not have permission to delete this task');
        }
      }
    }

    await task.deleteOne();

    // Record DELETE_TASK audit log
    await auditLogService.logAction({
      userId: currentUser._id,
      action: AuditAction.DELETE_TASK,
      resource: 'Task',
      resourceId: taskId,
      metadata: { taskTitle: task.title },
    });
  }
}

export const taskService = new TaskService();
