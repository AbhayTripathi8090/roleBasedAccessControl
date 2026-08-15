import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { userService } from './user.service';
import { getUsersQuerySchema, updateUserProfileSchema, updateUserRoleSchema } from './user.validation';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getUsersQuerySchema.parse(req.query);
  const result = await userService.getUsers(validatedQuery);
  res.status(200).json(new ApiResponse(200, result, 'Users list fetched successfully'));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, { user }, 'User details fetched successfully'));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = updateUserProfileSchema.parse(req.body);
  const user = await userService.updateUser(
    req.params.id,
    req.user!._id.toString(),
    req.user!.role,
    validatedInput
  );
  res.status(200).json(new ApiResponse(200, { user }, 'User profile updated successfully'));
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = updateUserRoleSchema.parse(req.body);
  const user = await userService.updateUserRole(
    req.params.id,
    validatedInput,
    req.user!._id.toString()
  );
  res.status(200).json(new ApiResponse(200, { user }, 'User role updated successfully'));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id, req.user!._id.toString());
  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});
