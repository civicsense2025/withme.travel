/**
 * ItineraryTemplateCard Component
 * 
 * Card component for displaying an itinerary template with basic information.
 * 
 * @module itinerary/molecules
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ItineraryTemplateCardProps {
  /** Itinerary data */
  itinerary: {
    id: string;
    title: string;
    slug: string;
    cover_image_url: string | null;
    description?: string;
    location?: string;
    duration_days?: number;
  };
  /** Optional index for staggered animations */
  index?: number;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryTemplateCard({ 
  itinerary, 
  index = 0,
  className 
}: ItineraryTemplateCardProps) {
  const {
    id,
    title,
    slug,
    cover_image_url,
    description,
    location,
    duration_days
  } = itinerary;

  const delay = 0.1 + index * 0.1;
  
  return (
    <Card className={cn("overflow-hidden group transition-all duration-300 hover:shadow-md h-full flex flex-col", className)}>
      <Link href={`/itineraries/${slug}`} className="flex-1 flex flex-col h-full">
        <div className="relative w-full h-40 overflow-hidden">
          {cover_image_url ? (
            <Image
              src={cover_image_url}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-medium text-foreground/90 line-clamp-2">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-1">
          {location && (
            <div className="text-sm text-muted-foreground mb-2">
              📍 {location}
            </div>
          )}
          
          {duration_days && (
            <div className="text-sm text-muted-foreground mb-2">
              ⏱️ {duration_days} {duration_days === 1 ? 'day' : 'days'}
            </div>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
              {description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-2 mt-auto">
          <Button variant="ghost" size="sm" className="ml-auto group-hover:bg-primary/10">
            View itinerary
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
} 