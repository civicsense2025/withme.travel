import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOpenGraphImageForDestination } from '@/lib/hooks/use-og-image';
import DestinationClientPage from './destination-client-page';

interface Destination {
  id: string;
  name: string;
  city: string;
  state_province: string | null;
  country: string;
  continent: string;
  description: string;
  best_season: string;
  avg_cost_per_day: number;
  local_language: string;
  time_zone: string;
  cuisine_rating: number;
  cultural_attractions: number;
  nightlife_rating: number;
  family_friendly: boolean;
  outdoor_activities: number;
  beach_quality: number | null;
  shopping_rating: number;
  safety_rating: number;
  wifi_connectivity: number;
  public_transportation: number;
  eco_friendly_options: number;
  walkability: number;
  instagram_worthy_spots: number;
  off_peak_appeal: number;
  digital_nomad_friendly: number;
  lgbtq_friendliness: number;
  accessibility: number;
  highlights: string;
  tourism_website: string;
  image_url: string;
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
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    // Fetch destination data from API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel'}/api/destinations/by-slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          title: 'Destination Not Found',
          description: 'The requested destination could not be found.'
        };
      }
      throw new Error(`Failed to fetch destination: ${response.status}`);
    }
    
    const data = await response.json();
    const destination: Destination = data.destination;
    
    if (!destination) {
      return {
        title: 'Destination Not Found',
        description: 'The requested destination could not be found.'
      };
    }
    
    // Craft metadata for SEO
    const title = `${destination.city}, ${destination.country} | WithMe Travel`;
    const description = destination.description 
      ? destination.description.substring(0, 160) 
      : `Discover ${destination.city}, ${destination.country}. Plan your perfect trip with WithMe Travel.`;
    
    // Generate Open Graph image
    const ogImages = getOpenGraphImageForDestination({
      city: destination.city,
      country: destination.country,
      imageUrl: destination.image_url,
      description: description.substring(0, 100)
    });
    
    return {
      title,
      description,
      openGraph: {
        title: `${destination.city}, ${destination.country}`,
        description,
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${destination.city}, ${destination.country}`,
        description,
        images: ogImages.map(img => img.url),
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel'}/destinations/${slug}`
      }
    };
  } catch (error) {
    console.error('Error generating destination metadata:', error);
    return {
      title: 'Explore Destinations | WithMe Travel',
      description: 'Discover amazing destinations and plan your next trip with WithMe Travel.'
    };
  }
}

// Server component that passes data to client component
export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Now we've moved the destination fetching to the metadata function
  // We'll just pass the slug to the client component for it to fetch again
  // This avoids issues with RSC serialization and allows client-side interactivity
  
  if (!slug) {
    return notFound();
  }
  
  return <DestinationClientPage slug={slug} />;
}
