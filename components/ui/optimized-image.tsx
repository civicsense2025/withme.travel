'use client';

import React from 'react';
import Image from 'next/image';
import { imageService, ImageType, ImageMetadata, ImageOptions } from '@/lib/services/image-service';

interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> {
  metadata?: ImageMetadata | null;
  type: ImageType;
  fallbackText: string;
  imageOptions?: ImageOptions;
  showAttribution?: boolean;
}

export function OptimizedImage({
  metadata = null,
  type,
  fallbackText,
  imageOptions,
  showAttribution = false,
  className,
  ...props
}: OptimizedImageProps) {
  // Get the optimized image URL with fallback
  const imageUrl = imageService.getImageUrlWithFallback(
    metadata,
    type,
    fallbackText,
    imageOptions
  );

  return (
    <div className="relative">
      <Image
        src={imageUrl}
        alt={metadata?.alt_text || fallbackText}
        className={className}
        {...props}
      />
      
      {/* Show attribution if requested and available */}
      {showAttribution && (metadata?.attributionHtml || metadata?.attribution) && (
        <div className="absolute bottom-0 right-0 p-1 text-xs text-white/60 bg-black/30 rounded-tl">
          {metadata.attributionHtml ? (
            <span dangerouslySetInnerHTML={{ __html: metadata.attributionHtml }}></span>
          ) : (
            metadata.attribution
          )}
        </div>
      )}
    </div>
  );
} 