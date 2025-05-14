/**
 * Utilities for sanitizing user input to prevent XSS and injection attacks
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML/script content
 * and encoding special characters
 *
 * @param input - The string to be sanitized
 * @returns A sanitized version of the input string
 */
export function sanitizeString(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }

  // Convert to string in case a number or other type is passed
  const str = String(input);

  return (
    str
      // Replace HTML special chars with entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      // Remove potential script injections
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      // Normalize whitespace
      .trim()
  );
}

/**
 * Sanitize an email address
 *
 * @param email - The email to sanitize
 * @returns A sanitized email string or empty string if invalid
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }

  // Convert to lowercase
  return email.toLowerCase().trim();
}

/**
 * Sanitize an object by sanitizing all string properties
 *
 * @param obj - The object to sanitize
 * @returns A new object with all string properties sanitized
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return {} as T;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        result[key] = sanitizeString(value);
      } else if (value === null || value === undefined) {
        result[key] = value;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        result[key] = value.map((item: any) =>
          typeof item === 'string'
            ? sanitizeString(item)
            : typeof item === 'object' && item !== null
              ? sanitizeObject(item)
              : item
        );
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

/**
 * Validates and sanitizes auth credentials
 *
 * @param credentials - Object containing credentials like email and password
 * @returns Sanitized credentials object
 */
export function sanitizeAuthCredentials(credentials: {
  email?: string | null;
  password?: string | null;
  username?: string | null;
  [key: string]: any;
}): {
  email: string;
  password: string;
  username?: string;
  [key: string]: any;
} {
  const result: Record<string, any> = {};

  // Sanitize email
  result.email = credentials.email ? sanitizeEmail(credentials.email) : '';

  // Pass through password (don't modify it, as it would change the value)
  // but ensure it's a string
  result.password = credentials.password ? String(credentials.password) : '';

  // Sanitize username if present
  if (credentials.username) {
    result.username = sanitizeString(credentials.username);
  }

  // Sanitize any other properties
  for (const key in credentials) {
    if (key !== 'email' && key !== 'password' && key !== 'username') {
      const value = credentials[key];
      if (typeof value === 'string') {
        result[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result as {
    email: string;
    password: string;
    username?: string;
    [key: string]: any;
  };
}
