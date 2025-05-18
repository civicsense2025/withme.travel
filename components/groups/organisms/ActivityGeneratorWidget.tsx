/**
 * ActivityGeneratorWidget
 * 
 * A widget that generates activity ideas for group plans based on destination.
 * 
 * @module groups/organisms
 */

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

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ActivityGeneratorWidgetProps {
  /** ID of the group the activity is for */
  groupId: string;
  /** ID of the plan the activity is for */
  planId: string;
  /** ID of the destination to generate activities for */
  destinationId: string;
  /** Handler called when an idea is added */
  onAddIdea?: (idea: any) => void;
  /** Handler called when the widget is closed */
  onClose?: () => void;
  /** Whether the widget is collapsed */
  isCollapsed?: boolean;
  /** Handler called when the collapse state is toggled */
  onToggleCollapse?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
            <Button variant="outline" onClick={() => fetchActivities(destinationId)}>
              Retry
            </Button>
          </div>
        ) : (
          <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {activities.map((activity) => {
              const ideaKey = `${activity.title}-${activity.category}`;
              const isAdded = addedIdeas.has(ideaKey);

              return (
                <div 
                  key={ideaKey}
                  className={`${
                    viewType === 'grid' 
                      ? 'rounded-lg border p-3 hover:shadow-sm transition-shadow bg-white' 
                      : 'flex items-start gap-3 border-b pb-4'
                  } ${isAdded ? 'opacity-50' : ''}`}
                >
                  <div className={viewType === 'grid' ? '' : 'flex-1'}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="mb-1 text-xs">{activity.category}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(activity.duration)}
                      </Badge>
                    </div>
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="mt-auto">
                      <Badge variant="outline" className="text-xs">
                        {getBudgetCategoryLabel(activity.budgetCategory)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant={isAdded ? "secondary" : "default"}
                    className={`${viewType === 'grid' ? 'w-full mt-3' : 'flex-shrink-0'} h-8`}
                    onClick={() => handleAddIdea(activity)}
                    disabled={isAdded || isAddingIdea}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add to Board
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => fetchActivities(destinationId)}>
          Generate More Ideas
        </Button>
      </CardFooter>
    </Card>
  );
} 