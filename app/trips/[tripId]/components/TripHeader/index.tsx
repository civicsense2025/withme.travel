import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TripHeaderProps {
  coverImageUrl?: string;
  name?: string;
}

// Function to extract attribution info from Unsplash or Pexels URLs
function extractImageAttribution(url: string | undefined): {
  creator?: string;
  creatorUrl?: string;
  source?: 'unsplash' | 'pexels' | undefined;
} {
  if (!url) return {};

  try {
    // Extract from Unsplash URLs
    if (url.includes('unsplash.com')) {
      // Try to extract the Unsplash username from URL
      const unsplashMatch =
        url.match(/unsplash\.com\/photos\/[^/]+\/@([^/?&]+)/i) ||
        url.match(/unsplash\.com\/photos\/[^/]+/i) ||
        url.match(/unsplash\.com\/@([^/?&]+)/i);

      const username = unsplashMatch ? unsplashMatch[1] : undefined;

      return {
        creator: username,
        creatorUrl: username ? `https://unsplash.com/@${username}` : undefined,
        source: 'unsplash',
      };
    }

    // Extract from Pexels URLs
    if (url.includes('pexels.com')) {
      // Try to extract the Pexels photographer from URL
      const pexelsMatch =
        url.match(/pexels\.com\/photo\/[^/]+\-([0-9]+)/i) || url.match(/pexels\.com\/@([^/?&]+)/i);

      const photographer = pexelsMatch ? pexelsMatch[1] : undefined;

      return {
        creator: photographer,
        creatorUrl: photographer ? `https://www.pexels.com/@${photographer}` : undefined,
        source: 'pexels',
      };
    }
  } catch (error) {
    console.error('Error extracting image attribution:', error);
  }

  return {};
}

export function TripHeader({ coverImageUrl, name }: TripHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { creator, creatorUrl, source } = extractImageAttribution(coverImageUrl);

  const hasAttribution = Boolean(source);

  return (
    <div className="relative w-full overflow-hidden rounded-md">
      <Image
        src={coverImageUrl || '/images/default-trip-image.jpg'}
        alt={name || 'Trip cover image'}
        width={1200}
        height={400}
        className="w-full h-auto object-cover"
        onLoad={() => setImageLoaded(true)}
        priority
      />

      {hasAttribution && imageLoaded && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          <span>Photo{creator ? ` by ${creator}` : ''} on</span>
          {creatorUrl ? (
            <a
              href={creatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 hover:underline font-medium"
            >
              {source === 'unsplash' ? 'Unsplash' : 'Pexels'}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="font-medium">{source === 'unsplash' ? 'Unsplash' : 'Pexels'}</span>
          )}
        </div>
      )}
    </div>
  );
}
