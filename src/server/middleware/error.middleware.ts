import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES } from '@shared/schemas';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factories
export const NotFoundError = (resource: string) =>
  new AppError(`${resource} not found`, 404, ERROR_CODES.NOT_FOUND);

export const UnauthorizedError = (message = 'Unauthorized') =>
  new AppError(message, 401, ERROR_CODES.UNAUTHORIZED);

export const ForbiddenError = (message = 'Forbidden') =>
  new AppError(message, 403, ERROR_CODES.FORBIDDEN);

export const ValidationError = (message: string, details?: Record<string, string>) =>
  new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR, details);

export const ConflictError = (message: string) =>
  new AppError(message, 409, ERROR_CODES.CONFLICT);

// Error handler middleware
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Unknown error
  res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    },
  });
}

// Async handler wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
