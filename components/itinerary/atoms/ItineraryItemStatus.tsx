/**
 * ItineraryItemStatus
 *
 * Displays the status of an itinerary item with appropriate styling
 *
 * @module itinerary/atoms
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, CircleEllipsis, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Temporary constants until we can properly import from status.ts
const ITEM_STATUS = {
  CONFIRMED: 'confirmed',
  SUGGESTED: 'suggested',
  REJECTED: 'rejected'
};

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ItineraryItemStatusProps {
  /** Status of the itinerary item */
  status: string;
  /** Additional class names */
  className?: string;
  /** Optional compact mode for limited space */
  compact?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryItemStatus({
  status,
  className,
  compact = false
}: ItineraryItemStatusProps) {
  const getStatusConfig = () => {
    switch(status) {
      case ITEM_STATUS.CONFIRMED:
        return {
          label: 'Confirmed',
          variant: 'success' as const,
          icon: CheckCircle
        };
      case ITEM_STATUS.REJECTED:
        return {
          label: 'Rejected',
          variant: 'destructive' as const,
          icon: XCircle
        };
      case ITEM_STATUS.SUGGESTED:
      default:
        return {
          label: 'Suggested',
          variant: 'secondary' as const,
          icon: CircleEllipsis
        };
    }
  };

  const { label, variant, icon: Icon } = getStatusConfig();

  // For compact mode, just show the icon
  if (compact) {
    return (
      <Icon 
        className={cn(
          'h-4 w-4', 
          variant === 'success' && 'text-success',
          variant === 'destructive' && 'text-destructive',
          variant === 'secondary' && 'text-muted-foreground',
          className
        )} 
      />
    );
  }

  return (
    <Badge 
      variant={variant} 
      className={cn('flex items-center gap-1', className)}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
} 