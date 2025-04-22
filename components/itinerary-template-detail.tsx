"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface ItineraryDay {
  day_number: number
  items: {
    title: string
    description: string
    location: string
    start_time: string | null
    end_time: string | null
  }[]
}

interface ItineraryTemplateDetailProps {
  template: {
    id: string
    title: string
    slug: string
    description: string
    duration_days: number
    category: string
    days: ItineraryDay[]
    view_count: number
    use_count: number
    like_count: number
    created_at: string
    destinations: {
      id: string
      name: string
      country: string
      image_url: string
      latitude: number
      longitude: number
    }
    users: {
      id: string
      full_name: string
      avatar_url: string
    }
  }
  isLiked?: boolean
}

export function ItineraryTemplateDetail({ template, isLiked = false }: ItineraryTemplateDetailProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(template.like_count);
  const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [tripTitle, setTripTitle] = useState(template.title);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/itineraries/${template.slug}/like`, {
        method: liked ? 'DELETE' : 'POST',
      });
      
      if (response.ok) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  const handleUseTemplate = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Missing dates",
        description: "Please select a start and end date for your trip.",
        variant: "destructive",
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
          title: "Success!",
          description: "Your trip has been created from this template.",
        });
        setIsUseDialogOpen(false);
        router.push(`/trips/${data.trip_id}`);
      } else {
        throw new Error(data.error || 'Failed to create trip');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trip",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/itineraries/${template.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "The link to this template has been copied to your clipboard.",
    });
    setIsShareDialogOpen(false);
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
        <Image
          src={template.destinations.image_url || '/placeholder.svg?height=800&width=1200&query=travel destination'}
          alt={template.title}


\
