/**
 * Validation utilities using Zod for runtime type checking
 */
import { z } from 'zod';

/**
 * Options for fetch with validation
 */
export interface FetchWithValidationOptions extends RequestInit {
  /**
   * If true, will throw an error if validation fails
   * If false, will return null if validation fails (default)
   */
  throwOnError?: boolean;
}

/**
 * Fetches data and validates it against a Zod schema
 *
 * @example
 * const UserSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 *
 * type User = z.infer<typeof UserSchema>;
 *
 * // Usage
 * const user = await fetchWithValidation('/api/user/123', UserSchema);
 */
export async function fetchWithValidation<T>(
  url: string,
  schema: z.ZodType<T>,
  options?: FetchWithValidationOptions
): Promise<T | null> {
  const { throwOnError = false, ...fetchOptions } = options || {};

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error('Validation error:', result.error.format());

      if (throwOnError) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }

      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching or validating data:', error);

    if (throwOnError) {
      throw error;
    }

    return null;
  }
}

/**
 * Parses data from any source using a Zod schema
 *
 * @example
 * const FormSchema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email(),
 *   age: z.number().min(18)
 * });
 *
 * // Usage
 * const formData = { name: 'John', email: 'john@example.com', age: 25 };
 * const validData = validateData(formData, FormSchema);
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodType<T>,
  options?: { throwOnError?: boolean }
): T | null {
  const { throwOnError = false } = options || {};
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error('Validation error:', result.error.format());

    if (throwOnError) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return null;
  }

  return result.data;
}

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
