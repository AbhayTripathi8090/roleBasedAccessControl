import { Router } from 'express';
import * as taskController from './task.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';
import { UserRole } from '../users/user.types';

const router = Router();

// Require authentication for all task endpoints
router.use(authenticate);

// List tasks (Scoped per user role: ADMIN = All, MANAGER = Project Tasks, USER = Assigned Tasks)
router.get('/', taskController.getTasks);

// Create task (ADMIN & MANAGER)
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), taskController.createTask);

// Get task by ID (Assignee, Creator, Manager, or Admin)
router.get('/:id', taskController.getTaskById);

// Update task (Admin/Manager = Full Update, USER = Assigned Task Status Only)
router.patch('/:id', taskController.updateTask);

// Delete task (ADMIN & MANAGER)
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), taskController.deleteTask);

export default router;
