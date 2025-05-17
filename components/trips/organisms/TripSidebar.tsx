'use client';

import { cn } from '@/lib/utils';

/**
 * Props for the TripSidebar component
 */
export interface TripSidebarProps {
  /** Trip object (scaffold: any) */
  trip: any;
  /** Members array (scaffold: any[]) */
  members: any[];
  /** Optional actions (e.g., buttons) */
  actions?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Organism: Sidebar for trip details (scaffold only)
 */
export function TripSidebar({
  trip,
  members,
  actions,
  className,
}: TripSidebarProps) {
  return (
    <aside className={cn('w-80 p-4 bg-white dark:bg-gray-950 rounded-xl shadow', className)}>
      <div className="mb-4 font-bold text-lg">Trip Sidebar</div>
      {/* Scaffold: trip summary, members, actions */}
      <div>Trip: {trip?.name}</div>
      <div>Members: {members?.length}</div>
      {actions}
    </aside>
  );
} 