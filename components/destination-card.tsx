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
  const citySlug = displayName ? displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null;
  const cardHref = disableNavigation ? undefined : (href || (citySlug ? `/destinations/${citySlug}` : `/destinations/${destination.id}`));

  // Improved fallback for image if not available
  const imageUrl = (() => {
    if (image_url) {
      // If image_url is provided, ensure it starts with a slash
      return image_url.startsWith('/') ? image_url : `/${image_url}`;
    }
    
    // Handle city names with spaces and special characters for filename
    const slug = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Default to jpg extension
    return `/destinations/${slug}.jpg`;
  })();

  // Generate descriptive alt text
  const altText = destination.image_metadata?.alt_text || `${displayName}${displayLocation ? `, ${displayLocation}` : ''}`;

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
    <CardWrapper>
      <Card className="overflow-hidden rounded-xl md:rounded-2xl border-0 shadow-sm transition-all duration-300 h-full hover:shadow-md">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden">
          {/* Main image */}
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={imageUrl}
              alt={altText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
              loading="lazy"
              onError={(e) => {
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = '/placeholder-destination.jpg';
              }}
            />
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Texture overlay */}
            <TextureOverlay />
          </motion.div>
          
          {/* Like button */}
          <div className="absolute top-2 right-2 z-20">
            <LikeButton
              itemId={destination.id}
              itemType="destination"
              size="sm"
              className="h-8 w-8 bg-white/10 backdrop-blur-md rounded-full"
            />
          </div>
          
          {/* Attribution info */}
          {destination.image_metadata && (
            <ImageAttribution 
              image={{
                alt_text: destination.image_metadata.alt_text,
                attribution_html: destination.image_metadata.attributionHtml,
                photographer: destination.image_metadata.photographer_name,
                photographer_url: destination.image_metadata.photographer_url,
                source: destination.image_metadata.source,
                external_id: destination.image_metadata.source_id,
                url: destination.image_metadata.url
              }} 
              variant="info-icon"
              className={hideAttributionMobile ? 'hidden md:block' : ''}
            />
          )}
          
          {/* Destination info overlay */}
          <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 z-10 pointer-events-none">
            <div className="flex items-start gap-1.5">
              {emoji && (
                <span className="text-lg sm:text-xl flex-shrink-0 mt-1">{emoji}</span>
              )}
              <div>
                <h3 className="font-semibold text-base sm:text-lg leading-tight text-white mb-0.5 line-clamp-2">
                  {displayName}
                </h3>
                {displayLocation && (
                  <p className="text-xs sm:text-sm text-white/90">
                    {displayLocation}
                  </p>
                )}
                
                {/* Highlight tags */}
                {destination.highlights && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(typeof destination.highlights === 'string' 
                      ? [destination.highlights] 
                      : destination.highlights
                    ).slice(0, 2).map((highlight, i) => (
                      <Badge 
                        key={i}
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white text-[10px] sm:text-xs py-0 px-1.5 h-5 font-normal"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </CardWrapper>
  );
}
