import { Context } from 'hono';
import { ApiError } from '../types';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorResponse(c: Context, error: AppError | Error, statusCode?: number): Response {
  if (error instanceof AppError) {
    const response: ApiError = {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
    return c.json(response, error.statusCode);
  }

  // Generic error
  const response: ApiError = {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
    },
  };
  return c.json(response, statusCode || 500);
}

export function successResponse<T>(c: Context, data: T, statusCode: number = 200): Response {
  return c.json({ ok: true, data }, statusCode);
}

// Common errors
export const errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Authentication required', 401),
  forbidden: () => new AppError('FORBIDDEN', 'Access denied', 403),
  notFound: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`, 404),
  badRequest: (message: string) => new AppError('BAD_REQUEST', message, 400),
  conflict: (message: string) => new AppError('CONFLICT', message, 409),
  dailyLimit: (message: string) => new AppError('DAILY_LIMIT_EXCEEDED', message, 429),
  insufficientFunds: (currency: string) => new AppError('INSUFFICIENT_FUNDS', `Not enough ${currency}`, 400),
};
