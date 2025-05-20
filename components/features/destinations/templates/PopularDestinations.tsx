/**
 * Popular Destinations
 * 
 * A section that displays popular destinations in a responsive grid layout
 * 
 * @module destinations/templates
 */

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DestinationGrid } from '../organisms/DestinationGrid';
import { getPopularDestinations } from '@/lib/api/destinations';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface PopularDestinationsProps {
  /** Pre-fetched destinations data */
  destinations?: any[];
  /** Maximum number of destinations to display */
  limit?: number;
  /** Title for the section */
  title?: string;
  /** Subtitle/description for the section */
  subtitle?: string;
  /** URL to view all destinations */
  viewAllUrl?: string;
  /** Number of columns for different breakpoints */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Whether to show continent/region filters */
  showFilters?: boolean;
  /** Whether to show the view all button */
  showViewAll?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export async function PopularDestinations({
  destinations: propDestinations,
  limit = 6,
  title = "Popular Destinations",
  subtitle = "Explore some of our most visited destinations",
  viewAllUrl = "/destinations",
  columns = { sm: 1, md: 2, lg: 3 },
  showSearch = false,
  showFilters = false,
  showViewAll = true,
  className,
}: PopularDestinationsProps) {
  // If destinations aren't provided via props, fetch them
  const destinations = propDestinations || (await getPopularDestinations(limit));

  if (!destinations?.length) {
    return null;
  }

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <DestinationGrid 
        destinations={destinations}
        columns={columns}
        showSearch={showSearch}
        showFilters={showFilters}
        showSorting={false}
      />
      {showViewAll && (
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href={viewAllUrl}>
              View all destinations
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 