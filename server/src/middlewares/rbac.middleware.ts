import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../modules/users/user.types';
import { ApiError } from '../utils/ApiError';

/**
 * Reusable Role-Based Access Control (RBAC) Authorization Middleware
 *
 * @param allowedRoles - List of UserRole values permitted to access the route
 * @returns Express middleware function
 *
 * Example usage in routes:
 * router.delete('/users/:id', authenticate, authorizeRoles(UserRole.ADMIN), userController.deleteUser);
 * router.post('/projects', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), projectController.createProject);
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Verify user is authenticated
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before authorization'));
    }

    // 2. Check if user's role is in permitted roles list
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        new ApiError(
          403,
          `Access Denied: Role '${req.user.role}' does not have permission to access this resource`
        )
      );
    }

    // 3. User is authorized, proceed to controller
    next();
  };
};
