'use client';

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth-provider';

// Re-export the types and context from auth-provider
export type { AuthContextType };
export { AuthContext };

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
