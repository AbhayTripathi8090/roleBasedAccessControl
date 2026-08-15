import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ZodError } from 'zod';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    if (error instanceof ZodError) {
      statusCode = 400;
      message = 'Validation Error';
      const formattedErrors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      error = new ApiError(statusCode, message, formattedErrors, error.stack);
    } else {
      error = new ApiError(statusCode, message, [], error.stack);
    }
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
