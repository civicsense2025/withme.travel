import { NextResponse } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js';

// Define common HTTP status codes for readability
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  } as const;

// Type for API error response
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  status: number;
}

// Type for API success response with data
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

/**
 * Creates a standardized error response
 *
 * @param message Error message to return to the client
 * @param status HTTP status code
 * @param details Additional error details (not exposed in production)
 * @param code Optional error code for client handling
 * @returns NextResponse with consistent error format
 */
export function createErrorResponse(
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
  details?: unknown,
  code?: string
): NextResponse<ApiErrorResponse> {
  // Log errors for server-side debugging
  console.error(`[API Error] [${status}] ${message}`, {
    code,
    details,
    // Add timestamp for easier log correlation
    timestamp: new Date().toISOString(),
  });

  // Create the error response with consistent structure
  const errorResponse: ApiErrorResponse = {
    error: message,
    status,
  };

  // Only include code and details if provided
  if (code) {
    errorResponse.code = code;
  }

  // Only include details in development
  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.details = details;
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Creates a standardized success response
 *
 * @param data Response data to return to the client
 * @param status HTTP status code
 * @param message Optional success message
 * @returns NextResponse with consistent success format
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = HTTP_STATUS.OK,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = { data };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handle Supabase PostgrestError with appropriate status codes
 *
 * @param error Supabase PostgrestError
 * @param defaultMessage Default message to use if error doesn't have one
 * @returns NextResponse with consistent error format
 */
export function handleSupabaseError(
  error: PostgrestError,
  defaultMessage: string = 'Database operation failed'
): NextResponse<ApiErrorResponse> {
  // Determine appropriate status code based on Supabase error code
  let status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = error.message || defaultMessage;

  // Map specific Supabase error codes to HTTP status codes
  // See: https://supabase.com/docs/reference/javascript/stream
  switch (error.code) {
    case '23505': // unique_violation
      status = HTTP_STATUS.CONFLICT;
      message = 'A record with this information already exists';
      break;
    case '23503': // foreign_key_violation
      status = HTTP_STATUS.BAD_REQUEST;
      message = 'Referenced record does not exist';
      break;
    case '42703': // undefined_column
    case '42P01': // undefined_table
      status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      message = 'Database schema error';
      break;
    case '28000': // invalid_authorization_specification
    case '28P01': // invalid_password
      status = HTTP_STATUS.UNAUTHORIZED;
      message = 'Authentication failed';
      break;
    case 'PGRST116': // Not found in postgREST
      status = HTTP_STATUS.NOT_FOUND;
      message = 'Resource not found';
      break;
    case '42501': // insufficient_privilege
      status = HTTP_STATUS.FORBIDDEN;
      message = 'You do not have permission to perform this action';
      break;
    // Add more mappings as needed
  }

  return createErrorResponse(
    message,
    status,
    {
      pgCode: error.code,
      pgMessage: error.message,
      pgDetails: error.details,
  },
    `supabase_${error.code}`
  );
}

/**
 * Handle general errors in route handlers
 *
 * @param error Any error thrown in a route handler
 * @param defaultMessage Default message to use if error doesn't have a message
 * @returns NextResponse with consistent error format
 */
export function handleRouteError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): NextResponse<ApiErrorResponse> {
  console.error('[Route Handler Error]', error);

  // Handle Supabase PostgrestError
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return handleSupabaseError(error as PostgrestError, defaultMessage);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return createErrorResponse(error.message || defaultMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      stack: error.stack,
  });
  }

  // Handle unknown errors
  return createErrorResponse(defaultMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
}

/**
 * Utility for handling missing parameter errors
 *
 * @param paramName Name of the missing parameter
 * @returns NextResponse with consistent error format
 */
export function createMissingParamError(paramName: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse(`Missing required parameter: ${paramName}`, HTTP_STATUS.BAD_REQUEST, {
    param: paramName,
  });
}

/**
 * Utility for creating not found responses
 *
 * @param resourceType Type of resource that wasn't found
 * @param identifier Optional identifier that was looked up
 * @returns NextResponse with consistent error format
 */
export function createNotFoundResponse(
  resourceType: string,
  identifier?: string
): NextResponse<ApiErrorResponse> {
  const message = identifier
    ? `${resourceType} not found: ${identifier}`
    : `${resourceType} not found`;

  return createErrorResponse(message, HTTP_STATUS.NOT_FOUND, { resourceType, identifier });
}

/**
 * Utility for creating unauthorized responses
 *
 * @param message Custom unauthorized message
 * @returns NextResponse with consistent error format
 */
export function createUnauthorizedResponse(
  message: string = 'You must be logged in to access this resource'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Utility for creating forbidden responses
 *
 * @param message Custom forbidden message
 * @returns NextResponse with consistent error format
 */
export function createForbiddenResponse(
  message: string = 'You do not have permission to access this resource'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, HTTP_STATUS.FORBIDDEN);
}