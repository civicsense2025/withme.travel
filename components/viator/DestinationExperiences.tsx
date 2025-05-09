'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { ViatorExperienceGrid } from './ViatorExperienceGrid';
import { ViatorExperienceProps } from './ViatorExperienceCard';
import { buildDestinationUrl } from '@/utils/api/viator';
import { trackViatorLinkClick } from '@/utils/api/viator';

interface DestinationExperiencesProps {
  destinationId: string;  // Viator destination ID
  destinationName: string;
  limit?: number;
}

export function DestinationExperiences({
  destinationId,
  destinationName,
  limit = 4
}: DestinationExperiencesProps) {
  const [experiences, setExperiences] = useState<ViatorExperienceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // This would be replaced with an actual API call in production
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Mock API call timing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock some experiences for the destination
        const mockExperiences: ViatorExperienceProps[] = [
          {
            id: '101',
            title: `${destinationName} City Tour with Local Guide`,
            description: `Explore the best of ${destinationName} with a knowledgeable local guide. Visit top attractions and discover hidden gems.`,
            imageUrl: 'https://images.unsplash.com/photo-1569288063643-5d29ad6ad7a5',
            price: '$49.99',
            duration: '3 hours',
            rating: 4.7,
            reviewCount: 856,
            location: destinationName,
            productUrl: `https://www.viator.com/tours/${destinationName}/City-Tour`,
            productCode: 'CITY101',
            labels: ['Walking Tour', 'Small Group']
          },
          {
            id: '102',
            title: `${destinationName} Food Tasting Adventure`,
            description: `Sample the best local cuisine ${destinationName} has to offer on this guided food tour. Try regional specialties and learn about culinary traditions.`,
            imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636',
            price: '$79.99',
            duration: '4 hours',
            rating: 4.9,
            reviewCount: 1243,
            location: destinationName,
            productUrl: `https://www.viator.com/tours/${destinationName}/Food-Tour`,
            productCode: 'FOOD102',
            labels: ['Food & Drinks', 'Small Group']
          },
          {
            id: '103',
            title: `Day Trip from ${destinationName}`,
            description: `Escape the city for a day and explore the surrounding countryside. Visit charming villages and natural landmarks.`,
            imageUrl: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
            price: '$129.99',
            duration: '8 hours',
            rating: 4.6,
            reviewCount: 587,
            location: `${destinationName} Region`,
            productUrl: `https://www.viator.com/tours/${destinationName}/Day-Trip`,
            productCode: 'DAYTRIP103',
            labels: ['Day Trip', 'Transportation Included']
          },
          {
            id: '104',
            title: `${destinationName} by Night Tour`,
            description: `See ${destinationName} in a different light on this evening tour. Visit illuminated landmarks and enjoy the vibrant nightlife.`,
            imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
            price: '$59.99',
            duration: '3 hours',
            rating: 4.5,
            reviewCount: 432,
            location: destinationName,
            productUrl: `https://www.viator.com/tours/${destinationName}/Night-Tour`,
            productCode: 'NIGHT104',
            labels: ['Evening Tour', 'Photography']
          }
        ];
        
        setExperiences(mockExperiences);
      } catch (err) {
        console.error('Error fetching experiences:', err);
        setError('Failed to load experiences');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExperiences();
  }, [destinationId, destinationName]);
  
  const handleViewAllClick = () => {
    const destinationUrl = buildDestinationUrl(destinationId, destinationName);
    
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array(limit).fill(0).map((_, i) => (
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

  if (error) {
    return (
      <div className="my-8 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
        <p>{error}</p>
      </div>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  const displayExperiences = experiences.slice(0, limit);
  const categories = [...new Set(experiences.flatMap(exp => exp.labels || []))];

  return (
    <section className="my-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">Popular Experiences in {destinationName}</h2>
          <p className="mt-1 text-secondary-text">
            Book unforgettable activities and skip-the-line tickets for top attractions
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={handleViewAllClick}
        >
          View all on Viator
          <ExternalLink size={16} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayExperiences.map(experience => (
          <ViatorExperienceCard
            key={experience.id}
            {...experience}
          />
        ))}
      </div>
    </section>
  );
} 