import { z } from 'zod';
import { UserRole } from './user.types';

export const getUsersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.string().optional(),
});

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid user role',
  }),
});

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
