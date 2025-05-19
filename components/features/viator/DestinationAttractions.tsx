'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Landmark, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildDestinationUrl, appendViatorAffiliate } from '@/utils/api/viator';
import { trackViatorLinkClick } from '@/utils/api/viator';

interface ViatorAttraction {
  attractionId: string;
  translation: {
    name: string;
    introduction?: string;
    overview?: string;
  };
  primaryDestinationId: string;
  primaryDestinationName: string;
  thumbnailHiResURL?: string;
  thumbnailURL?: string;
  rating?: number;
  reviewCount?: number;
  webURL?: string;
  productCount?: number;
}

interface DestinationAttractionsProps {
  destinationId: string;
  destinationName: string;
  viatorDestinationId?: string;
  limit?: number;
}

export function DestinationAttractions({
  destinationId,
  destinationName,
  viatorDestinationId,
  limit = 6,
}: DestinationAttractionsProps) {
  const [attractions, setAttractions] = useState<ViatorAttraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!viatorDestinationId) {
          throw new Error('No Viator destination ID available');
        }

        // Use the API endpoint to fetch attractions
        const response = await fetch(
          `/api/viator/attractions?destinationId=${viatorDestinationId}&count=${limit}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Viator attractions API response:', {
          success: data.success,
          totalResults: data.data?.length || 0,
          source: data.source,
        });

        if (data.success && Array.isArray(data.data)) {
          setAttractions(data.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err: any) {
        console.error('Error fetching attractions:', err);
        setError(err.message || 'Failed to load attractions');
      } finally {
        setIsLoading(false);
      }
    };

    if (viatorDestinationId) {
      fetchAttractions();
    } else {
      setIsLoading(false);
      setError('No Viator destination ID available for this city');
    }
  }, [viatorDestinationId, limit]);

  const handleViewAttraction = (attraction: ViatorAttraction) => {
    if (!attraction.webURL) return;

    const affiliateUrl = appendViatorAffiliate(attraction.webURL);

    // Track the click
    trackViatorLinkClick(affiliateUrl, {
      pageContext: 'destination_attractions',
    });

    // Open the Viator page in a new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const handleViewAllClick = () => {
    if (!viatorDestinationId) {
      console.error('No Viator destination ID available');
      return;
    }

    const destinationUrl = buildDestinationUrl(viatorDestinationId, destinationName);

    // Track the click before opening the Viator page
    trackViatorLinkClick(destinationUrl, {
      pageContext: 'destination_page',
    });

    // Open Viator destination page in a new tab
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="my-8 animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array(limit < 4 ? limit : 3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[4/3] w-full rounded-md bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-3 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700"></div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error && attractions.length === 0) {
    return null; // Don't show errors if there are no attractions
  }

  if (attractions.length === 0) {
    return null;
  }

  return (
    <section className="my-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">
            Top Attractions in {destinationName}
          </h2>
          <p className="mt-1 text-secondary-text">
            Must-visit places and landmarks to add to your itinerary
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-1 mt-4 sm:mt-0"
          onClick={handleViewAllClick}
          disabled={!viatorDestinationId}
        >
          View all on Viator
          <ExternalLink size={16} />
        </Button>
      </div>

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((attraction) => (
          <Card
            key={attraction.attractionId}
            className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleViewAttraction(attraction)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={
                  attraction.thumbnailHiResURL ||
                  attraction.thumbnailURL ||
                  '/images/placeholder-attraction.jpg'
                }
                alt={attraction.translation.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              {attraction.productCount && attraction.productCount > 0 && (
                <Badge className="absolute bottom-4 left-4 bg-accent-purple text-white">
                  {attraction.productCount}{' '}
                  {attraction.productCount === 1 ? 'experience' : 'experiences'}
                </Badge>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2">{attraction.translation.name}</h3>

              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Landmark size={14} className="mr-1" />
                <span>Attraction</span>

                {attraction.rating && (
                  <div className="flex items-center ml-4">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{attraction.rating.toFixed(1)}</span>
                    {attraction.reviewCount && (
                      <span className="text-muted-foreground ml-1">({attraction.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>

              {attraction.translation.introduction && (
                <p className="text-sm text-secondary-text line-clamp-2">
                  {attraction.translation.introduction}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
