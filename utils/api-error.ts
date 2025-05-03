/**
 * api-error.ts
 * Standardized error handling for API routes
 */

import { NextResponse } from 'next/server';
import { ErrorCategory, logError } from './error-logger';

// Define standard error codes
export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Map of error codes to HTTP status codes
export const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  [ApiErrorCode.BAD_REQUEST]: 400,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.VALIDATION_ERROR]: 422,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
};

// Interface for API error response
export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode | string;
    message: string;
    details?: any;
    requestId?: string;
  };
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  code: ApiErrorCode | string;
  statusCode: number;
  details?: any;
  requestId?: string;

  constructor({
    code = ApiErrorCode.INTERNAL_SERVER_ERROR,
    message,
    statusCode,
    details,
    requestId,
  }: {
    code?: ApiErrorCode | string;
    message: string;
    statusCode?: number;
    details?: any;
    requestId?: string;
  }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode || ERROR_STATUS_MAP[code as ApiErrorCode] || 500;
    this.details = details;
    this.requestId = requestId;
  }

  /**
   * Convert the error to a NextResponse object for API routes
   */
  toResponse(): NextResponse<ApiErrorResponse> {
    // Log all server errors automatically
    if (this.statusCode >= 500) {
      logError(this, ErrorCategory.API, 'server', {
        code: this.code,
        details: this.details,
        requestId: this.requestId,
  });
    }

    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
          requestId: this.requestId,
  },
      },
      { status: this.statusCode }
    );
  }

  /**
   * Create a standardized API error for invalid request data
   */
  static badRequest(message = 'Invalid request data', details?: any): ApiError {
    return new ApiError({
      code: ApiErrorCode.BAD_REQUEST,
      message,
      details,
    });
  }

  /**
   * Create a standardized API error for unauthorized access
   */
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError({
      code: ApiErrorCode.UNAUTHORIZED,
      message,
    });
  }

  /**
   * Create a standardized API error for forbidden access
   */
  static forbidden(message = 'Access forbidden'): ApiError {
    return new ApiError({
      code: ApiErrorCode.FORBIDDEN,
      message,
    });
  }

  /**
   * Create a standardized API error for not found resources
   */
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError({
      code: ApiErrorCode.NOT_FOUND,
      message,
    });
  }

  /**
   * Create a standardized API error for method not allowed
   */
  static methodNotAllowed(message = 'Method not allowed'): ApiError {
    return new ApiError({
      code: ApiErrorCode.METHOD_NOT_ALLOWED,
      message,
    });
  }

  /**
   * Create a standardized API error for validation errors
   */
  static validationError(message = 'Validation error', details?: any): ApiError {
    return new ApiError({
      code: ApiErrorCode.VALIDATION_ERROR,
      message,
      details,
    });
  }

  /**
   * Create a standardized API error for internal server errors
   */
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message,
    });
  }

  /**
   * Create a standardized API error for rate limit exceeded
   */
  static rateLimitExceeded(message = 'Rate limit exceeded'): ApiError {
    return new ApiError({
      code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
      message,
    });
  }
}

/**
 * Wrapper function to handle API errors in route handlers
 * @param handler The API route handler function
 */
export function withErrorHandling(
  handler: Function
): (req: Request, ...args: any[]) => Promise<Response> {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error('API error:', error);

      // If it's already an ApiError, use it directly
      if (error instanceof ApiError) {
        return error.toResponse();
      }

      // For database-related errors, create a more friendly message
      if (error.code === 'P2025') {
        // Prisma "Record not found" error
        return new ApiError({
          code: ApiErrorCode.NOT_FOUND,
          message: 'The requested resource was not found'
        }).toResponse();
      }

      // For other types of errors, return a generic error
      const apiError = new ApiError({
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message || 'Unknown error',
        details:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                name: error.name,
                stack: error.stack,
  },
      });

      return apiError.toResponse();
    }
  };
}

/**
 * Wrapper for an entire API router with error handling
 * @param handlers Object containing HTTP method handlers
 */
export function createApiRouter(handlers: Record<string, Function>) {
  return async (req: Request, ...args: any[]): Promise<Response> => {
    const method = req.method.toUpperCase();
    const handler = handlers[method];

    if (!handler) {
      return new ApiError({
        code: ApiErrorCode.METHOD_NOT_ALLOWED,
        message: `Method ${method} not allowed`,
      }).toResponse();
    }

    return withErrorHandling(handler)(req, ...args);
  };
}