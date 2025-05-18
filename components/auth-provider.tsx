'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * User profile data structure
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
}

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

/**
 * Auth provider component that handles authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check authentication status on load
  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/me');
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // No user is logged in
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Signup failed');
      }
      
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Signup failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Logout failed');
      }
      
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Password reset request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Password reset request failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 