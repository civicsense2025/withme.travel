'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ChevronRight } from 'lucide-react';
import { LikeButton } from './like-button';
import { UseTemplateButton } from './use-template-button';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { ImageAttribution } from './images';

interface ItineraryDay {
  day: number;
  items: {
    id: string;
    title: string;
    description?: string;
    location: string;
    start_time: string | null;
    end_time: string | null;
  }[];
}

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface ItineraryTemplateDetailProps {
  template: {
    id: string;
    title: string;
    slug: string;
    description: string;
    duration_days: number;
    category: string;
    days: ItineraryDay[];
    view_count: number;
    use_count: number;
    like_count: number;
    created_at: string;
    destinations: {
      id: string;
      name: string;
      country: string;
      image_url: string;
      latitude: number;
      longitude: number;
      image_metadata?: {
        alt_text?: string;
        attribution?: string;
        attributionHtml?: string;
        photographer_name?: string;
        photographer_url?: string;
        source?: string;
        source_id?: string;
        url?: string;
      };
    };
    users: {
      id: string;
      full_name: string;
      avatar_url: string;
    };
  };
  isLiked?: boolean;
}

export function ItineraryTemplateDetail({
  template,
  isLiked = false,
}: ItineraryTemplateDetailProps) {
  const templateImageUrl = `/images/templates/${template.slug}/cover.jpg`;
  const router = useRouter();
  const { toast } = useToast();
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [likeCount, setLikeCount] = useState<number>(template.like_count || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [tripTitle, setTripTitle] = useState<string>(`Trip to ${template.destinations.name}`);
  const [isUseDialogOpen, setIsUseDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const creator = template.users;

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/itineraries/${template.slug}/like`, {
        method: liked ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setLiked(!liked);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  const handleUseTemplate = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: 'Missing dates',
        description: 'Please select a start and end date for your trip.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/itineraries/${template.slug}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: tripTitle,
          start_date: format(dateRange.from, 'yyyy-MM-dd'),
          end_date: format(dateRange.to, 'yyyy-MM-dd'),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your trip has been created from this template.',
        });
        setIsUseDialogOpen(false);
        router.push(`/trips/${data.trip_id}`);
      } else {
        throw new Error(data.error || 'Failed to create trip');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create trip',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/itineraries/${template.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'The link to this template has been copied to your clipboard.',
    });
    setIsShareDialogOpen(false);
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
        <Image
          src={
            template.destinations.image_url ||
            '/placeholder.svg?height=800&width=1200&query=travel destination'
          }
          alt={template.destinations.image_metadata?.alt_text || template.title}
          fill
          className="object-cover"
          priority
        />
        {/* Add gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Add image attribution */}
        {template.destinations.image_metadata && (
          <ImageAttribution
            image={{
              alt_text: template.destinations.image_metadata.alt_text,
              attribution_html: template.destinations.image_metadata.attributionHtml,
              photographer: template.destinations.image_metadata.photographer_name,
              photographer_url: template.destinations.image_metadata.photographer_url,
              source: template.destinations.image_metadata.source,
              external_id: template.destinations.image_metadata.source_id,
              url: template.destinations.image_metadata.url,
            }}
            variant="info-icon"
          />
        )}
      </div>

      {/* About the creator section */}
      {creator && (
        <div className="flex items-center gap-4 mt-4 mb-2">
          <Avatar>
            <AvatarImage src={creator.avatar_url} alt={creator.full_name} />
            <AvatarFallback>{creator.full_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-lg">{creator.full_name}</div>
            <div className="text-muted-foreground text-sm">Creator</div>
          </div>
        </div>
      )}

      {/* Actions row: Like/Save and Use Template */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
        <LikeButton
          itemId={template.id}
          itemType="template"
          initialLiked={isLiked}
          variant="outline"
          size="md"
          className="w-full sm:w-auto"
        />
        <UseTemplateButton
          templateId={template.id}
          templateSlug={template.slug}
          templateTitle={template.title}
          className="w-full flex justify-between items-center px-4 py-2 font-semibold text-base"
        />
      </div>

      {/* Placeholder for the rest of the content */}
      <div>Rest of the component content goes here...</div>
    </div>
  );
}
