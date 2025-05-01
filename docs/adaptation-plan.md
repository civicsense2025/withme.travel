# WithMe.Travel Adaptation Plan

## Overview

This plan outlines how to adapt the existing WithMe.Travel codebase to leverage the enhanced database capabilities from our recent migrations while maintaining the core strengths of the current implementation.

## Database Migration Integration

### 1. Database Interface Layer (1 week)

Create adapter functions to connect the existing frontend to the new database schema:

```typescript
// src/lib/database/content-adapters.ts
import { supabase } from './supabase-client';

/**
 * Adapts the existing itinerary item creation to leverage content tracking
 */
export async function createItineraryItem(tripId: string, itemData: any) {
  // Set content layer to "original" for new items
  return supabase.from('itinerary_items').insert({
    ...itemData,
    trip_id: tripId,
    content_layer: 'original',
    attribution_type: 'original',
    created_by: await getCurrentUserId(),
  });
}

/**
 * Adapts sharing functionality to use the new copy_and_customize_item function
 */
export async function shareItineraryItem(
  sourceItemId: string,
  targetTripId: string,
  customizations?: any
) {
  return supabase.rpc('copy_and_customize_item', {
    p_source_item_id: sourceItemId,
    p_target_trip_id: targetTripId,
    p_user_id: await getCurrentUserId(),
    p_customizations: customizations || {},
  });
}

/**
 * Records popularity metrics when items are viewed
 */
export async function trackItemView(itemId: string) {
  return supabase.rpc('update_popularity_metrics', {
    p_item_id: itemId,
    p_action: 'view',
  });
}
```

### 2. User Preferences Integration (3 days)

Enhance user profile functionality to leverage preference system:

```typescript
// src/lib/database/user-preferences.ts
import { supabase } from './supabase-client';

export async function saveUserPreferences(preferences: any) {
  const userId = await getCurrentUserId();

  // Check if preferences already exist
  const { data } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (data?.id) {
    // Update existing preferences
    return supabase
      .from('user_preferences')
      .update({
        travel_styles: preferences.travelStyles || [],
        preferred_pace: preferences.pace || 'moderate',
        budget_range: `[${preferences.minBudget || 0},${preferences.maxBudget || 100000}]`,
        preferred_activity_types: preferences.activityTypes || [],
        preferred_times_of_day: preferences.timePreferences || ['09:00:00', '19:00:00'],
        updated_at: new Date(),
      })
      .eq('user_id', userId);
  } else {
    // Create new preferences
    return supabase.from('user_preferences').insert({
      user_id: userId,
      travel_styles: preferences.travelStyles || [],
      preferred_pace: preferences.pace || 'moderate',
      budget_range: `[${preferences.minBudget || 0},${preferences.maxBudget || 100000}]`,
      preferred_activity_types: preferences.activityTypes || [],
      preferred_times_of_day: preferences.timePreferences || ['09:00:00', '19:00:00'],
    });
  }
}

export async function getPersonalizedSuggestions(tripId: string, count = 5) {
  const userId = await getCurrentUserId();

  // Use calculate_preference_match for each item in the template
  const { data: templateItems } = await supabase
    .from('itinerary_template_items')
    .select('*')
    .order('popularity_score', { ascending: false })
    .limit(count * 3); // Get more than needed to filter

  // Calculate preference scores for each item
  const scoredItems = await Promise.all(
    templateItems.map(async (item) => {
      const { data: score } = await supabase.rpc('calculate_preference_match', {
        p_item_id: item.id,
        p_user_id: userId,
      });

      return {
        item,
        score,
      };
    })
  );

  // Sort by score and take top results
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((result) => result.item);
}
```

### 3. Template Application (4 days)

Leverage the new template system for quick trip creation:

```typescript
// src/lib/database/templates.ts
import { supabase } from './supabase-client';

export async function applyTemplateToTrip(templateId: string, tripId: string, options = {}) {
  const userId = await getCurrentUserId();

  return supabase.rpc('apply_template_to_trip', {
    p_template_id: templateId,
    p_trip_id: tripId,
    p_user_id: userId,
    p_options: options,
  });
}

export async function generateRandomItinerary(tripId: string, options = {}) {
  const userId = await getCurrentUserId();

  return supabase.rpc('generate_random_itinerary', {
    p_trip_id: tripId,
    p_user_id: userId,
    p_options: options,
  });
}
```

### 4. SEO Enhancement (2 days)

Adapt URL handling to leverage new SEO capabilities:

