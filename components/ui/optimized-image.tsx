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
  priority?: boolean;
  sizes?: string;
}

// Default placeholder blur data URL (light gray)
const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=';

export function OptimizedImage({
  metadata = null,
  type,
  fallbackText,
  imageOptions,
  showAttribution = false,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  ...props
}: OptimizedImageProps) {
  // Get the optimized image URL with fallback
  const imageUrl = imageService.getImageUrlWithFallback(metadata, type, fallbackText, imageOptions);

  return (
    <div className="relative">
      <Image
        src={imageUrl}
        alt={metadata?.alt_text || fallbackText}
        className={className}
        placeholder="blur"
        blurDataURL={metadata?.blur_data_url || PLACEHOLDER_BLUR}
        priority={priority}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        quality={85} // Higher quality for better visual appearance
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