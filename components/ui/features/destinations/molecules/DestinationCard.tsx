/**
 * DestinationCard Component
 * 
 * A card component displaying destination information with interactive
 * hover effects and detailed attribution for destination images.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Info, Camera, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LikeButton } from '@/components/like-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ImageAttribution } from '@/components/images';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// SVG texture overlay for gradients
const TextureOverlay = () => (
  <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

// Heart animation component
const HeartButton = () => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className="relative z-10"
        onClick={() => setLiked(!liked)}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart
          className={`h-8 w-8 transition-colors duration-300 ${
            liked ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
          }`}
        />
      </button>
      <AnimatePresence>
        {liked && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1.5 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.35, type: 'spring' }}
          >
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500 opacity-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// TYPES
// ============================================================================

export interface DestinationCardProps {
  destination: {
    id: string;
    city: string | null;
    country: string | null;
    continent: string;
    description: string | null;
    byline?: string | null;
    highlights?: string[] | string | null;
    image_url?: string | null;
    emoji?: string | null;
    image_metadata?: {
      alt_text?: string;
      attribution?: string;
      attributionHtml?: string;
      photographer_name?: string;
      photographer_url?: string;
      source?: string;
      source_id?: string;
      url?: string;
    };
    cuisine_rating: number;
    nightlife_rating: number;
    cultural_attractions: number;
    outdoor_activities: number;
    beach_quality: number;
    best_season?: string;
    avg_cost_per_day?: number;
    safety_rating?: number;
    name?: string;
  };
  href?: string;
  className?: string;
  hideAttributionMobile?: boolean;
  disableNavigation?: boolean;
  onClick?: () => void;
  variant?: 'link' | 'selectable';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card component for showcasing a travel destination
 */
export function DestinationCard({
  destination,
  href,
  className = '',
  hideAttributionMobile = false,
  disableNavigation = false,
  onClick,
  variant = 'link',
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Destructure destination properties
  const { city, country, image_url, emoji, name } = destination;

  // Use the name field if provided, otherwise fall back to city
  const displayName = name || city || '';
  const displayLocation = country || '';

  // Fallback for href if not provided
  const citySlug = displayName
    ? displayName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    : null;
  const cardHref = disableNavigation
    ? undefined
    : href || (citySlug ? `/destinations/${citySlug}` : `/destinations/${destination.id}`);

  // Improved fallback for image if not available
  const imageUrl = (() => {
    // If image_url exists and is not empty
    if (image_url && image_url.trim() !== '') {
      // If it's an absolute URL, use it directly
      if (image_url.startsWith('http') || image_url.startsWith('https')) {
        return image_url;
      }
      // If it starts with a slash, it's a local path
      if (image_url.startsWith('/')) {
        return image_url;
      }
      // Otherwise, prepend the destinations path
      return `/destinations/${image_url}`;
    }

    // Handle null destinations or null data parts specifically
    if (displayName.toLowerCase().includes('null')) {
      return `/images/placeholder-destination.jpg`;
    }

    // For fallback images, use the public static directory
    return `/images/placeholder-destination.jpg`;
  })();

  // Generate descriptive alt text
  const altText =
    destination.image_metadata?.alt_text ||
    `${displayName}${displayLocation ? `, ${displayLocation}` : ''}`;

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (cardHref && !disableNavigation) {
      router.push(cardHref);
    }
  };

  // Card wrapper component
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (variant === 'selectable' || disableNavigation) {
      return (
        <div
          className={`group cursor-pointer transition-all duration-300 ${className}`}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </div>
      );
    }

    return (
      <Link
        href={cardHref || '#'}
        className={`group block transition-all duration-300 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </Link>
    );
  };

  // Check if image metadata exists
  const hasImageMetadata = destination.image_metadata && (
    destination.image_metadata.photographer_name || 
    destination.image_metadata.source || 
    destination.image_metadata.attribution
  );

  return (
    <div
      className={cn(
        'relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden group rounded-md',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={destination.name}
      onClick={disableNavigation ? onClick : undefined}
      style={{ cursor: disableNavigation ? 'pointer' : undefined }}
    >
      {/* Main image */}
      <motion.div
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full will-change-transform"
      >
        <Image
          src={imageUrl}
          alt={altText}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-opacity duration-300"
          loading="lazy"
          onError={(e) => {
            console.log(`Image load error for ${imageUrl}`);
            const imgElement = e.target as HTMLImageElement;
            // Try multiple fallbacks in succession
            if (!imageUrl.includes('placeholder-destination.jpg')) {
              imgElement.src = '/images/placeholder-destination.jpg';
            } else if (imageUrl.startsWith('/images/')) {
              // If we're already trying the images directory placeholder, try the destinations directory
              imgElement.src = '/destinations/placeholder.jpg';
            }
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent via-black/40 transition-opacity duration-300" />
        <TextureOverlay />
      </motion.div>

      {/* Image attribution */}
      {hasImageMetadata && (
        <div
          className={cn(
            'absolute bottom-1 right-1 md:right-2 z-10 transition-all duration-300',
            hideAttributionMobile ? 'hidden md:block' : 'block',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 backdrop-blur-sm">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[250px] text-xs">
                <div>
                  {destination.image_metadata?.photographer_name && (
                    <p className="mb-1">
                      Photo by{' '}
                      {destination.image_metadata.photographer_url ? (
                        <a
                          href={destination.image_metadata.photographer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline text-primary inline-flex items-center"
                        >
                          {destination.image_metadata.photographer_name}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        <span className="font-medium">
                          {destination.image_metadata.photographer_name}
                        </span>
                      )}
                    </p>
                  )}
                  {destination.image_metadata?.source && (
                    <p className="text-muted-foreground">
                      via {destination.image_metadata.source}
                    </p>
                  )}
                  {destination.image_metadata?.attribution && !destination.image_metadata?.photographer_name && (
                    <p className="text-xs opacity-80">{destination.image_metadata.attribution}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
        <motion.div 
          className="z-10"
          animate={{ y: isHovered ? 0 : 5, opacity: isHovered ? 1 : 0.9 }}
          transition={{ duration: 0.4 }}
        >
          {/* Location Badge (optional) */}
          {displayLocation && (
            <div className="mb-1.5">
              <Badge 
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-xs py-1"
                variant="outline"
              >
                {displayLocation}
              </Badge>
            </div>
          )}
          
          {/* Destination Title */}
          <h3 className="font-bold text-lg md:text-xl mb-1 flex items-center gap-1">
            {emoji && <span className="mr-1">{emoji}</span>}
            {displayName}
          </h3>
          
          {/* Byline or description */}
          {(destination.byline || destination.description) && (
            <p className="text-sm text-white/90 line-clamp-2">
              {destination.byline || 
              (destination.description && destination.description.substring(0, 100) + '...')}
            </p>
          )}
        </motion.div>
      </div>
      
      {/* If card is selectable, optionally show "like" UI */}
      {variant === 'selectable' && (
        <div className="absolute top-3 right-3 z-10">
          <HeartButton />
        </div>
      )}
    </div>
  );
} 