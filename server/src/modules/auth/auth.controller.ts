import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.validation';
import { generateToken, sendTokenCookie, clearTokenCookie } from './auth.utils';
import { auditLogService } from '../audit-logs/auditLog.service';
import { AuditAction } from '../audit-logs/auditLog.types';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = registerSchema.parse(req.body);
  const user = await authService.register(validatedInput);

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  sendTokenCookie(res, token);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      'User registered successfully'
    )
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = loginSchema.parse(req.body);
  const user = await authService.login(validatedInput);

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  sendTokenCookie(res, token);

  // Record LOGIN audit log
  await auditLogService.logAction({
    userId: user._id,
    action: AuditAction.LOGIN,
    resource: 'User',
    resourceId: user._id,
    metadata: { email: user.email },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      'Login successful'
    )
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearTokenCookie(res);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      'Current user profile fetched successfully'
    )
  );
});
