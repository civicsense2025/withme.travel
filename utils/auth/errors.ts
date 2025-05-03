import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';

// Error codes for authentication-related errors
export type AuthErrorCode =
  | 'auth/unknown'
  | 'auth/user-not-found'
  | 'auth/invalid-credentials'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/email-already-in-use'
  | 'auth/operation-not-allowed'
  | 'auth/weak-password'
  | 'auth/expired-action-code'
  | 'auth/invalid-action-code'
  | 'auth/invalid-verification-code'
  | 'auth/missing-verification-code'
  | 'auth/email-already-exists'
  | 'auth/invalid-password'
  | 'auth/user-mismatch'
  | 'auth/credential-already-in-use'
  | 'auth/requires-recent-login'
  | 'auth/provider-already-linked'
  | 'auth/invalid-credential'
  | 'auth/invalid-verification-id'
  | 'auth/captcha-check-failed'
  | 'auth/invalid-phone-number'
  | 'auth/missing-phone-number'
  | 'auth/quota-exceeded'
  | 'auth/session-expired'
  | 'auth/rejected-credential'
  | 'auth/invalid-code'
  | 'auth/invalid-session-info'
  | 'auth/missing-verification-id'
  | 'auth/invalid-tenant-id'
  | 'auth/missing-tenant-id'
  | 'auth/invalid-continue-uri'
  | 'auth/missing-continue-uri'
  | 'auth/invalid-dynamic-link-domain'
  | 'auth/invalid-oauth-client-id'
  | 'auth/invalid-oauth-provider'
  | 'auth/invalid-provider-id'
  | 'auth/missing-provider-id'
  | 'auth/invalid-saml-provider'
  | 'auth/missing-saml-provider'
  | 'auth/invalid-idp-response'
  | 'auth/missing-idp-response'
  | 'auth/invalid-id-token'
  | 'auth/missing-id-token'
  | 'auth/network-request-failed'
  | 'auth/expired-session'
  | 'auth/invalid-session'
  | 'auth/user-token-expired'
  | 'auth/invalid-refresh-token'
  | 'SUPABASE_NOT_INITIALIZED'
  | 'PROFILE_FETCH_ERROR'
  | 'PROFILE_NOT_FOUND';

// Interface for enhanced error details
export interface AuthErrorDetails {
  code: AuthErrorCode;
  message: string;
  originalError?: unknown;
  status?: number;
}

// Base class for authentication errors
export class AuthError extends Error {
  public readonly code: AuthErrorCode;
  public readonly status: number;
  public readonly originalError?: unknown;
  public readonly name: string = 'AuthError';

  constructor(message: string, errorDetails?: Partial<AuthErrorDetails>) {
    super(message);
    this.code = errorDetails?.code || 'auth/unknown';
    this.status = errorDetails?.status || 400;
    this.originalError = errorDetails?.originalError;
  }

  static fromSupabaseError(error: SupabaseAuthError): AuthError {
    return new AuthError(error.message, {
      code: 'auth/unknown',
      message: error.message,
      originalError: {
        status: error.status,
        name: error.name,
        code: error.code,
  },
    });
  }

  static fromError(error: Error): AuthError {
    return new AuthError(error.message, {
      code: 'auth/unknown',
      message: error.message,
  });
  }
}

/**
 * Creates a strongly typed authentication error
 */
export function createAuthError(errorDetails: AuthErrorDetails): AuthError {
  return new AuthError(errorDetails.message, errorDetails);
}

/**
 * Type guard to check if an error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Gets a user-friendly error message based on the error code
 */
