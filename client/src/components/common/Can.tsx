'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionAction } from '@/lib/permissions';
import { UserRole, Project, Task } from '@/types';

interface CanProps {
  action?: PermissionAction;
  role?: UserRole | UserRole[];
  resource?: Project | Task | any;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditional UI rendering component based on user permissions or roles
 *
 * Example usage:
 * <Can action="manage_users">
 *   <Button>Add New User</Button>
 * </Can>
 *
 * <Can role={[UserRole.ADMIN, UserRole.MANAGER]}>
 *   <CreateProjectModal />
 * </Can>
 */
export function Can({ action, role, resource, fallback = null, children }: CanProps) {
  const { hasRole, can } = usePermissions();

  let isAllowed = true;

  if (role) {
    const rolesArray = Array.isArray(role) ? role : [role];
    isAllowed = isAllowed && hasRole(...rolesArray);
  }

  if (action) {
    isAllowed = isAllowed && can(action, resource);
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
