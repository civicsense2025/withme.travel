'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Props for the TripCoverImage component
 */
export interface TripCoverImageProps {
  /** URL of the cover image */
  src: string | null;
  /** Alternative text for the image */
  alt: string;
  /** Optional width override */
  width?: number;
  /** Optional height override */
  height?: number;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional border radius override */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Whether to show a placeholder while loading */
  showPlaceholder?: boolean;
  /** Optional aspect ratio */
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
  /** Optional callback when image loads */
  onLoad?: () => void;
  /** Optional callback when image fails to load */
  onError?: () => void;
}

/**
 * Component for displaying trip cover images with consistent styling
 */
export function TripCoverImage({
  src,
  alt,
  width = 400,
  height = 225,
  className,
  borderRadius = 'md',
  showPlaceholder = true,
  aspectRatio = '16:9',
  onLoad,
  onError
}: TripCoverImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Default cover image if none provided
  const defaultCoverSrc = '/images/default-trip-cover.jpg';
  const imageSrc = src || defaultCoverSrc;
  
  // Map aspect ratio to tailwind classes
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:2': 'aspect-[3/2]'
  };
  
  // Map border radius to tailwind classes
  const borderRadiusClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'full': 'rounded-full'
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      className={cn(
        'overflow-hidden relative',
        aspectRatioClasses[aspectRatio],
        borderRadiusClasses[borderRadius],
        className
      )}
    >
      {showPlaceholder && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <Image
        src={hasError ? defaultCoverSrc : imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'object-cover w-full h-full transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 