import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface PopularDestinationsProps {
  onSelect?: (destination: any) => void;
}

export function PopularDestinations({ onSelect }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/destinations/popular')
      .then((res) => res.json())
      .then((data) => setDestinations(data.destinations || []))
      .catch((err) => setError('Failed to load popular destinations'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">Loading popular destinations…</div>
    );
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Popular Destinations</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((dest) => (
          <Card
            key={dest.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => onSelect?.(dest)}
          >
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl">{dest.emoji}</span>
              <div className="font-bold mt-2">{dest.name}</div>
              {dest.byline && (
                <div className="text-xs text-muted-foreground text-center mt-1">{dest.byline}</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
