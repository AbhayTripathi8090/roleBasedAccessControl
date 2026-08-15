import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(404, `Route Not Found - ${req.originalUrl}`);
  next(error);
};
