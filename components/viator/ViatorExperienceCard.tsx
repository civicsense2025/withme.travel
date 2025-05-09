'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { appendViatorAffiliate, trackViatorLinkClick } from '@/utils/api/viator';

export interface ViatorExperienceProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  price: string;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  productUrl: string;
  productCode: string;
  tripId?: string;
  labels?: string[];
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
  tripId,
  labels = []
}: ViatorExperienceProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle clicking the "Book Now" button or card
  const handleBookClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const affiliateUrl = appendViatorAffiliate(productUrl);
    
    // Track the click
    await trackViatorLinkClick(affiliateUrl, {
      productCode,
      tripId,
      pageContext: tripId ? 'trip_itinerary' : 'destination',
    });
    
    // Open the Viator page in a new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };
  
  // Optional: Add to trip functionality
  const handleAddToTrip = () => {
    // This would be implemented later
    console.log('Add to trip:', title);
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden border-0 bg-primary-bg shadow-md dark:bg-surface-light/10">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl || '/images/placeholder-experience.jpg'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-in-out"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          
          {/* Price badge */}
          <div className="absolute bottom-4 left-4 z-10">
            <Badge className="bg-accent-purple px-3 py-1.5 text-white dark:bg-accent-purple/90">
              {price}
            </Badge>
          </div>
          
          {/* Labels */}
          {labels.length > 0 && (
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
              {labels.map((label) => (
                <Badge 
                  key={label} 
                  className="bg-white px-2 py-1 text-xs text-primary dark:bg-surface-light dark:text-primary-text"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <CardContent className="p-5">
          <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-primary-text">
            {title}
          </h3>
          
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-secondary-text">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{duration}</span>
              </div>
            )}
            
            {rating && (
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
                {reviewCount && <span className="text-muted-foreground">({reviewCount})</span>}
              </div>
            )}
            
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{location}</span>
              </div>
            )}
          </div>
          
          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-secondary-text">
              {description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex gap-2 p-5 pt-0">
          <Button 
            className="flex-1 bg-accent-purple hover:bg-accent-purple/90" 
            onClick={handleBookClick}
          >
            Book on Viator
            <ExternalLink size={16} className="ml-2" />
          </Button>
          
          {tripId && (
            <Button 
              variant="outline" 
              className="flex-none"
              onClick={handleAddToTrip}
            >
              Add to Trip
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
} 