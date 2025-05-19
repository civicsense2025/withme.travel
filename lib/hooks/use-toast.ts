/**
 * useToast Hook
 *
 * A standardized toast notification hook for consistent UI feedback.
 *
 * @module /lib/hooks/use-toast
 */

'use client';

// Inspired by react-hot-toast library
import * as React from 'react';
import { Toast, ToastProps } from '@/components/ui/toast';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

/**
 * Toast options type
 */
export interface ToastOptions {
  title?: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'info';
  duration?: number;
}

/**
 * Configuration options for the useToast hook
 */
export interface UseToastOptions {
  maxToasts?: number;
}

/**
 * useToast - React hook for managing toast notifications
 */
export function useToast({ maxToasts = 3 }: UseToastOptions = {}) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback(
    (options: ToastOptions) => {
      setToasts((prev) => {
        // If we're at max capacity, remove the oldest toast
        if (prev.length >= maxToasts) {
          return [...prev.slice(1), options];
        }
        return [...prev, options];
      });

      // Auto-dismiss after duration seconds or 5 seconds (default)
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t !== options));
      }, options.duration || 5000);
    },
    [maxToasts]
  );

  const dismiss = useCallback((index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { toast, toasts, dismiss };
}

// Use this to create a toast that will be rendered in the provider
// Re-export for convenience
export { Toast };
export type { ToastProps };
