'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Clock, Star, Check, Info } from 'lucide-react';
import Image from 'next/image';
import { trackViatorLinkClick } from '@/utils/api/viator';

export interface ViatorExperienceProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  price: string;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  productUrl: string; // URL to the Viator product page
  productCode: string;
  labels?: string[];
  _isMockData?: boolean;
  _isRealData?: boolean;
}

export function ViatorExperienceCard({
  id,
  title,
  description,
  imageUrl,
  price,
  duration,
  rating,
  reviewCount,
  location,
  productUrl,
  productCode,
  labels,
  _isMockData,
  _isRealData,
}: ViatorExperienceProps) {
  const handleViewOnViator = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent parent card click handlers

    if (!productUrl) return;

    // Track the click before opening Viator
    trackViatorLinkClick(productUrl, {
      productCode,
      pageContext: 'experience_card',
    });

    // Open in a new tab
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] h-52 w-full overflow-hidden bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}

        {labels && labels.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-accent-purple text-white">{labels[0]}</Badge>
          </div>
        )}

        {_isRealData && (
          <div className="absolute right-3 top-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-white/80 text-xs font-normal">
                    <Check className="mr-1 h-3 w-3 text-green-600" />
                    Viator API
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Real data from Viator API</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {_isMockData && (
          <div className="absolute right-3 top-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-white/80 text-xs font-normal">
                    <Info className="mr-1 h-3 w-3 text-amber-600" />
                    Mock Data
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mock data (Viator API unavailable)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <CardContent className="flex h-[calc(100%-13rem)] flex-col justify-between p-4">
        <div>
          <h3 className="mb-1 font-medium line-clamp-2" title={title}>
            {title}
          </h3>

          {location && <p className="text-sm text-muted-foreground">{location}</p>}

          <div className="mt-2 flex flex-wrap gap-3">
            {price && (
              <Badge variant="outline" className="gap-1 border-accent-purple text-accent-purple">
                {price}
              </Badge>
            )}

            {duration && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </Badge>
            )}

            {rating && rating > 0 && (
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {rating.toFixed(1)}
                {reviewCount && <span className="text-muted-foreground">({reviewCount})</span>}
              </Badge>
            )}
          </div>

          {description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>

        <Button
          className="mt-4 w-full justify-between bg-accent-purple hover:bg-accent-purple/90 text-white"
          size="sm"
          onClick={handleViewOnViator}
        >
          View on Viator
          <ExternalLink className="ml-1.5 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
