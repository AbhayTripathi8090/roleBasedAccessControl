import { useAppSelector } from './redux.hooks';
import { selectCurrentUser } from '@/features/auth/authSelectors';
import { hasRole as checkHasRole, can as checkCan, PermissionAction } from '@/lib/permissions';
import { UserRole, Project, Task } from '@/types';

/**
 * Custom React Hook for Frontend Permission & Role Evaluation
 *
 * Example usage:
 * const { user, hasRole, can } = usePermissions();
 * if (can('manage_users')) { ... }
 */
export function usePermissions() {
  const user = useAppSelector(selectCurrentUser);

  const hasRole = (...roles: UserRole[]): boolean => {
    return checkHasRole(user, ...roles);
  };

  const can = (action: PermissionAction, resource?: Project | Task | any): boolean => {
    return checkCan(user, action, resource);
  };

  return {
    user,
    userRole: user?.role,
    hasRole,
    can,
  };
}
