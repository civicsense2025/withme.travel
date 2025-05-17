'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TripCoverImage } from '../atoms/TripCoverImage';
import { TripDestinationBadge } from '../atoms/TripDestinationBadge';
import { TripStatusBadge } from '../atoms/TripStatusBadge';

/**
 * Props for the TripCardHeader component
 */
export interface TripCardHeaderProps {
  /** Trip name */
  name: string;
  /** Trip destination name */
  destination: string;
  /** Cover image URL */
  coverImageUrl?: string | null;
  /** Whether the trip is liked */
  isLiked?: boolean;
  /** Optional number of likes */
  likesCount?: number;
  /** Optional trip status */
  status?: 'planning' | 'active' | 'completed' | 'past' | 'upcoming';
  /** Callback when like button is clicked */
  onLikeClick?: () => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional custom destination badge class name */
  destinationClassName?: string;
  /** Whether the header is clickable */
  isClickable?: boolean;
  /** Optional click handler for the entire header */
  onClick?: () => void;
  /** Show or hide the like button */
  showLikeButton?: boolean;
}

/**
 * Component for displaying the header portion of a trip card
 * Combines cover image, trip title, destination badge, and like button
 */
export function TripCardHeader({
  name,
  destination,
  coverImageUrl,
  isLiked = false,
  likesCount,
  status,
  onLikeClick,
  className,
  destinationClassName,
  isClickable = false,
  onClick,
  showLikeButton = true
}: TripCardHeaderProps) {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeClick?.();
  };

  const handleHeaderClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cn(
        'relative',
        isClickable && onClick && 'cursor-pointer',
        className
      )}
      onClick={handleHeaderClick}
    >
      {/* Cover image */}
      <TripCoverImage
        src={coverImageUrl || null}
        alt={`Cover image for ${name}`}
        aspectRatio="16:9"
        className="w-full"
        borderRadius="lg"
      />
      
      {/* Destination badge */}
      <div className="absolute top-3 left-3">
        <TripDestinationBadge
          destination={destination}
          className={destinationClassName}
          size="sm"
          color="default"
        />
      </div>
      
      {/* Status badge, if provided */}
      {status && (
        <div className="absolute top-3 right-3">
          <TripStatusBadge 
            status={status} 
            size="sm" 
          />
        </div>
      )}
      
      {/* Like button */}
      {showLikeButton && (
        <button 
          onClick={handleLikeClick}
          className={cn(
            'absolute bottom-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90',
            'hover:bg-white dark:hover:bg-gray-800 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
          aria-label={isLiked ? 'Unlike trip' : 'Like trip'}
        >
          <Heart 
            size={18} 
            className={cn(
              isLiked 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-500 dark:text-gray-400'
            )} 
          />
        </button>
      )}
      
      {/* Trip name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white rounded-b-lg">
        <h3 className="font-medium truncate">{name}</h3>
        
        {/* Optional likes count */}
        {typeof likesCount === 'number' && (
          <div className="flex items-center mt-1 text-xs text-white/80">
            <Heart size={12} className="mr-1" />
            <span>{likesCount}</span>
          </div>
        )}
      </div>
    </div>
  );
} 