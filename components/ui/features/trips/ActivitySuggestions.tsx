'use client';

import { useState, useEffect } from 'react';
import { useActivitySuggestions } from '@/hooks/useActivitySuggestions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock, Plus, MapPin, Tag, Check, Loader2 } from 'lucide-react';
import { ENUMS } from '@/utils/constants/database';
import { BUDGET_CATEGORIES } from '@/utils/constants/status';

interface ActivitySuggestionsProps {
  destinationId: string;
  tripId?: string;
  onSelectActivities?: (selectedActivities: any[]) => void;
}

export function ActivitySuggestions({
  destinationId,
  tripId,
  onSelectActivities,
}: ActivitySuggestionsProps) {
  const {
    activities,
    keywords,
    isLoading,
    error,
    fetchActivities,
    selectActivity,
    selectedActivities,
  } = useActivitySuggestions();

  useEffect(() => {
    if (destinationId) {
      fetchActivities(destinationId, tripId);
    }
  }, [destinationId, tripId, fetchActivities]);

  useEffect(() => {
    if (onSelectActivities) {
      onSelectActivities(selectedActivities);
    }
  }, [selectedActivities, onSelectActivities]);

  const getBudgetCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      [BUDGET_CATEGORIES.FOOD]: '🍴 Food',
      [BUDGET_CATEGORIES.ACTIVITIES]: '🎟️ Activities',
      [BUDGET_CATEGORIES.TRANSPORTATION]: '🚆 Transport',
      [BUDGET_CATEGORIES.SHOPPING]: '🛍️ Shopping',
      [BUDGET_CATEGORIES.ACCOMMODATION]: '🏨 Lodging',
      [BUDGET_CATEGORIES.OTHER]: '📌 Other',
    };

    return labels[category] || 'Other';
  };

  const formatDuration = (hours: number) => {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);

    if (fullHours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${fullHours} hr`;
    } else {
      return `${fullHours} hr ${minutes} min`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-travel-purple" />
        <span className="ml-3 text-lg">Generating personalized activities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md my-4">
        <p className="text-red-500 font-medium">Error loading activities: {error.message}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => fetchActivities(destinationId, tripId)}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground mb-3">No activities generated yet</p>
        <Button onClick={() => fetchActivities(destinationId, tripId)}>Generate Activities</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">Personalized Activity Ideas</h3>
        <p className="text-muted-foreground">Select activities to add to your trip itinerary</p>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.slice(0, 8).map((keyword) => (
            <Badge key={keyword} variant="outline" className="text-xs">
              #{keyword}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity, index) => {
          const isSelected = selectedActivities.some(
            (a) => a.title === activity.title && a.category === activity.category
          );

          return (
            <Card
              key={index}
              className={`transition-all ${isSelected ? 'ring-2 ring-travel-purple ring-offset-2' : ''}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{activity.title}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <Clock className="h-3 w-3 mr-1" /> {formatDuration(activity.duration)}
                  <span className="mx-2">•</span>
                  <Tag className="h-3 w-3 mr-1" /> {getBudgetCategoryLabel(activity.budgetCategory)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => selectActivity(activity)}
                >
                  {isSelected ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Trip
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={() => fetchActivities(destinationId, tripId)}>
          Generate More Activities
        </Button>
      </div>
    </div>
  );
}
