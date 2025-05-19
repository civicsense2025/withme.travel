import React, { useState } from 'react';
import Image from 'next/image';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  className?: string;
  onClick?: () => void;
}

export function PopularDestinationCard({
  destination,
  className = '',
  onClick,
}: DestinationCardProps) {
  const [showCredits, setShowCredits] = useState(false);
  const { city, country, image_url, emoji, image_metadata, byline, name } = destination;
  const displayName = name || city || '';

  // Fallback for image if not available
  const imageUrl = (() => {
    if (image_url) {
      return image_url.startsWith('/') ? image_url : `/${image_url}`;
    }
    const slug = displayName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    return `/destinations/${slug}.jpg`;
  })();

  // Generate descriptive alt text
  const generateAltText = () => {
    const baseAlt = image_metadata?.alt_text || `Scenic view of ${displayName}, ${country}`;
    return baseAlt;
  };
  const altText = generateAltText();

  // Helper function to create the attribution string with links
  const createAttributionText = (
    metadata: DestinationCardProps['destination']['image_metadata']
  ) => {
    if (!metadata) return null;
    const { photographer_name, photographer_url, source, source_id, url } = metadata;
    if (photographer_name && source) {
      const sourceName = source.charAt(0).toUpperCase() + source.slice(1);
      let sourceLink = url;
      if (source === 'pexels' && source_id) {
        sourceLink = `https://www.pexels.com/photo/${source_id}`;
      } else if (source === 'unsplash' && source_id) {
        sourceLink = `https://unsplash.com/photos/${source_id}`;
      }
      const photographerPart = photographer_url
        ? `<a href="${photographer_url}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${photographer_name}</a>`
        : photographer_name;
      const sourcePart = sourceLink
        ? `<a href="${sourceLink}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${sourceName}</a>`
        : sourceName;
      return `Photo by ${photographerPart} on ${sourcePart}`;
    }
    if (metadata.attributionHtml) return metadata.attributionHtml;
    if (metadata.attribution) return metadata.attribution;
    return null;
  };
  const attributionText = createAttributionText(image_metadata);

  return (
    <Card
      className={`
        group bg-transparent border-0 overflow-hidden rounded-xl h-full 
        transition-all duration-500 ease-out
        hover:shadow-xl hover:scale-[1.02]
        relative
        ${className}
      `}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Select ${displayName}`}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
        {/* Image Component */}
        <Image
          src={imageUrl}
          alt={altText}
          width={800}
          height={1200}
          className="object-cover w-full h-full"
          priority={false}
        />
        {/* Destination Info */}
        <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold mb-1">{displayName}</h3>
              <p className="text-sm text-white/90 flex items-center">
                {emoji && <span className="mr-1">{emoji}</span>}
                {country}
              </p>
              {byline && <p className="mt-1 text-sm text-white/80">{byline}</p>}
            </div>
            {/* Info icon for photo credits */}
            {attributionText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="ml-2 p-1 rounded-full bg-black/30 hover:bg-black/60 text-white"
                      tabIndex={0}
                      aria-label="Show photo credits"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="end" className="max-w-xs text-xs">
                    <span dangerouslySetInnerHTML={{ __html: attributionText }} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
