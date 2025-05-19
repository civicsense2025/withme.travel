/**
 * Authentication API Module
 * 
 * Functions for interacting with authentication-related endpoints
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { Result, ok, err } from '@/utils/result';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Generic AuthResult type for all auth operations
 */
export type AuthResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Type guard to check if a result is successful
 */
export function isAuthSuccess<T>(result: AuthResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a result is a failure
 */
export function isAuthFailure<T>(result: AuthResult<T>): result is { success: false; error: string } {
  return result.success === false;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/**
 * Validate password strength (min 8 chars, at least 1 number)
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

// Add index signature to params interfaces for extensibility
export interface ForgotPasswordParams {
  email: string;
  [key: string]: any;
}
export interface ResetPasswordParams {
  password: string;
  token: string;
  [key: string]: any;
}
export interface LoginParams {
  email: string;
  password: string;
  [key: string]: any;
}
export interface SignupParams {
  email: string;
  password: string;
  name?: string;
  [key: string]: any;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Send password reset email
 */
export async function forgotPassword(
  params: ForgotPasswordParams
): Promise<Result<void>> {
  const supabase = await createServerComponentClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });
    
    if (error) {
      return err(error);
    }
    
    return ok(undefined);
  } catch (error) {
    console.error('[AUTH API] forgotPassword error:', error);
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Reset password using token
 */
export async function resetPassword(
  params: ResetPasswordParams
): Promise<Result<void>> {
  const supabase = await createServerComponentClient();
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: params.password,
    });
    
    if (error) {
      return err(error);
    }
    
    return ok(undefined);
  } catch (error) {
    console.error('[AUTH API] resetPassword error:', error);
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Login user with email and password
 */
export async function login(
  params: LoginParams
): Promise<Result<void>> {
  const supabase = await createServerComponentClient();
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });
    
    if (error) {
      return err(error);
    }
    
    return ok(undefined);
  } catch (error) {
    console.error('[AUTH API] login error:', error);
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<Result<void>> {
  const supabase = await createServerComponentClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return err(error);
    }
    
    return ok(undefined);
  } catch (error) {
    console.error('[AUTH API] logout error:', error);
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Register a new user
 */
export async function signup(
  params: SignupParams
): Promise<Result<void>> {
  const supabase = await createServerComponentClient();
  
  try {
    const { error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.name || '',
        },
      },
    });
    
    if (error) {
      return err(error);
    }
    
    return ok(undefined);
  } catch (error) {
    console.error('[AUTH API] signup error:', error);
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<Result<any>> {
  const supabase = await createServerComponentClient();
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      return err(error);
    }
    
    return ok(data.user);
  } catch (error) {
    console.error('[AUTH API] getProfile error:', error);
    return err(error instanceof Error ? error : new Error(String(error)));
  }
} 