'use client';

import { cn } from '@/lib/utils';

/**
 * Props for the ConnectionStatusIndicator component
 */
export interface ConnectionStatusIndicatorProps {
  /** Connection status */
  status: 'online' | 'offline' | 'connecting' | 'error';
  /** Optional label to display */
  label?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Shows a colored dot and label for connection status
 */
export function ConnectionStatusIndicator({
  status,
  label,
  className,
}: ConnectionStatusIndicatorProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    connecting: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    connecting: 'Connecting…',
    error: 'Error',
  };
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('w-2.5 h-2.5 rounded-full', statusColors[status])} />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {label || statusLabels[status]}
      </span>
    </span>
  );
} 