/**
 * Notes Skeleton
 * 
 * Skeleton loader for the notes interface
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface NotesSkeletonProps {
  /** Optional height for the skeleton */
  height?: string;
  /** Optional additional class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Skeleton loader for the notes interface
 */
export function NotesSkeleton({ height = 'h-64', className = '' }: NotesSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Notes List Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-8 w-2/3" />
        </div>
        
        {/* Notes Editor Skeleton */}
        <div className="md:col-span-2">
          <Skeleton className={`w-full ${height} ${className}`} />
          <div className="flex justify-between mt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
} 