'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ExternalLink, Check, Plus, X, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityIdea } from '@/utils/activity-generator';
import { useActivitySuggestions } from '@/hooks/useActivitySuggestions';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import type { BudgetCategory } from '@/utils/constants/status';

interface ActivityGeneratorWidgetProps {
  groupId: string;
  planId: string;
  destinationId: string;
  onAddIdea?: (idea: any) => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ActivityGeneratorWidget({
  groupId,
  planId,
  destinationId,
  onAddIdea,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: ActivityGeneratorWidgetProps) {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const { activities, keywords, isLoading, error, fetchActivities } = useActivitySuggestions();
  const [addedIdeas, setAddedIdeas] = useState<Set<string>>(new Set());
  const [destination, setDestination] = useState<any>(null);
  const [isAddingIdea, setIsAddingIdea] = useState(false);

  // Fetch destination details if needed
  useEffect(() => {
    async function loadDestination() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from('destinations')
          .select('name, description')
          .eq('id', destinationId)
          .single();

        if (error) throw error;
        setDestination(data);
      } catch (error) {
        console.error('Error loading destination:', error);
      }
    }

    if (destinationId) {
      loadDestination();
    }
  }, [destinationId]);

  // Generate activities when component loads
  useEffect(() => {
    if (destinationId && !isLoading && activities.length === 0) {
      fetchActivities(destinationId);
    }
  }, [destinationId, fetchActivities, activities.length, isLoading]);

  // Handle adding an idea to the whiteboard
  const handleAddIdea = async (activity: ActivityIdea) => {
    if (isAddingIdea) return;

    setIsAddingIdea(true);

    try {
      const ideaKey = `${activity.title}-${activity.category}`;

      // Create the group idea
      const idea = {
        title: activity.title,
        description: activity.description,
        tags: [activity.category.toLowerCase(), activity.activityType.toLowerCase()],
        metadata: {
          type: 'activity',
          category: activity.category,
          activityType: activity.activityType,
          duration: activity.duration,
          budgetCategory: activity.budgetCategory,
        },
      };

      // Call the provided callback if it exists
      if (onAddIdea) {
        await onAddIdea(idea);

        // Mark this idea as added
        setAddedIdeas((prev) => {
          const newSet = new Set(prev);
          newSet.add(ideaKey);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error adding idea:', error);
    } finally {
      setIsAddingIdea(false);
    }
  };

  const getBudgetCategoryLabel = (categoryValue: BudgetCategory) => {
    // categoryValue will be 'accommodation', 'food', etc.
    const valueToLabelMap: Record<BudgetCategory, string> = {
      accommodation: '🏨 Lodging',
      transportation: '🚆 Transport',
      food: '🍴 Food',
      activities: '🎟️ Activities',
      shopping: '🛍️ Shopping',
      other: '📌 Other',
    };
    return valueToLabelMap[categoryValue] || 'Other';
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

  // If the widget is collapsed, show a compact version
  if (isCollapsed) {
    return (
      <Card className="w-96 shadow-md">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            <CardTitle className="text-base">Activities Ideas</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {destination?.name ? (
            <p>Generate activity ideas for {destination.name}</p>
          ) : (
            <p>Generate personalized activity ideas</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="default" size="sm" className="w-full" onClick={onToggleCollapse}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Show Activity Generator
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          <CardTitle className="text-lg">Activity Ideas Generator</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardDescription className="px-6">
        {destination?.name ? (
          <p>Generate personalized activity ideas for {destination.name}</p>
        ) : (
          <p>Generate personalized activity ideas for your trip</p>
        )}
      </CardDescription>

      <div className="px-6 pt-2 flex justify-between items-center">
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 5).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                #{keyword}
              </Badge>
            ))}
            {keywords.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{keywords.length - 5} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewType === 'grid' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewType('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewType('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-purple"></div>
            <span className="ml-3">Generating personalized activities...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">Error: {error.message}</p>
            <Button onClick={() => fetchActivities(destinationId)}>Try Again</Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-70" />
            <p className="text-muted-foreground mb-4">No activity ideas generated yet</p>
            <Button onClick={() => fetchActivities(destinationId)}>Generate Ideas</Button>
          </div>
        ) : viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity, index) => {
              const ideaKey = `${activity.title}-${activity.category}`;
              const isAdded = addedIdeas.has(ideaKey);

              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{activity.title}</CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <span>{formatDuration(activity.duration)}</span>
                      <span className="mx-1">•</span>
                      <span>{getBudgetCategoryLabel(activity.budgetCategory)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="line-clamp-2">{activity.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={isAdded ? 'secondary' : 'default'}
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddIdea(activity)}
                      disabled={isAddingIdea || isAdded}
                    >
                      {isAdded ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Added to Board
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" /> Add to Board
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, index) => {
              const ideaKey = `${activity.title}-${activity.category}`;
              const isAdded = addedIdeas.has(ideaKey);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {activity.description}
                    </p>
                  </div>
                  <Button
                    variant={isAdded ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleAddIdea(activity)}
                    disabled={isAddingIdea || isAdded}
                  >
                    {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => fetchActivities(destinationId)}
          disabled={isLoading}
        >
          Generate More Ideas
        </Button>
      </CardFooter>
    </Card>
  );
}
