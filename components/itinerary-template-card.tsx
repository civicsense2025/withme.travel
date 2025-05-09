'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ItineraryTemplateMetadata } from '@/utils/constants/tables';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ItineraryTemplateCardProps {
  itinerary: {
    id: string;
    title: string;
    description: string;
    image: string;
    location: string;
    duration: string;
    tags: string[];
    slug: string;
    is_published: boolean;
    author?: {
      id: string;
      name: string | null;
      avatar_url: string | null;
    } | null;
    destinations: Destination[];
    duration_days: number;
    category: string;
    created_at: string;
    view_count: number;
    use_count: number;
    like_count: number;
    featured: boolean;
    cover_image_url: string;
    groupsize: string;
    metadata: ItineraryTemplateMetadata;
  };
  index?: number;
}

export function ItineraryTemplateCard({ itinerary, index = 0 }: ItineraryTemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate fallback or placeholder image
  const imageUrl = itinerary.image || itinerary.cover_image_url || '/images/placeholder-itinerary.jpg';

  // Get author initials from name or use placeholder
  const authorInitials = itinerary.author?.name
    ? itinerary.author.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Get primary tag to display
  const primaryTag = Array.isArray(itinerary.tags) && itinerary.tags.length > 0
    ? itinerary.tags[0]
    : itinerary.category || 'Itinerary';

  return (
    <Link href={`/itineraries/${itinerary.slug}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-full"
      >
        <Card className="overflow-hidden h-full border-0 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-zinc-900">
          {/* Image with smooth zoom effect on hover */}
          <div className="relative aspect-[3/2] overflow-hidden">
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full w-full"
            >
              <Image
                src={imageUrl}
                alt={itinerary.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={index < 3}
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = '/images/placeholder-itinerary.jpg';
                }}
              />
            </motion.div>
            
            {/* Minimalist overlay for status */}
            {!itinerary.is_published && (
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="secondary" className="bg-black/50 text-white font-medium text-xs px-2 py-1">Draft</Badge>
              </div>
            )}
          </div>
          
          {/* Content area with minimal information */}
          <div className="p-5">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 flex-1">
                <h3 className="font-medium text-lg tracking-tight line-clamp-1">{itinerary.title}</h3>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {Array.isArray(itinerary.destinations) && itinerary.destinations.length > 0
                      ? (() => {
                          const d = itinerary.destinations[0];
                          const city = (d as any)?.city ?? (d as any)?.name;
                          const country = (d as any)?.country;
                          const validCity = city && city !== 'null' && city !== null && city !== undefined ? city : null;
                          const validCountry = country && country !== 'null' && country !== null && country !== undefined ? country : null;
                          if (validCity && validCountry) return `${validCity}, ${validCountry}`;
                          if (validCity) return validCity;
                          if (validCountry) return validCountry;
                          return 'No city';
                        })()
                      : itinerary.location || 'No city'}
                  </span>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-primary/5 text-primary border-0">
                {itinerary.duration_days} days
              </Badge>
            </div>
            
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              {itinerary.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={itinerary.author.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {itinerary.author.name || 'Anonymous'}
                  </span>
                </div>
              )}
              
              <motion.div
                animate={{ x: isHovered ? 3 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
