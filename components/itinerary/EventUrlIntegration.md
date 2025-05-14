# EventUrlInput Component Integration Guide

This guide explains how to integrate the `EventUrlInput` component with the existing trip itinerary system.

## Component Overview

The `EventUrlInput` component allows users to paste an event URL (such as Eventbrite, Ticketmaster, etc.) to add its details to the trip itinerary. The component:

1. Takes a URL input from the user
2. Scrapes the event data using the `/api/trips/[tripId]/itinerary/scrape-url` endpoint
3. Shows a preview of the event data
4. Allows the user to add the event to the itinerary

## Integration Options

### Option 1: Add to ItineraryTab Component

The most straightforward integration is to add the component to the existing `ItineraryTab` component, which is used in trip pages.

```tsx
// components/itinerary/itinerary-tab.tsx

// Add the import
import { EventUrlInput } from '@/components/itinerary/event-url-input';

// Inside the ItineraryTab component render function, add this before or after the filter controls:
{
  canEdit && (
    <div className="mb-4 border rounded-lg p-4 bg-muted/30">
      <h3 className="text-base font-medium mb-2">Add Event from URL</h3>
      <EventUrlInput
        tripId={tripId}
        userId={userId}
        onEventAdded={handleItemAdded}
        dayNumber={filter.day !== 'all' ? Number(filter.day) : undefined}
      />
    </div>
  );
}
```

### Option 2: Add to the Trip Page

Alternatively, add it as a separate component in the trip page:

```tsx
// app/trips/[tripId]/itinerary/page.tsx

// Add this inside the page component where appropriate:
{
  canEdit && (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add Event from URL</CardTitle>
        <CardDescription>Paste an event URL to quickly add it to your itinerary</CardDescription>
      </CardHeader>
      <CardContent>
        <EventUrlInput
          tripId={params.tripId}
          userId={user?.id || ''}
          onEventAdded={(newItem) => {
            // Update the itinerary items
            setAllItineraryItems((prev) => [...prev, newItem]);
            toast({
              title: 'Event Added',
              description: 'The event has been added to your itinerary.',
            });
          }}
        />
      </CardContent>
    </Card>
  );
}
```

### Option 3: Create a Custom Sheet or Modal

For a more advanced UI, create a custom sheet or modal to show the component:

```tsx
// components/itinerary/add-event-url-sheet.tsx
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LinkIcon, Plus } from 'lucide-react';
import { EventUrlInput } from '@/components/itinerary/event-url-input';
import { DisplayItineraryItem } from '@/types/itinerary';

interface AddEventUrlSheetProps {
  tripId: string;
  userId: string;
  onEventAdded: (newItem: DisplayItineraryItem) => void;
  dayNumber?: number;
}

export function AddEventUrlSheet({
  tripId,
  userId,
  onEventAdded,
  dayNumber,
}: AddEventUrlSheetProps) {
  const [open, setOpen] = useState(false);

  const handleEventAdded = (newItem: DisplayItineraryItem) => {
    onEventAdded(newItem);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <LinkIcon className="h-4 w-4 mr-2" />
          Add from URL
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add Event from URL</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <EventUrlInput
            tripId={tripId}
            userId={userId}
            onEventAdded={handleEventAdded}
            dayNumber={dayNumber}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

Then use this component in the appropriate places:

```tsx
<AddEventUrlSheet
  tripId={tripId}
  userId={userId}
  onEventAdded={handleItemAdded}
  dayNumber={dayNumber}
/>
```

## Handling the onEventAdded Callback

The `onEventAdded` callback is used to update the UI when an event is added. It should be connected to the appropriate state update function based on where you integrate the component:

1. If using with `useTripItinerary` hook, connect to the `handleItemAdded` function
2. If using in a standalone component, update your local state to include the new item

## Permissions

The EventUrlInput component assumes the user has permission to add items to the trip. Make sure you only render it for users with the correct permissions (admin, editor, or contributor roles).

```tsx
// Check user permissions before rendering
const canEdit = userRole === DB_ENUMS.TRIP_ROLES.ADMIN ||
                userRole === DB_ENUMS.TRIP_ROLES.EDITOR ||
                userRole === DB_ENUMS.TRIP_ROLES.CONTRIBUTOR;

{canEdit && <EventUrlInput ... />}
```

## Handling Day Selection

You can optionally pass a `dayNumber` prop to the EventUrlInput component to specify which day the event should be added to. This works well with the filtering UI:

```tsx
// Example: Connect day selection from filters to EventUrlInput
<EventUrlInput
  tripId={tripId}
  userId={userId}
  onEventAdded={handleItemAdded}
  dayNumber={filter.day !== 'all' ? Number(filter.day) : undefined}
/>
```

If `dayNumber` is not provided, the event will be added to the unscheduled items.
