'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useActivitySuggestions } from '@/hooks/useActivitySuggestions';
import { Lightbulb, ArrowRight, Loader2 } from 'lucide-react';

interface ActivitySuggestionsCardProps {
  destinationId: string;
  tripId?: string;
  onComplete?: () => void;
  showTotalActivities?: number;
}

/**
 * A card component that shows sample activity suggestions for a destination
 * Designed to be used in trip creation flows as a teaser
 */
export function ActivitySuggestionsCard({
  destinationId,
  tripId,
  onComplete,
  showTotalActivities = 3,
}: ActivitySuggestionsCardProps) {
  const { activities, isLoading, error, fetchActivities } = useActivitySuggestions();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    // Only fetch automatically if this is the first load
    if (!hasLoadedOnce && destinationId) {
      fetchActivities(destinationId, tripId);
      setHasLoadedOnce(true);
    }
  }, [destinationId, tripId, fetchActivities, hasLoadedOnce]);

  const handleClickContinue = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          Activity Ideas
        </CardTitle>
        <CardDescription>Personalized suggestions for your trip</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Generating activity ideas...
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">Couldn't load activities</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivities(destinationId, tripId)}
            >
              Try Again
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">
              We'll suggest activities based on your destination
            </p>
            <Button size="sm" onClick={() => fetchActivities(destinationId, tripId)}>
              Generate Ideas
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, showTotalActivities).map((activity, index) => (
              <div
                key={index}
                className="flex items-center border rounded-md p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium mb-1">{activity.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}

            {activities.length > showTotalActivities && (
              <p className="text-sm text-center text-muted-foreground">
                +{activities.length - showTotalActivities} more activities available
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchActivities(destinationId, tripId)}
          disabled={isLoading}
        >
          Refresh Ideas
        </Button>

        {tripId ? (
          <Button asChild size="sm">
            <Link href={`/trips/${tripId}/add-activity`}>
              Add Activities <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="sm" onClick={handleClickContinue}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
