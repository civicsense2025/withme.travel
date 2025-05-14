import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface PopularDestinationsProps {
  onSelect?: (destination: any) => void;
  interests?: string[];
  homeLocation?: string | null;
}

export function PopularDestinations({ onSelect, interests = [], homeLocation = null }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Base API URL
    let url = '/api/destinations/popular';
    
    // Add query parameters for personalization if available
    const params = new URLSearchParams();
    if (interests && interests.length > 0) {
      params.append('interests', interests.join(','));
    }
    if (homeLocation) {
      params.append('homeLocation', homeLocation);
    }
    
    // Add params to URL if any exist
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => setDestinations(data.destinations || []))
      .catch((err) => setError('Failed to load popular destinations'))
      .finally(() => setLoading(false));
  }, [interests, homeLocation]);

  // Generate heading text based on personalization
  const getHeadingText = () => {
    if (interests?.length > 0 && homeLocation) {
      return "Destinations Based on Your Interests";
    } else if (interests?.length > 0) {
      return "Destinations You Might Like";
    } else if (homeLocation) {
      return "Popular Destinations to Explore";
    } else {
      return "Popular Destinations";
    }
  };

  // Generate description text based on personalization
  const getDescriptionText = () => {
    if (interests?.length > 0 && homeLocation) {
      return `Personalized recommendations based on your interests and location`;
    } else if (interests?.length > 0) {
      return `Destinations that match your interests`;
    } else if (homeLocation) {
      return `Great places to visit from ${homeLocation}`;
    } else {
      return "Trending destinations loved by travelers";
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">Loading popular destinations…</div>
    );
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  if (destinations.length === 0) {
    return null; // Don't show anything if no destinations found
  }

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <h3 className="text-2xl font-semibold text-center">{getHeadingText()}</h3>
        <p className="text-muted-foreground text-center mt-1">{getDescriptionText()}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((dest) => (
          <Link 
            key={dest.id} 
            href={dest.slug ? `/destinations/${dest.slug}` : '#'}
            passHref
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition h-full"
              onClick={() => onSelect?.(dest)}
            >
              <div className="flex flex-col items-center p-4 h-full">
                <span className="text-3xl">{dest.emoji}</span>
                <div className="font-bold mt-2 text-center">{dest.name}</div>
                {dest.byline && (
                  <div className="text-xs text-muted-foreground text-center mt-1">{dest.byline}</div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
