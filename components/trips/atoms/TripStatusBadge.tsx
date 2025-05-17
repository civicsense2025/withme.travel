'use client';

import { cn } from '@/lib/utils';
import { Clock, CheckCircle, Calendar, Plane } from 'lucide-react';

/**
 * Props for the TripStatusBadge component
 */
export interface TripStatusBadgeProps {
  /** Status of the trip */
  status: 'planning' | 'active' | 'completed' | 'past' | 'upcoming';
  /** Optional additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show icon */
  showIcon?: boolean;
  /** Optional custom label */
  label?: string;
  /** Whether to show solid background */
  solid?: boolean;
  /** Whether to use rounded-full style */
  pill?: boolean;
}

/**
 * Component for displaying trip status as a badge
 */
export function TripStatusBadge({
  status,
  className,
  size = 'md',
  showIcon = true,
  label,
  solid = false,
  pill = true
}: TripStatusBadgeProps) {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };
  
  // Status configuration
  const statusConfig = {
    planning: {
      icon: Clock,
      label: 'Planning',
      solidClass: 'bg-blue-500 text-white',
      outlineClass: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
    },
    active: {
      icon: Plane,
      label: 'Active',
      solidClass: 'bg-green-500 text-white',
      outlineClass: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      solidClass: 'bg-purple-500 text-white',
      outlineClass: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
    },
    past: {
      icon: CheckCircle,
      label: 'Past',
      solidClass: 'bg-gray-500 text-white',
      outlineClass: 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800'
    },
    upcoming: {
      icon: Calendar,
      label: 'Upcoming',
      solidClass: 'bg-yellow-500 text-white',
      outlineClass: 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  // Icon size based on badge size
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center',
        pill ? 'rounded-full' : 'rounded',
        sizeClasses[size],
        solid ? config.solidClass : config.outlineClass,
        className
      )}
    >
      {showIcon && (
        <StatusIcon
          size={iconSize}
          className={cn(
            'mr-1',
            size === 'sm' ? '-ml-0.5' : size === 'md' ? '-ml-0.5' : '-ml-1'
          )}
        />
      )}
      {label || config.label}
    </span>
  );
} 