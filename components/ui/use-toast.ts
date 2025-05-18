/**
 * useToast (Hook)
 *
 * A themeable, accessible toast hook (stub).
 *
 * @module ui/hooks
 */
import { useCallback } from 'react';
import { ReactNode } from 'react';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'info';
  duration?: number;
  action?: ReactNode;
}

export function useToast() {
  // Stub: Replace with a real toast implementation
  const toast = useCallback((options: ToastOptions) => {
    // no-op
  }, []);
  return { toast, toasts: [] };
}
