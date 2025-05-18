/**
 * Destination Meta Badges
 * 
 * Displays a collection of badges for destination metadata like continent, season, and cost
 * 
 * @module destinations/molecules
 */

import React from 'react';
import { Globe, Calendar, Briefcase } from 'lucide-react';
import { DestinationBadge } from '../atoms/DestinationBadge';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationMetaBadgesProps {
  /** Continent name */
  continent?: string | null;
  /** Best season to visit */
  bestSeason?: string | null;
  /** Average cost per day */
  avgCostPerDay?: number | null;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationMetaBadges({
  continent,
  bestSeason,
  avgCostPerDay,
  className,
}: DestinationMetaBadgesProps) {
  // Format currency for average cost
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'Not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!continent && !bestSeason && !avgCostPerDay) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {continent && (
        <DestinationBadge variant="continent" icon={<Globe className="h-4 w-4" />}>
          {continent}
        </DestinationBadge>
      )}
      {bestSeason && (
        <DestinationBadge variant="season" icon={<Calendar className="h-4 w-4" />}>
          {bestSeason}
        </DestinationBadge>
      )}
      {avgCostPerDay && (
        <DestinationBadge variant="cost" icon={<Briefcase className="h-4 w-4" />}>
          {formatCurrency(avgCostPerDay)}/day
        </DestinationBadge>
      )}
    </div>
  );
} 