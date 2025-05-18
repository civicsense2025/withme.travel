/**
 * Destination Image
 * 
 * Displays an image for a destination with optional gradient overlay and attribution tooltip
 * 
 * @module destinations/atoms
 */

import React from 'react';
import Image from 'next/image';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationImageProps {
  /** URL of the image to display */
  imageUrl: string;
  /** Name of the destination */
  destinationName: string;
  /** Country for alt text */
  country?: string | null;
  /** Image metadata for attribution */
  imageMetadata?: {
  alt_text?: string;
  attribution?: string;
  attributionHtml?: string;
  photographer_name?: string;
  photographer_url?: string;
  source?: string;
  source_id?: string;
  url?: string;
  };
  /** Whether to show a gradient overlay */
  showGradient?: boolean;
  /** CSS class for aspect ratio */
  aspectRatio?: string;
  /** Priority loading for LCP images */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationImage({
  imageUrl,
  destinationName,
  country,
  imageMetadata,
  showGradient = true,
  aspectRatio = 'aspect-[4/3]',
  priority = false,
  className,
}: DestinationImageProps) {
  // Generate descriptive alt text
  const altText = imageMetadata?.alt_text || `Scenic view of ${destinationName}${country ? `, ${country}` : ''}`;

  // Helper function to create the attribution string with links
  const createAttributionText = (metadata?: DestinationImageProps['imageMetadata']) => {
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
  
  const attributionText = createAttributionText(imageMetadata);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", aspectRatio, className)}>
      {/* Gradient overlay */}
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
      )}
      
      {/* Image Component */}
      <Image
        src={imageUrl}
        alt={altText}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        priority={priority}
      />
      
      {/* Attribution tooltip trigger */}
      {attributionText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                className="absolute top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-black/60 text-white z-20"
                  tabIndex={0}
                  aria-label="Show photo credits"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
            <TooltipContent side="left" align="end" className="max-w-xs text-xs">
                <span dangerouslySetInnerHTML={{ __html: attributionText }} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      )}
    </div>
  );
} 