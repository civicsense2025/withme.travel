import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';

/**
 * Custom API error class for structured error handling
 */
export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Format error response in a consistent way
 */
export function formatErrorResponse(error: any, defaultStatus = 500) {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details || undefined,
      },
      { status: error.status }
    );
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: defaultStatus });
  }

  // Handle string errors
  if (typeof error === 'string') {
    return NextResponse.json({ error }, { status: defaultStatus });
  }

  // Handle unknown error types
  return NextResponse.json({ error: 'An unexpected error occurred' }, { status: defaultStatus });
}

/**
 * Send a standardized error response
 */
export function errorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      error: message,
      details: details || undefined,
    },
    { status }
  );
}

/**
 * Send a standardized success response
 */
export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Validate and parse data with a schema
 */
export async function validateData<T, U = T>(
  input: T,
  schema: { parse: (data: T) => U }
): Promise<U> {
  try {
    return schema.parse(input);
  } catch (error) {
    throw new ApiError('Validation failed', 400, error);
  }
}

/**
 * Validate request data against a Zod schema.
 * @param data Data to validate
 * @param schema Zod schema to use
 * @returns Parsed data if valid
 * @throws ApiError if validation fails
 */
export function validateRequest<T>(data: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError('Invalid request data', 400, {
      issues: result.error.issues,
    });
  }
  return result.data;
}

/**
 * Type guard to check if an object is an API error
 */
export function isApiError(obj: any): obj is { error: string } {
  return obj && typeof obj.error === 'string';
}
