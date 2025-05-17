'use client';

import { cn } from '@/lib/utils';
import { TripCardHeader } from '../molecules/TripCardHeader';
import { TripCardFooter } from '../molecules/TripCardFooter';
import type { TripCardHeaderProps } from '../molecules/TripCardHeader';
import type { TripCardFooterProps } from '../molecules/TripCardFooter';

/**
 * Props for the TripCard component
 */
export interface TripCardProps {
  /** Header props */
  header: TripCardHeaderProps;
  /** Footer props */
  footer: TripCardFooterProps;
  /** Main content (optional) */
  children?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional click handler for the card */
  onClick?: () => void;
}

/**
 * Organism: Complete card representing a trip in lists or grids
 */
export function TripCard({
  header,
  footer,
  children,
  className,
  onClick,
}: TripCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-950 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      <TripCardHeader {...header} />
      {children && <div className="px-4 py-2">{children}</div>}
      <TripCardFooter {...footer} />
    </div>
  );
} 