export function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<AuthErrorCode, string> = {
    'auth/unknown': 'An unknown error occurred',
    'auth/user-not-found': 'User not found',
    'auth/invalid-credentials': 'Invalid email or password',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/email-already-in-use': 'This email is already in use',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak',
    'auth/expired-action-code': 'This action code has expired',
    'auth/invalid-action-code': 'Invalid action code',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/missing-verification-code': 'Missing verification code',
    'auth/email-already-exists': 'Email already exists',
    'auth/invalid-password': 'Invalid password',
    'auth/user-mismatch': 'User mismatch',
    'auth/credential-already-in-use': 'Credential already in use',
    'auth/requires-recent-login': 'Please log in again to complete this action',
    'auth/provider-already-linked': 'Provider already linked',
    'auth/invalid-credential': 'Invalid credential',
    'auth/invalid-verification-id': 'Invalid verification ID',
    'auth/captcha-check-failed': 'Captcha check failed',
    'auth/invalid-phone-number': 'Invalid phone number',
    'auth/missing-phone-number': 'Missing phone number',
    'auth/quota-exceeded': 'Quota exceeded',
    'auth/session-expired': 'Session has expired',
    'auth/rejected-credential': 'Credential rejected',
    'auth/invalid-code': 'Invalid code',
    'auth/invalid-session-info': 'Invalid session information',
    'auth/missing-verification-id': 'Missing verification ID',
    'auth/invalid-tenant-id': 'Invalid tenant ID',
    'auth/missing-tenant-id': 'Missing tenant ID',
    'auth/invalid-continue-uri': 'Invalid continue URI',
    'auth/missing-continue-uri': 'Missing continue URI',
    'auth/invalid-dynamic-link-domain': 'Invalid dynamic link domain',
    'auth/invalid-oauth-client-id': 'Invalid OAuth client ID',
    'auth/invalid-oauth-provider': 'Invalid OAuth provider',
    'auth/invalid-provider-id': 'Invalid provider ID',
    'auth/missing-provider-id': 'Missing provider ID',
    'auth/invalid-saml-provider': 'Invalid SAML provider',
    'auth/missing-saml-provider': 'Missing SAML provider',
    'auth/invalid-idp-response': 'Invalid IDP response',
    'auth/missing-idp-response': 'Missing IDP response',
    'auth/invalid-id-token': 'Invalid ID token',
    'auth/missing-id-token': 'Missing ID token',
    'auth/network-request-failed': 'Network request failed',
    'auth/expired-session': 'Your session has expired. Please sign in again.',
    'auth/invalid-session': 'Invalid session. Please sign in again.',
    'auth/user-token-expired': 'Your session has expired. Please sign in again.',
    'auth/invalid-refresh-token': 'Unable to refresh your session. Please sign in again.',
    SUPABASE_NOT_INITIALIZED: 'Authentication service not initialized',
    PROFILE_FETCH_ERROR: 'Failed to fetch user profile',
    PROFILE_NOT_FOUND: 'User profile not found',
  };

  return errorMessages[error.code] || error.message;
}

/**
 * Gets a user-friendly error message - alias for getAuthErrorMessage
 * @param error The AuthError to get a friendly message for
 * @returns A user-friendly error message
 */
export function getFriendlyErrorMessage(error: AuthError): string {
  return getAuthErrorMessage(error);
}

/**
 * Handles an error by returning a strongly typed AuthError
 */
export function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }
  if (error instanceof SupabaseAuthError) {
    return AuthError.fromSupabaseError(error);
  }
  if (error instanceof Error) {
    return AuthError.fromError(error);
  }
  return new AuthError('An unknown error occurred', {
    code: 'auth/unknown',
    message: 'An unknown error occurred'
  });
}

/**
 * Creates a network error with appropriate details
 */
export function createNetworkError(originalError?: unknown): AuthError {
  return createAuthError({
    code: 'auth/network-request-failed',
    message: 'Network request failed',
    originalError,
  });
}

/**
 * Creates a session expired error
 */
export function createSessionExpiredError(): AuthError {
  return createAuthError({
    code: 'auth/session-expired',
    message: 'Session has expired'
  });
}

/**
 * Creates an invalid credentials error
 */
export function createInvalidCredentialsError(): AuthError {
  return createAuthError({
    code: 'auth/invalid-credential',
    message: 'Invalid credentials provided'
  });
}

/**
 * Creates a profile error with details
 */
export function createProfileError(
  details: Partial<AuthErrorDetails> & { error?: string; status?: number; statusText?: string }
): AuthError {
  return createAuthError({
    code: details.code || 'PROFILE_FETCH_ERROR',
    message: details.message || details.error || 'Failed to fetch user profile',
    originalError: details.originalError,
    status: details.status,
  });
}

/**
 * Creates a refresh token error
 */
export function createRefreshError(details?: Partial<AuthErrorDetails>): AuthError {
  return createAuthError({
    code: 'auth/invalid-refresh-token',
    message: details?.message || 'Failed to refresh token',
    originalError: details?.originalError,
    status: details?.status,
  });
}

/**
 * Handle Supabase auth errors
 */
export function handleSupabaseError(error: Error): AuthError {
  const errorDetails: AuthErrorDetails = {
    code: 'auth/unknown',
    message: error.message,
    status: 500,
    originalError: error,
  };

  return new AuthError(error.message, errorDetails);
}