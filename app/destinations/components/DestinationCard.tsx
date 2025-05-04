'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Destination, LAYOUT } from '../constants';

import { DestinationCardProps } from './types';

/**
 * Memoized Destination Card component for better performance
 * 
 * Displays a destination as a clickable card with image, name, and location.
 * Includes accessibility features for keyboard navigation and screen readers.
 * Uses performance optimizations like memoization and event handling.
 * 
 * @example
 * ```tsx
 * import { DestinationCard } from '@/app/destinations/components';
 * 
 * function DestinationsGrid({ destinations }) {
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       {destinations.map(destination => (
 *         <DestinationCard 
 *           key={destination.id} 
 *           destination={destination} 
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Accessibility features:
 * - Keyboard navigation (Enter/Space to navigate)
 * - Screen reader support (aria-label with descriptive text)
 * - Focus indicators
 * - Touch target sizing
 */
const DestinationCard = memo(({ destination }: DestinationCardProps) => {
  const router = useRouter();
  
  /**
   * Navigation handler - memoized for performance
   * Navigates to the destination detail page when card is clicked
   */
  const handleNavigate = useCallback((): void => {
    router.push(`/destinations/${destination.id}`);
  }, [router, destination.id]);
  
  /**
   * Keyboard handler - memoized for performance
   * Enables keyboard navigation with Enter or Space key
   * Follows accessibility best practices for interactive elements
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/destinations/${destination.id}`);
    }
  }, [router, destination.id]);
  
  // Generate accessible label for the destination
  const ariaLabel = `View ${destination.name || destination.city}${destination.country ? ` in ${destination.country}` : ''}`;
  
  return (
    <div
      role="link"
      tabIndex={0}
      className={`${LAYOUT.CARD_CLASSES} ${LAYOUT.ITEM_HEIGHT} cursor-pointer
        hover:opacity-90 hover:ring-2 hover:ring-primary/50
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        active:scale-[0.98] touch-action-manipulation`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: destination.image_url 
            ? `url('${destination.image_url}')` 
            : 'linear-gradient(to right, var(--muted), var(--muted-foreground))'
        }}
      />
      <div className="h-full w-full flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent relative z-10">
        <div className="text-white">
          <h3 className="font-semibold text-lg">{destination.name || destination.city}</h3>
          {destination.country && <p className="text-sm opacity-90">{destination.country}</p>}
        </div>
      </div>
    </div>
  );
});

// Important for React DevTools
DestinationCard.displayName = 'DestinationCard';

export default DestinationCard;

