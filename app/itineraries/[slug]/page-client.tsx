'use client';

import React from 'react';
import { ItineraryTemplateDisplay } from '@/components/itinerary/itinerary-template-display';
import { UseTemplateButton } from '@/components/use-template-button';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

// Define types to match the server component and database schema
interface ItineraryTemplateItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  item_order: number;
}

interface ItineraryTemplateSection {
  id: string;
  title: string;
  day_number: number;
  position: number;
  items: ItineraryTemplateItem[];
}

interface ItineraryTemplate {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  destination_id: string;
  duration_days: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  view_count: number;
  like_count: number;
  tags: string[];
  created_by: string;
  metadata: Record<string, any>;
  destination?: {
    id: string;
    city: string;
    country: string;
    image_url: string | null;
  };
}

interface ItineraryTemplatePageClientProps {
  template: ItineraryTemplate;
  sections: ItineraryTemplateSection[];
}

export default function ItineraryTemplatePageClient({
  template,
  sections,
}: ItineraryTemplatePageClientProps) {
  const { toast } = useToast();

  console.log(
    `[DEBUG] ItineraryTemplatePageClient - template.id: ${template.id}, title: ${template.title}`
  );
  console.log(`[DEBUG] ItineraryTemplatePageClient - Received ${sections.length} sections`);

  // Log sections info
  if (sections.length === 0) {
    console.log('[DEBUG] ItineraryTemplatePageClient - No sections found for this template');
  } else {
    sections.forEach((section) => {
      console.log(
        `[DEBUG] ItineraryTemplatePageClient - Section: ${section.id}, day: ${section.day_number}, items: ${section.items?.length || 0}`
      );
    });
  }

  const handleShareItinerary = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: template.title,
          text: template.description || `Check out this ${template.duration_days}-day itinerary!`,
          url,
        })
        .catch((error) => {
          // Only log errors other than AbortError (which happens when user cancels share)
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            console.error('Error sharing:', error);
          }
        });
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast({
            title: 'Link copied!',
            description: 'The link to this itinerary has been copied to your clipboard.',
          });
        })
        .catch((error) => {
          console.error('Error copying link:', error);
          toast({
            title: 'Error copying link',
            description: 'Please try again or copy the URL manually.',
            variant: 'destructive',
          });
        });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <ItineraryTemplateDisplay template={template} sections={sections} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Use This Itinerary</h3>
              <p className="text-sm text-muted-foreground">
                Create a trip based on this itinerary to customize it for your own adventure.
              </p>

              <UseTemplateButton
                templateId={template.id}
                templateSlug={template.slug}
                templateTitle={template.title}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <Button variant="outline" size="sm" onClick={handleShareItinerary} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">About This Itinerary</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{template.duration_days} days</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="font-medium">{template.view_count || 0}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(template.created_at).toLocaleDateString()}</p>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-muted rounded-full px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
