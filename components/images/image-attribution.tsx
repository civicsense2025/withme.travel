'use client';

import { ExternalLink, Info } from 'lucide-react';
import { createImageAttribution, ImageAttributionData } from '@/lib/utils/image-credits';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageAttributionProps {
  image: ImageAttributionData;
  variant?: 'inline' | 'badges' | 'overlay' | 'info-icon';
  className?: string;
}

/**
 * A standardized component for displaying image attribution information
 * Can be used in multiple ways throughout the application
 */
export function ImageAttribution({
  image,
  variant = 'inline',
  className = '',
}: ImageAttributionProps) {
  if (!image) return null;

  const source = image.source || image.source_name;
  const sourceUrl = image.url || '';
  const photographer = image.photographer;
  const photographerUrl = image.photographer_url;

  // If there's nothing to display, return null
  if (!source && !photographer) return null;

  // For info-icon variant with tooltip (used on cover photos)
  if (variant === 'info-icon') {
    return (
      <div className={`absolute bottom-2 right-2 ${className}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/60 transition-colors"
                aria-label="Image attribution"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="text-sm">
                {photographer && (
                  <span>
                    Photo by{' '}
                    {photographerUrl ? (
                      <a
                        href={photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {photographer}
                      </a>
                    ) : (
                      <span className="font-medium">{photographer}</span>
                    )}
                    {source && ' on '}
                  </span>
                )}
                {source && (
                  <span>
                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </a>
                    ) : (
                      <span className="font-medium">
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // If we have a pre-formatted attribution HTML, use it for inline and overlay variants
  const attributionHtml = createImageAttribution(image);
  if (attributionHtml && (variant === 'inline' || variant === 'overlay')) {
    return (
      <div
        className={`${
          variant === 'overlay'
            ? 'absolute bottom-0 right-0 p-1 text-xs text-white/80 bg-black/60 rounded-tl backdrop-blur-sm'
            : 'text-sm text-muted-foreground'
        } ${className}`}
      >
        <span dangerouslySetInnerHTML={{ __html: attributionHtml }}></span>
      </div>
    );
  }

  // For badges variant (used in admin UI)
  if (variant === 'badges') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {/* Source badge */}
        {source && (
          <div className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1 flex items-center gap-1">
            Source:
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {source}
                <ExternalLink className="h-3 w-3 ml-1 inline" />
              </a>
            ) : (
              <span className="ml-1">{source}</span>
            )}
          </div>
        )}

        {/* Photographer badge */}
        {photographer && (
          <div className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1 flex items-center gap-1">
            Photo:
            {photographerUrl ? (
              <a
                href={photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {photographer}
                <ExternalLink className="h-3 w-3 ml-1 inline" />
              </a>
            ) : (
              <span className="ml-1">{photographer}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback for other variants
  return (
    <div className={`text-sm text-muted-foreground ${className}`}>
      {photographer && (
        <span>
          Photo by{' '}
          {photographerUrl ? (
            <a
              href={photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {photographer}
            </a>
          ) : (
            photographer
          )}
          {source && ' on '}
        </span>
      )}
      {source && (
        <span>
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {source}
            </a>
          ) : (
            source
          )}
        </span>
      )}
    </div>
  );
}
