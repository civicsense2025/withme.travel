'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// import { ImageDebug } from "@/components/debug/ImageDebug"; // Import the debug component
import { Heart, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LikeButton } from '@/components/like-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ImageAttribution } from '@/components/images';
import { cn } from '@/lib/utils';

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

interface DestinationCardProps {
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
              imgElement.src = '/destinations/placeholder-destination.jpg';
            } else {
              // Last resort - use a data URI for a simple placeholder if all else fails
              imgElement.src =
                'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 400 300%22%3E%3Crect fill%3D%22%23f2f2f2%22 width%3D%22400%22 height%3D%22300%22%2F%3E%3Ctext fill%3D%22%23999%22 font-family%3D%22sans-serif%22 font-size%3D%2220%22 text-anchor%3D%22middle%22 x%3D%22200%22 y%3D%22150%22%3EImage not available%3C%2Ftext%3E%3C%2Fsvg%3E';
            }
          }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Texture overlay */}
        <TextureOverlay />
      </motion.div>

      {/* Like button */}
      <div className="absolute top-2 right-2 z-20">
        <LikeButton
          itemId={destination.id}
          itemType="destination"
          size="sm"
          iconOnly={true}
          className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-full transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Attribution */}
      {destination.image_metadata?.attribution && (
        <div
          className={cn(
            'absolute bottom-0 right-0 z-10 p-1 text-[10px] text-white/80 max-w-[90%] truncate',
            'bg-black/30 backdrop-blur-sm rounded-tl-lg',
            hideAttributionMobile && 'hidden md:block'
          )}
        >
          <ImageAttribution
            image={{
              alt_text: destination.image_metadata.alt_text,
              attribution_html: destination.image_metadata.attributionHtml,
              photographer: destination.image_metadata.photographer_name,
              photographer_url: destination.image_metadata.photographer_url,
              source: destination.image_metadata.source,
              external_id: destination.image_metadata.source_id,
              url: destination.image_metadata.url,
            }}
            variant="overlay"
          />
        </div>
      )}

      {/* Info tooltip */}
      {destination.description && (
        <div className="absolute bottom-2 left-2 z-20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="h-7 w-7 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Show destination info"
                >
                  <Info className="h-4 w-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-sm">
                {destination.description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Destination name overlay */}
      <motion.div
        className="absolute inset-x-0 bottom-0 p-4 z-10"
        initial={{ opacity: 0.9, y: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.9, y: isHovered ? -5 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-white text-xl font-medium leading-tight drop-shadow-md">
          {displayName}
          {emoji && <span className="ml-2">{emoji}</span>}
        </h3>
        {displayLocation && (
          <p className="text-white/90 text-sm mt-1 drop-shadow-md">{displayLocation}</p>
        )}
      </motion.div>
    </div>
  );
}
