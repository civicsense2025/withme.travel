'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the TripShareButton component
 */
export interface TripShareButtonProps {
  /** Trip ID to share */
  tripId: string;
  /** Optional click handler for sharing */
  onShare?: (tripId: string) => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional label */
  label?: string;
}

/**
 * Button for sharing a trip
 */
export function TripShareButton({
  tripId,
  onShare,
  className,
  label = 'Share',
}: TripShareButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(tripId);
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900 transition-colors font-medium',
        className
      )}
      onClick={handleClick}
      aria-label={label}
    >
      <Share2 size={16} />
      <span>{label}</span>
    </button>
  );
} 