# Trips Feature

This directory (`app/trips`) contains the primary frontend code for the trip planning and management features of withme.travel.

## Overview

The Trips section allows users to create, view, manage, and collaborate on travel itineraries. It's a core part of the application, encompassing detailed trip views, itinerary planning, member management, real-time collaboration, and more.

## Directory Structure

```
app/trips/
├── [tripId]/             # Detailed view for a specific trip
│   ├── add-item/         # (Likely) Page/component for adding new itinerary items
│   ├── components/       # UI components specific to the trip detail page
│   │   ├── tab-contents/ # Components for different tabs (Itinerary, Budget, etc.)
│   │   ├── TripBudget/   # Budgeting specific components
│   │   ├── TripHeader/   # Header section of the trip page
│   │   ├── TripItinerary/# Itinerary specific components
│   │   ├── TripManage/   # Member/settings management components
│   │   ├── TripNotes/    # Notes specific components
│   │   ├── TripPresence/ # Real-time presence display components
│   │   └── TripSheets/   # (Purpose TBD, possibly related to spreadsheets/data)
│   ├── context/          # React Context providers for trip data/state
│   │   └── trip-data-provider.tsx # Main data provider using SWR
│   │   └── trip-error-boundary.tsx # Error boundary for trip page
│   ├── edit/             # Page for editing core trip details
│   ├── hooks/            # Hooks specific to the trip detail page
│   │   └── use-trip-presence.ts # Hook managing presence connection state for the trip
│   ├── itinerary/        # Sub-routes related to specific itinerary items
│   │   └── [itemId]/     # View/edit specific itinerary item details
│   │       └── edit/     # Page for editing a specific itinerary item
│   ├── manage/           # Page for managing trip settings/members
│   ├── validation/       # Zod schemas or validation logic for trip forms
│   └── page.tsx          # Main entry point for the trip detail page
├── components/           # Reusable components used across different trip pages (e.g., list, create)
├── create/               # Pages and components related to the trip creation flow
│   ├── components/       # Components specific to the create trip form
│   ├── success/          # Page shown after successful trip creation
│   └── page.tsx          # Main entry point for the trip creation page
├── public/               # Pages for publicly viewable trips
│   └── [slug]/           # Page displaying a public trip by its slug
├── utils/                # Utility functions specific to the trips feature
├── page.tsx              # Main entry point for the "/trips" page (list of user's trips)
├── trips-client.tsx      # Client component handling logic for the trips list page
└── README.md             # This file
```

## Key Features & Components

*   **Trip Listing (`page.tsx`, `trips-client.tsx`):** Displays the user's trips.
*   **Trip Creation (`create/`):** Multi-step form or process to create a new trip.
*   **Trip Detail View (`[tripId]/page.tsx`):** The main hub for viewing a trip, typically using a tabbed interface (`[tripId]/components/tab-contents/`) to display Itinerary, Members, Budget, Notes, etc.
*   **Data Fetching (`[tripId]/context/trip-data-provider.tsx`):** Uses SWR to fetch and manage trip data, itinerary, members, etc., providing data to the rest of the trip detail page. Includes optimistic update capabilities.
*   **Itinerary Management (`[tripId]/components/TripItinerary/`, `hooks/useItineraryItems.ts`):** Handles displaying, adding, editing, and organizing itinerary items.
*   **Member Management (`[tripId]/manage/`, `[tripId]/components/TripManage/`):** Allows inviting users and managing roles.
*   **Real-time Collaboration (`hooks/use-presence.ts`, `[tripId]/hooks/use-trip-presence.ts`, `components/presence/`, `[tripId]/components/TripPresence/`):** Integrates with the global presence system to show active users, cursors, and editing status within the context of a trip. Includes connection state management and recovery logic.
*   **Error Handling (`[tripId]/context/trip-error-boundary.tsx`, `components/error-fallbacks/`):** Provides specific error boundaries and fallback UIs for issues encountered while loading or interacting with trip data.

## Related Code

*   **API Routes:** `app/api/trips/`
*   **Global Components:** `components/trips/`
*   **Global Hooks:** `hooks/use-trips.ts`, `hooks/useItineraryItems.ts`, `hooks/use-presence.ts`
*   **Types:** `types/database.types.ts`, `types/presence.ts`
*   **Constants:** `utils/constants/database.ts`, `utils/constants/routes.ts`, `utils/constants/status.ts`

## Status & Future Work

*   The core functionality for trip creation, viewing, itinerary management, member management, and real-time presence is largely implemented.
*   Features like Budgeting and Voting/Polls have backend support but may require further frontend implementation or refinement.
*   Public trip pages exist but their exact functionality should be verified.
*   Ongoing work may involve refining the real-time collaboration experience, improving error handling edge cases, and potentially enhancing features like budgeting or notes.
*   Review API routes under `app/api/trips/[tripId]/` like `role-fix` or `fix-membership` to ensure underlying logic is stable. 