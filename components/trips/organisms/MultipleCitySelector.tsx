'use client';

import { cn } from '@/lib/utils';

/**
 * Props for the MultipleCitySelector component
 */
export interface MultipleCitySelectorProps {
  /** List of selected city names */
  selectedCities: string[];
  /** Handler when selection changes */
  onChange: (cities: string[]) => void;
  /** List of available cities to select from */
  availableCities: string[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Organism: Selector for multiple cities (scaffold only)
 */
export function MultipleCitySelector({
  selectedCities,
  onChange,
  availableCities,
  className,
}: MultipleCitySelectorProps) {
  return (
    <div className={cn('p-4 bg-white dark:bg-gray-950 rounded-xl', className)}>
      {/* Scaffold: UI for selecting multiple cities */}
      <div>Selected: {selectedCities.join(', ')}</div>
      <div>Available: {availableCities.join(', ')}</div>
    </div>
  );
} 