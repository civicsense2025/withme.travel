import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Eye, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  };
  index?: number;
}

export function ItineraryTemplateCard({ itinerary, index = 0 }: ItineraryTemplateCardProps) {
  // Ensure we have an image, with fallbacks
  const imageUrl = itinerary.image || '/images/placeholder-itinerary.jpg';

  // Get initials from author name for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const authorInitials = itinerary.author ? getInitials(itinerary.author.name) : '?';

  return (
    <Link href={`/itineraries/${itinerary.slug}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-all">
        <div className="relative h-48 overflow-hidden">
          {/* Use error handling for images */}
          <Image
            src={imageUrl}
            alt={itinerary.title}
            fill
            className="object-cover"
            onError={(e) => {
              // If image fails to load, replace with placeholder
              const imgElement = e.target as HTMLImageElement;
              imgElement.src = '/images/placeholder-itinerary.jpg';
            }}
          />
          {!itinerary.is_published && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="destructive">Draft</Badge>
            </div>
          )}
        </div>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 lowercase">{itinerary.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{itinerary.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.isArray(itinerary.tags) && itinerary.tags.length > 0 ? (
              itinerary.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No tags</span>
            )}
            {itinerary.tags.length > 3 && (
              <Badge variant="outline">+{itinerary.tags.length - 3}</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{itinerary.location}</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{itinerary.duration}</span>
            </div>
            {itinerary.author && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={itinerary.author.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
