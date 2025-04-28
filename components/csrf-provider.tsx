"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CSRF } from '@/utils/csrf';

interface CsrfContextType {
  csrfToken: string | null;
  loading: boolean;
  refreshToken: () => Promise<string>;
}

const CsrfContext = createContext<CsrfContextType | null>(null);

/**
 * Provider component for CSRF token management
 */
export function CsrfProvider({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCsrfToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/auth/csrf', { 
        method: 'GET',
        credentials: 'include' // Important to include cookies
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No CSRF token in response');
      }
      
      setCsrfToken(data.token);
      return data.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return '';
    } finally {
      setLoading(false);
    }
  };

  // Initial token fetch
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // Function to get a fresh token
  const refreshToken = async (): Promise<string> => {
    setLoading(true);
    return await fetchCsrfToken();
  };

  // Context value
  const value = {
    csrfToken,
    loading,
    refreshToken
  };

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  );
}

/**
 * Hook to use CSRF token
 */
export function useCsrf(): CsrfContextType {
  const context = useContext(CsrfContext);
  
  if (!context) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  
  return context;
}

/**
 * Function to add CSRF token to fetch requests
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param token - CSRF token
 */
export function fetchWithCsrf(
  url: string, 
  options: RequestInit = {}, 
  token: string
): Promise<Response> {
  // Create headers object with CSRF token
  const headers = new Headers(options.headers || {});
  headers.set(CSRF.HEADER_NAME, token);
  
  // Return fetch with the modified options
  return fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies
    headers
  });
} 