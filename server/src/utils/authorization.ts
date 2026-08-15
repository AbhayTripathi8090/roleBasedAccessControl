import { Types } from 'mongoose';
import { IUserDocument, UserRole } from '../modules/users/user.types';
import { ApiError } from './ApiError';

export interface ResourceOwnership {
  ownerId?: string | Types.ObjectId | null;
  creatorId?: string | Types.ObjectId | null;
  assigneeId?: string | Types.ObjectId | null;
  memberIds?: Array<string | Types.ObjectId> | null;
}

/**
 * Helper to safely convert Mongoose ObjectId or string to string
 */
export const toIdString = (id?: string | Types.ObjectId | null): string => {
  if (!id) return '';
  return id.toString();
};

/**
 * Check if a user possesses permission for a target resource based on role & ownership
 *
 * Permission Matrix:
 * - ADMIN: Unrestricted global access to all resources.
 * - MANAGER: Access permitted if user is owner, creator, or member of the project/resource.
 * - USER: Access permitted if user is assignee or creator of the task/resource.
 */
export const canAccessResource = (
  user: IUserDocument,
  resource: ResourceOwnership
): boolean => {
  if (!user) return false;

  const currentUserId = toIdString(user._id || (user as any).id);

  // 1. ADMIN bypasses all ownership restrictions
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  const isOwner = toIdString(resource.ownerId) === currentUserId;
  const isCreator = toIdString(resource.creatorId) === currentUserId;
  const isAssignee = toIdString(resource.assigneeId) === currentUserId;
  const isMember = Boolean(
    resource.memberIds &&
      resource.memberIds.some((m) => toIdString(m) === currentUserId)
  );

  // 2. MANAGER permission checks
  if (user.role === UserRole.MANAGER) {
    return isOwner || isCreator || isMember;
  }

  // 3. USER permission checks
  if (user.role === UserRole.USER) {
    return isAssignee || isCreator;
  }

  return false;
};

/**
 * Enforces resource permission assertion. Throws 403 Forbidden ApiError if authorization fails.
 */
export const verifyResourceAccess = (
  user: IUserDocument,
  resource: ResourceOwnership,
  errorMessage: string = 'Access Denied: You do not have permission to manage this resource'
): void => {
  if (!canAccessResource(user, resource)) {
    throw new ApiError(403, errorMessage);
  }
};
