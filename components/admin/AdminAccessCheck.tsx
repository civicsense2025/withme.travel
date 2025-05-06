'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';

interface AdminAccessCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders its children if the current user is an admin
 */
export default function AdminAccessCheck({ children, fallback = null }: AdminAccessCheckProps) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin === true;

  if (!isAdmin) {
    return fallback;
  }

  return <>{children}</>;
} 