'use client';

/**
 * Logger utility for consistent and configurable logging across the application
 *
 * Features:
 * - Enable/disable logging with environment variable or localStorage
 * - Different log levels (info, warn, error, debug)
 * - Context-specific logging (auth, api, ui, etc.)
 * - Production safe (no sensitive data)
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log contexts to categorize logs
export type LogContext =
  | 'auth'
  | 'api'
  | 'navigation'
  | 'ui'
  | 'middleware'
  | 'supabase'
  | 'general';

// Check if logging is enabled
const isLoggingEnabled = () => {
  // In development, enable by default or check localStorage
  if (process.env.NODE_ENV === 'development') {
    // If explicitly disabled via localStorage, return false
    if (typeof window !== 'undefined' && localStorage.getItem('withme-debug') === 'false') {
      return false;
    }
    return true;
  }

  // In production, only enable when explicitly set via localStorage
  return typeof window !== 'undefined' && localStorage.getItem('withme-debug') === 'true';
};

// Function to enable/disable logging
export const setLogging = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('withme-debug', enabled ? 'true' : 'false');
    console.log(`WithMe logging ${enabled ? 'enabled' : 'disabled'}`);
  }
};

// Main logger function
export const logger = {
  debug: (message: string, context: LogContext = 'general', data?: any) => {
    if (!isLoggingEnabled()) return;
    console.debug(`[WithMe:${context}] ${message}`, data !== undefined ? data : '');
  },
  
  info: (message: string, context: LogContext = 'general', data?: any) => {
    if (!isLoggingEnabled()) return;
    console.info(`[WithMe:${context}] ${message}`, data !== undefined ? data : '');
  },
  
  warn: (message: string, context: LogContext = 'general', data?: any) => {
    if (!isLoggingEnabled()) return;
    console.warn(`[WithMe:${context}] ${message}`, data !== undefined ? data : '');
  },
  
  error: (message: string, context: LogContext = 'general', data?: any) => {
    if (!isLoggingEnabled()) return;
    console.error(`[WithMe:${context}] ${message}`, data !== undefined ? data : '');
  },
  
  // Group related logs together
  group: (title: string, context: LogContext = 'general', collapsed = false) => {
    if (!isLoggingEnabled()) return;
    if (collapsed) {
      console.groupCollapsed(`[WithMe:${context}] ${title}`);
    } else {
      console.group(`[WithMe:${context}] ${title}`);
    }
  },
  
  groupEnd: () => {
    if (!isLoggingEnabled()) return;
    console.groupEnd();
  },
  
  // Measure performance
  time: (label: string, context: LogContext = 'general') => {
    if (!isLoggingEnabled()) return;
    console.time(`[WithMe:${context}] ${label}`);
  },
  
  timeEnd: (label: string, context: LogContext = 'general') => {
    if (!isLoggingEnabled()) return;
    console.timeEnd(`[WithMe:${context}] ${label}`);
  }
};

// Helper for development-only console commands
export const dev = {
  // Enable logging
  enableLogging: () => setLogging(true),

  // Disable logging
  disableLogging: () => setLogging(false),

  // Check if logging is enabled
  isLoggingEnabled: () => isLoggingEnabled(),

  // Get current auth token (dev only)
  getAuthToken: () => {
    if (process.env.NODE_ENV !== 'development') {
      logger.warn('getAuthToken is only available in development', 'auth');
      return null;
    }

    if (typeof window === 'undefined') return null;

    // Find auth cookie
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((c) => c.trim().startsWith('sb-'));

    if (!authCookie) return null;

    return authCookie.trim().split('=')[1];
  }
};

export default logger;