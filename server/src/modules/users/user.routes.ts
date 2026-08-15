import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';
import { UserRole } from './user.types';

const router = Router();

// Apply authentication middleware to all user management endpoints
router.use(authenticate);

// Admin-only User Management List & Search
router.get('/', authorizeRoles(UserRole.ADMIN), userController.getUsers);

// User Profile Details (Admin only)
router.get('/:id', authorizeRoles(UserRole.ADMIN), userController.getUserById);

// Update Profile (Self profile update or Admin update)
router.patch('/:id', userController.updateUser);

// Update User Role (Admin only)
router.patch('/:id/role', authorizeRoles(UserRole.ADMIN), userController.updateUserRole);

// Delete User Account (Admin only)
router.delete('/:id', authorizeRoles(UserRole.ADMIN), userController.deleteUser);

export default router;
