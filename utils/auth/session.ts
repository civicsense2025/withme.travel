import { Session } from '@supabase/supabase-js';
import { AuthError, createAuthError } from './errors';

// Constants for session management
const SESSION_STORAGE_KEY = 'auth_session';
const SESSION_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds
const REFRESH_RETRY_DELAY = 1000; // 1 second
const MAX_REFRESH_RETRIES = 3;

// Interface for encrypted session data
interface EncryptedSession {
  iv: string;
  data: string;
}

// Helper to encrypt session data
function encryptSession(session: Session): EncryptedSession {
  // In a real implementation, use a proper encryption library
  // This is just a placeholder to show the concept
  const data = JSON.stringify(session);
  return {
    iv: 'initialization-vector',
    data: btoa(data),
  };
}

// Helper to decrypt session data
function decryptSession(encrypted: EncryptedSession): Session | null {
  try {
    // In a real implementation, use a proper encryption library
    // This is just a placeholder to show the concept
    const data = atob(encrypted.data);
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}

// Save session to storage with encryption
export function saveSession(session: Session | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    const encrypted = encryptSession(session);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

// Load session from storage with decryption
export function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const encrypted = JSON.parse(stored) as EncryptedSession;
    return decryptSession(encrypted);
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

// Check if session needs refresh
export function needsRefresh(session: Session | null): boolean {
  if (!session?.expires_at) return false;

  const expiresAt = new Date(session.expires_at * 1000);
  const now = new Date();
  return expiresAt.getTime() - now.getTime() < SESSION_EXPIRY_BUFFER;
}

// Retry session refresh with exponential backoff
export async function retrySessionRefresh(
  refreshFn: () => Promise<Session | null>,
  maxRetries: number = MAX_REFRESH_RETRIES
): Promise<Session | null> {
  let lastError: Error | null = null;
  let delay = REFRESH_RETRY_DELAY;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const session = await refreshFn();
      if (session) {
        return session;
      }
    } catch (error) {
      console.error(`Session refresh attempt ${attempt + 1} failed:`, error);
      lastError = error as Error;

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error('Failed to refresh session after multiple attempts: ' + lastError?.message);
}

// Keep session alive by refreshing before expiry
export function keepSessionAlive(
  session: Session | null,
  refreshFn: () => Promise<Session | null>
): () => void {
  if (!session?.expires_at) return () => {};

  const expiresAt = new Date(session.expires_at * 1000);
  const timeUntilExpiry = expiresAt.getTime() - Date.now();
  const refreshTime = Math.max(1000, timeUntilExpiry - SESSION_EXPIRY_BUFFER);

  const timeoutId = setTimeout(async () => {
    try {
      const newSession = await retrySessionRefresh(refreshFn);
      if (newSession) {
        saveSession(newSession);
        // Set up next refresh
        keepSessionAlive(newSession, refreshFn);
      }
    } catch (error) {
      console.error('Failed to keep session alive:', error);
    }
  }, refreshTime);

  // Return cleanup function
  return () => clearTimeout(timeoutId);
}

// Validate session integrity
export function validateSession(session: Session | null): AuthError | null {
  if (!session) return null;

  // Check for required fields
  if (!session.access_token || !session.refresh_token) {
    return createAuthError({
      code: 'auth/invalid-session',
      message: 'Session is missing required tokens'
    });
  }

  // Check expiry
  if (!session.expires_at) {
    return createAuthError({
      code: 'auth/invalid-session',
      message: 'Session is missing expiry time'
    });
  }

  const expiresAt = new Date(session.expires_at * 1000);
  if (expiresAt < new Date()) {
    return createAuthError({
      code: 'auth/session-expired',
      message: 'Session has expired'
    });
  }

  // Check user data
  if (!session.user?.id) {
    return createAuthError({
      code: 'auth/invalid-session',
      message: 'Session is missing user data'
    });
  }

  return null;
}