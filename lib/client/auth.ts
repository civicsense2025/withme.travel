/**
 * Authentication Client Module
 * 
 * Client-side functions for authentication, including login, logout, signup,
 * password reset, etc.
 */

import { Result, tryCatch } from '@/utils/result';
import {
  ForgotPasswordParams,
  LoginParams,
  ResetPasswordParams,
  SignupParams
} from '@/lib/api/auth';

// ============================================================================
// TYPES
// ============================================================================

export type { ForgotPasswordParams, LoginParams, ResetPasswordParams, SignupParams };

// ============================================================================
// CLIENT FUNCTIONS
// ============================================================================

/**
 * Request a password reset email
 */
export async function forgotPassword(params: ForgotPasswordParams): Promise<Result<void>> {
  return tryCatch(
    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send password reset email');
      }
      return undefined;
    })
  );
}

/**
 * Reset password using the token from the reset email
 */
export async function resetPassword(params: ResetPasswordParams): Promise<Result<void>> {
  return tryCatch(
    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }
      return undefined;
    })
  );
}

/**
 * Login with email and password
 */
export async function login(params: LoginParams): Promise<Result<any>> {
  return tryCatch(
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      return response.json();
    })
  );
}

/**
 * Logout the current user
 */
export async function logout(): Promise<Result<void>> {
  return tryCatch(
    fetch('/api/auth/logout', {
      method: 'POST',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
      return undefined;
    })
  );
}

/**
 * Register a new user
 */
export async function signup(params: SignupParams): Promise<Result<any>> {
  return tryCatch(
    fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }
      return response.json();
    })
  );
}

/**
 * Get the current user profile
 */
export async function getProfile(): Promise<Result<any>> {
  return tryCatch(
    fetch('/api/auth/me').then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get user profile');
      }
      return response.json();
    })
  );
}

/**
 * Check authentication status
 */
export async function checkAuthStatus(): Promise<Result<{ authenticated: boolean; user: any }>> {
  return tryCatch(
    fetch('/api/auth/status').then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check auth status');
      }
      return response.json();
    })
  );
}

/**
 * Type guard to check if an object is an AuthResult
 */
export function isAuthResult(obj: any): obj is AuthResult<any> {
  return obj && typeof obj.success === 'boolean' && (obj.success ? 'data' in obj : 'error' in obj);
} 