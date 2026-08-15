import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './asyncHandler';
import { ApiError } from '../utils/ApiError';
import { verifyResourceAccess } from '../utils/authorization';
import { ProjectModel } from '../modules/projects/project.model';
import { TaskModel } from '../modules/tasks/task.model';

/**
 * Middleware enforcing project-level access authorization:
 * - ADMIN: Access all projects
 * - MANAGER: Access projects they own or are members of
 * - USER: Access projects they are members of
 */
export const authorizeProjectAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required before authorization');
    }

    const projectId = req.params.id || req.params.projectId || req.body.project;
    if (!projectId) {
      throw new ApiError(400, 'Project ID parameter is required');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    verifyResourceAccess(
      req.user,
      {
        ownerId: project.owner,
        memberIds: project.members,
      },
      'Access Denied: You do not have permission for this project'
    );

    // Attach project to request for downstream controller usage
    (req as any).project = project;
    next();
  }
);

/**
 * Middleware enforcing task-level access authorization:
 * - ADMIN: Access all tasks
 * - MANAGER: Access tasks created by them or in projects they own/manage
 * - USER: Access tasks assigned to them or created by them
 */
export const authorizeTaskAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required before authorization');
    }

    const taskId = req.params.id || req.params.taskId;
    if (!taskId) {
      throw new ApiError(400, 'Task ID parameter is required');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    verifyResourceAccess(
      req.user,
      {
        creatorId: task.createdBy,
        assigneeId: task.assignedTo,
      },
      'Access Denied: You are not authorized to access or modify this task'
    );

    // Attach task to request for downstream controller usage
    (req as any).task = task;
    next();
  }
);
