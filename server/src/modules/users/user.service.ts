import { isValidObjectId } from 'mongoose';
import { UserModel } from './user.model';
import { IUserDocument, UserRole } from './user.types';
import { GetUsersQueryInput, UpdateUserProfileInput, UpdateUserRoleInput } from './user.validation';
import { ApiError } from '../../utils/ApiError';
import { auditLogService } from '../audit-logs/auditLog.service';
import { AuditAction } from '../audit-logs/auditLog.types';

/**
 * Escapes regex special characters to prevent ReDoS / Regex Injection
 */
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export class UserService {
  /**
   * Get paginated users list with search & role filtering
   */
  async getUsers(query: GetUsersQueryInput) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.search) {
      const sanitizedSearch = escapeRegex(query.search);
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    if (query.role) {
      filter.role = query.role;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
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
   * Get user details by ID
   */
  async getUserById(id: string): Promise<IUserDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(400, 'Invalid User ID format');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update user profile (Self-update or Admin update)
   */
  async updateUser(
    targetUserId: string,
    currentUserId: string,
    currentUserRole: UserRole,
    input: UpdateUserProfileInput
  ): Promise<IUserDocument> {
    if (!isValidObjectId(targetUserId)) {
      throw new ApiError(400, 'Invalid User ID format');
    }

    if (currentUserRole !== UserRole.ADMIN && targetUserId !== currentUserId) {
      throw new ApiError(403, 'Access Denied: You can only update your own user profile');
    }

    const user = await UserModel.findById(targetUserId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.avatar !== undefined) user.avatar = input.avatar;

    if (input.isActive !== undefined && currentUserRole === UserRole.ADMIN) {
      user.isActive = input.isActive;
    }

    await user.save();

    // Record UPDATE_USER audit log
    await auditLogService.logAction({
      userId: currentUserId,
      action: AuditAction.UPDATE_USER,
      resource: 'User',
      resourceId: user._id,
      metadata: { targetUserId, updatedFields: Object.keys(input) },
    });

    return user;
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(targetUserId: string, input: UpdateUserRoleInput, currentUserId: string): Promise<IUserDocument> {
    if (!isValidObjectId(targetUserId)) {
      throw new ApiError(400, 'Invalid User ID format');
    }

    const user = await UserModel.findById(targetUserId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const oldRole = user.role;
    user.role = input.role;
    await user.save();

    // Record CHANGE_ROLE audit log
    await auditLogService.logAction({
      userId: currentUserId,
      action: AuditAction.CHANGE_ROLE,
      resource: 'User',
      resourceId: user._id,
      metadata: { targetUserId, oldRole, newRole: input.role },
    });

    return user;
  }

  /**
   * Delete user by ID (Admin only)
   */
  async deleteUser(targetUserId: string, currentUserId: string): Promise<void> {
    if (!isValidObjectId(targetUserId)) {
      throw new ApiError(400, 'Invalid User ID format');
    }

    if (targetUserId === currentUserId) {
      throw new ApiError(400, 'Security Restriction: You cannot delete your own admin account');
    }

    const user = await UserModel.findByIdAndDelete(targetUserId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Record DELETE_USER audit log
    await auditLogService.logAction({
      userId: currentUserId,
      action: AuditAction.DELETE_USER,
      resource: 'User',
      resourceId: targetUserId,
      metadata: { deletedEmail: user.email },
    });
  }
}

export const userService = new UserService();
