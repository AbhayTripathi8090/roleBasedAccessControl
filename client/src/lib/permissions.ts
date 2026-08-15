import { User, UserRole, Project, Task } from '@/types';

export type PermissionAction =
  | 'manage_users'
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'manage_project_members'
  | 'create_task'
  | 'update_task'
  | 'update_task_status'
  | 'delete_task'
  | 'view_audit_logs';

/**
 * Check if the user possesses one of the specified roles
 */
export function hasRole(user: User | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Helper to get ID string from User object or ID string
 */
export function extractId(idOrUser?: User | string | null): string {
  if (!idOrUser) return '';
  if (typeof idOrUser === 'string') return idOrUser;
  return idOrUser.id || (idOrUser as any)._id || '';
}

/**
 * Reusable Frontend Permission Helper (`can`)
 *
 * NOTE: Frontend permissions are strictly for UX conditional rendering (hiding/showing buttons, nav items, forms).
 * Backend authorization remains mandatory for all security enforcement.
 */
export function can(
  user: User | null,
  action: PermissionAction,
  resource?: Project | Task | any
): boolean {
  if (!user) return false;

  // 1. ADMIN possesses global permission for all frontend UI actions
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  const userId = user.id;

  switch (action) {
    case 'manage_users':
    case 'view_audit_logs':
      // Handled above for Admin; Managers and Users cannot perform these actions
      return false;

    case 'create_project':
    case 'create_task':
      // Managers can create projects and tasks
      return user.role === UserRole.MANAGER;

    case 'update_project':
    case 'delete_project':
    case 'manage_project_members': {
      if (user.role === UserRole.MANAGER) {
        if (!resource) return true; // General check
        const ownerId = extractId(resource.owner);
        return ownerId === userId;
      }
      return false;
    }

    case 'update_task':
    case 'delete_task': {
      if (user.role === UserRole.MANAGER) {
        if (!resource) return true;
        const projectOwnerId = resource.project ? extractId(resource.project.owner) : '';
        const taskCreatorId = extractId(resource.createdBy);
        return projectOwnerId === userId || taskCreatorId === userId;
      }
      return false;
    }

    case 'update_task_status': {
      if (user.role === UserRole.MANAGER) return true;
      if (user.role === UserRole.USER) {
        if (!resource) return true;
        const assigneeId = extractId(resource.assignedTo);
        return assigneeId === userId;
      }
      return false;
    }

    default:
      return false;
  }
}