```typescript
// src/lib/seo/url-handlers.ts
import { supabase } from '../database/supabase-client';

export async function getCanonicalUrl(itemId: string, itemType = 'itinerary_item') {
  const { data } = await supabase
    .from(itemType === 'itinerary_item' ? 'itinerary_items' : 'trips')
    .select('canonical_url, slug')
    .eq('id', itemId)
    .single();

  return (
    data?.canonical_url ||
    `/${itemType === 'itinerary_item' ? 'items' : 'trips'}/${data?.slug || itemId}`
  );
}

export async function generateSlug(text: string, contentType: string, contentId: string) {
  const { data } = await supabase.rpc('generate_unique_slug', {
    input_text: text,
    content_type_val: contentType,
    content_id_val: contentId,
  });

  return data;
}
```

## UI Enhancements

### 1. Trip Creation Flow (3 days)

Enhance the existing trip creation flow with template selection:

```tsx
// Enhance the existing trip creation component with template options
<div className="mt-6 border-t pt-6">
  <h3 className="text-lg font-medium">Start with a Template</h3>
  <p className="text-sm text-gray-500">Jump-start your trip planning with a template</p>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
    {templates.map((template) => (
      <div
        key={template.id}
        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => selectTemplate(template.id)}
      >
        <h4 className="font-medium">{template.title}</h4>
        <p className="text-sm text-gray-500">{template.description}</p>
        <span className="text-xs text-blue-500 mt-2 block">{template.duration_days} days</span>
      </div>
    ))}
  </div>
</div>
```

### 2. Activity Recommendations (2 days)

Add a personalized recommendations component to the itinerary view:

```tsx
// New component for personalized recommendations
import React, { useEffect, useState } from 'react';
import { getPersonalizedSuggestions } from '@/lib/database/user-preferences';

export function PersonalizedSuggestions({ tripId, onAddActivity }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      setLoading(true);
      const data = await getPersonalizedSuggestions(tripId);
      setSuggestions(data);
      setLoading(false);
    }

    loadSuggestions();
  }, [tripId]);

  if (loading) {
    return <div className="p-4 text-center">Loading suggestions...</div>;
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-medium mb-3">Recommended for You</h3>

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white p-3 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">{suggestion.title}</h4>
              <p className="text-sm text-gray-500 truncate">{suggestion.description}</p>
            </div>

            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => onAddActivity(suggestion)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Content Sharing Button (1 day)

Add sharing capability to existing activity cards:

```tsx
// Enhancement to existing activity card component
function ActivityCard({ activity, tripId }) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [userTrips, setUserTrips] = useState([])

  // Existing component code...

  // Add sharing button to the actions menu
  <div className="relative">
    <button
      onClick={() => setShowShareOptions(!showShareOptions)}
      className="text-gray-500 hover:text-gray-700"
    >
      <ShareIcon className="h-5 w-5" />
    </button>

    {showShareOptions && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
        <div className="p-2">
          <h4 className="text-sm font-medium">Share to trip:</h4>
          {userTrips.map(trip => (
            <button
              key={trip.id}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded"
              onClick={() => {
                shareItineraryItem(activity.id, trip.id)
                setShowShareOptions(false)
              }}
            >
              {trip.name}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
}
```

## Performance Optimizations

### 1. Smart Data Fetching (2 days)

Update data fetching to use the new optimized database functions:

```typescript
// Modify existing trip loading functions to use optimized queries
export async function loadTripActivities(tripId: string) {
  // Use pagination and optimized query
  const { data, error } = await supabase
    .from('itinerary_items')
    .select(
      `
      id, 
      title, 
      description, 
      start_time, 
      end_time, 
      location, 
      day_number, 
      category,
      position,
      duration_minutes
    `
    )
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true })
    .order('position', { ascending: true });

  // Track views for popularity metrics
  if (data && data.length) {
    // Record views in background, don't wait
    Promise.all(data.map((item) => trackItemView(item.id))).catch(console.error);
  }

  return { data, error };
}
```

### 2. Data Prefetching (1 day)

Implement strategic data prefetching for common user flows:

```typescript
// In trip list component
useEffect(() => {
  // Prefetch user's trips
  supabase
    .from('trips')
    .select('id, name, start_date, end_date, destination_name, cover_image_url')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })
    .then(({ data }) => {
      if (data && data.length) {
        // For the most recent/upcoming trip, prefetch activities
        const nextTrip = data.find((trip) => new Date(trip.start_date) >= new Date()) || data[0];

        if (nextTrip) {
          // Prefetch in background
          loadTripActivities(nextTrip.id).catch(console.error);
        }
      }
    });
}, [userId]);
```

## Implementation Timeline

1. Week 1: Database Interface Layer & Template Application
2. Week 2: User Preferences & Activity Recommendations
3. Week 3: UI Enhancements & Content Sharing
4. Week 4: Testing, Optimization & Polish

## Next Steps

1. Review current codebase to identify specific integration points
2. Implement database adapter functions
3. Enhance UI with template selection and personalized recommendations
4. Add content sharing capabilities to activity cards
5. Optimize data fetching with new database functions
