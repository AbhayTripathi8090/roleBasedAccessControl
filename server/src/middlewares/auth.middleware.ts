import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken, COOKIE_NAME } from '../modules/auth/auth.utils';
import { UserModel } from '../modules/users/user.model';
import { asyncHandler } from './asyncHandler';

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined = req.cookies?.[COOKIE_NAME];

    // Fallback check for Authorization header: Bearer <token>
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token is required');
    }

    try {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        throw new ApiError(401, 'User associated with this token no longer exists');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'User account is deactivated');
      }

      req.user = user;
      next();
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, 'Invalid or expired authentication token');
    }
  }
);
