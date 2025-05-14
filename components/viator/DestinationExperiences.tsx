'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ExternalLink, ChevronLeft } from 'lucide-react';
import { ViatorExperienceCard, ViatorExperienceProps } from './ViatorExperienceCard';
import { buildDestinationUrl, appendViatorAffiliate } from '@/utils/api/viator';
import { trackViatorLinkClick } from '@/utils/api/viator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DestinationExperiencesProps {
  destinationId: string; // Your internal UUID
  destinationName: string;
  cityName?: string; // Add this prop to help with mapping
  viatorDestinationId?: string; // Direct viator_destination_id if available
  limit?: number;
}

export function DestinationExperiences({
  destinationId,
  destinationName,
  cityName,
  viatorDestinationId,
  limit = 10,
}: DestinationExperiencesProps) {
  const [experiences, setExperiences] = useState<ViatorExperienceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Use the viator_destination_id from props if available
  const viatorDestId = viatorDestinationId;

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!viatorDestId) {
          throw new Error('No Viator destination ID available');
        }

        // Use the Viator ID for API call
        const endpointUrl = `/api/viator/destination/${viatorDestId}?limit=${limit}`;

        console.log(
          `Fetching experiences for destination: ${destinationName}, using endpoint: ${endpointUrl}`
        );

        // Call our API endpoint to get Viator experiences for this destination
        const response = await fetch(endpointUrl);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Viator API response:', {
          success: data.success,
          totalResults: data.data?.length || 0,
          message: data.message,
          source: data.source,
        });

        if (data.success && Array.isArray(data.data)) {
          // Transform the API response into our component's expected format
          const transformedExperiences = data.data.map((exp: any) => ({
            id: exp.code || exp.productCode || `viator-${Math.random().toString(36).substring(7)}`,
            title: exp.title || 'Viator Experience',
            description: exp.description || exp.shortDescription || null,
            imageUrl:
              exp.thumbnailURL ||
              exp.thumbnailHiResURL ||
              'https://images.unsplash.com/photo-1569288063643-5d29ad6ad7a5',
            price: exp.price?.formattedValue || exp.priceFormatted || '$49.99',
            duration: exp.duration || '3 hours',
            rating: exp.rating || 4.7,
            reviewCount: exp.reviewCount || 856,
            location: destinationName,
            productUrl:
              appendViatorAffiliate(exp.webURL) ||
              buildDestinationUrl(viatorDestId, destinationName),
            productCode: exp.code || exp.productCode || 'VIATOR101',
            labels: exp.categories?.map((cat: any) => cat.name) || ['Tour', 'Activity'],
            _isMockData: data.source?.includes('mock') || false,
            _isRealData: !data.source?.includes('mock'),
          }));

          if (transformedExperiences.length > 0) {
            setExperiences(transformedExperiences);
            console.log(
              `Displaying ${transformedExperiences.length} experiences (${data.source || 'unknown source'})`
            );
          } else {
            console.log('No experiences found in API response');
            setError('No experiences found for this destination');
          }
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err: any) {
        console.error('Error fetching experiences:', err);
        setError(err.message || 'Failed to load experiences');
      } finally {
        setIsLoading(false);
      }
    };

    if (viatorDestId) {
      fetchExperiences();
    } else {
      setIsLoading(false);
      setError('No Viator destination ID available for this city');
    }
  }, [destinationId, destinationName, limit, viatorDestId]);

  const handleViewAllClick = () => {
    if (!viatorDestId) {
      console.error('No Viator destination ID available');
      return;
    }

    const destinationUrl = buildDestinationUrl(viatorDestId, destinationName);

    // Track the click before opening the Viator page
    trackViatorLinkClick(destinationUrl, {
      pageContext: 'destination_page',
    });

    // Open Viator destination page in a new tab
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  };

  // Extract all unique categories from experiences
  const allCategories = [...new Set(experiences.flatMap((exp) => exp.labels || []))];

  // Filter experiences by category
  const filteredExperiences =
    activeCategory === 'all'
      ? experiences
      : experiences.filter((exp) => exp.labels?.includes(activeCategory));

  // Carousel navigation
  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(filteredExperiences.length - getVisibleCount(), prev + 1));
  };

  // Calculate how many items to show based on viewport
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return Math.min(4, filteredExperiences.length);
  };

  if (isLoading) {
    return (
      <div className="my-8 animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array(limit < 5 ? limit : 4)
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

  if (error && experiences.length === 0) {
    return (
      <section className="my-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Experiences in {destinationName}
        </h2>
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <p>{error}</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleViewAllClick}
          disabled={!viatorDestId}
        >
          View all on Viator
          <ExternalLink size={16} />
        </Button>
      </section>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  const visibleCount = getVisibleCount();
  const visibleExperiences = filteredExperiences.slice(currentIndex, currentIndex + visibleCount);
  const showPrevious = currentIndex > 0;
  const showNext = currentIndex + visibleCount < filteredExperiences.length;

  return (
    <section className="my-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">
            Popular Experiences in {destinationName}
          </h2>
          <p className="mt-1 text-secondary-text">
            Book unforgettable activities and skip-the-line tickets for top attractions
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-1 mt-4 sm:mt-0"
          onClick={handleViewAllClick}
          disabled={!viatorDestId}
        >
          View all on Viator
          <ExternalLink size={16} />
        </Button>
      </div>

      {/* Category filters */}
      {allCategories.length > 1 && (
        <Tabs
          defaultValue="all"
          className="mb-6"
          onValueChange={setActiveCategory}
          value={activeCategory}
        >
          <TabsList className="bg-surface-subtle">
            <TabsTrigger value="all">All</TabsTrigger>
            {allCategories.slice(0, 5).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Carousel with navigation buttons */}
      <div className="relative">
        {showPrevious && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-4 top-1/2 z-10 transform -translate-y-1/2 p-1 bg-white/80 dark:bg-black/30 rounded-full h-10 w-10 shadow-md"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous</span>
          </Button>
        )}

        <div
          ref={carouselRef}
          className="flex overflow-x-hidden gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            transition: 'transform 0.4s ease-in-out',
            width: '100%',
          }}
        >
          {filteredExperiences.map((experience) => (
            <div
              key={experience.id}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 6) / visibleCount}px)`,
              }}
            >
              <ViatorExperienceCard {...experience} />
            </div>
          ))}
        </div>

        {showNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-1/2 z-10 transform -translate-y-1/2 p-1 bg-white/80 dark:bg-black/30 rounded-full h-10 w-10 shadow-md"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next</span>
          </Button>
        )}
      </div>
    </section>
  );
}
