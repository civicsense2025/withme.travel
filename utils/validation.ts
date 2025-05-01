/**
 * Input validation utilities using Zod
 */
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
});

// Password reset validation schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  token: z.string().min(1, 'Reset token is required'),
});

/**
 * Validates a request body against a schema
 *
 * @param schema - Zod schema to validate against
 * @param body - The request body to validate
 * @returns An object with success/error information
 */
export function validateRequestBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: { message: string; issues: z.ZodIssue[] } } {
  try {
    const result = schema.parse(body);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: error.issues.map((issue) => issue.message).join(', '),
          issues: error.issues,
        },
      };
    }

    // For non-Zod errors, return a generic error message
    return {
      success: false,
      error: {
        message: 'Invalid request data',
        issues: [],
      },
    };
  }
}

/**
 * Express-like middleware for validating request bodies in route handlers
 *
 * @param schema - Zod schema to validate against
 * @param handler - Route handler function to call if validation passes
 * @returns A wrapped route handler function
 */
export function validateRequestMiddleware<T extends z.ZodTypeAny>(
  schema: T,
  handler: (req: Request, data: z.infer<T>) => Promise<Response> | Response
) {
  return async (req: Request): Promise<Response> => {
    // Only validate POST, PUT, PATCH requests with bodies
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      try {
        const body = await req.json();
        const validation = validateRequestBody(schema, body);

        if (!validation.success) {
          return NextResponse.json(
            {
              error: validation.error.message,
              issues: validation.error.issues,
            },
            { status: 400 }
          );
        }

        // Pass validated data to handler
        return handler(req, validation.data);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    // For methods without body, just pass through
    return handler(req, {} as z.infer<T>);
  };
}
