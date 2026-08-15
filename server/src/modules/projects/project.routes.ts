import { Router } from 'express';
import * as projectController from './project.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';
import { UserRole } from '../users/user.types';

const router = Router();

// Require authentication for all project endpoints
router.use(authenticate);

// Get Projects (Scoped by User Role: ADMIN = All, MANAGER = Owned/Member, USER = Member)
router.get('/', projectController.getProjects);

// Create Project (ADMIN & MANAGER)
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), projectController.createProject);

// Get Single Project Details (Owner, Member, or Admin)
router.get('/:id', projectController.getProjectById);

// Update Project Details (Project Owner or Admin)
router.patch('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), projectController.updateProject);

// Delete Project (Project Owner or Admin)
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), projectController.deleteProject);

// Project Member Management APIs (Project Owner or Admin)
router.post('/:id/members', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), projectController.addMember);
router.delete('/:id/members/:userId', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), projectController.removeMember);

export default router;
