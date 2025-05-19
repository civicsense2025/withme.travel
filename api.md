# withme.travel API Implementation Status

This document tracks the status of the API implementation across different modules. It provides an overview of completed work and pending features.

## Architecture Overview

The withme.travel API is structured around a modular architecture:

1. **API Modules**: Feature-specific modules in `/lib/api/` containing CRUD operations and specialized functions
2. **Client Wrappers**: Frontend API client wrappers in `/lib/client/` for type-safe API calls
3. **Shared Types**: Common types and interfaces defined in `/lib/api/_shared.ts`
4. **Result Pattern**: Standardized `Result<T>` return type for consistent error handling
5. **React Hooks**: Custom React hooks in `/hooks/` that leverage client wrappers for state management

## Implementation Status

| Resource     | API Module  | Client Wrapper | React Hook  | Notes                                                                           |
| ------------ | ----------- | -------------- | ----------- | ------------------------------------------------------------------------------- |
| Trips        | ✅ Complete | ✅ Complete    | ✅ Complete | Core CRUD operations                                                            |
| Itinerary    | ✅ Complete | ✅ Complete    | ✅ Complete | Complex nested data                                                             |
| Notes        | ✅ Complete | ✅ Complete    | ✅ Complete | Collaborative editing support                                                   |
| Comments     | ✅ Complete | ✅ Complete    | ✅ Complete | Includes replies and reactions                                                  |
| Trip Members | ✅ Complete | ✅ Complete    | ✅ Complete | Member management and access control                                            |
| Destinations | ✅ Complete | ✅ Complete    | ✅ Complete | City guides and location data                                                   |
| Groups       | ✅ Complete | ✅ Complete    | ✅ Complete | Group management with member roles                                              |
| Group Plans  | ✅ Complete | ✅ Complete    | ✅ Complete | ✅ Fully atomized UI components with centralized API                            |
| Group Ideas  | ✅ Complete | ✅ Complete    | ✅ Complete | ✅ Interactive idea board with voting                                           |
| Votes        | ✅ Complete | ✅ Complete    | ✅ Complete | ✅ Fully integrated voting system                                               |
| Tags         | ✅ Complete | ✅ Complete    | ✅ Complete | Fully implemented with proper typing                                            |
| Activities   | ✅ Complete | ✅ Complete    | ✅ Complete | Includes suggestion and voting systems                                          |
| Expenses     | ✅ Complete | ✅ Complete    | ✅ Complete | ✅ Fully integrated across backend and UI, with client wrapper, hook, and tests |
| Places       | ✅ Complete | ✅ Complete    | ✅ Complete | Full CRUD operations with search capabilities                                   |

## Implementation Priorities

1. **High Priority**:

   - ✅ Trips API Client & Hook
   - ✅ Itinerary API Client & Hook
   - ✅ Notes API Client & Hook - Create unified API client and hook for collaborative notes
   - ✅ Places API Client & Hook

2. **Medium Priority**:

   - ✅ Groups API Client & Hook
   - ✅ Group Plans API Client & Hook
   - ✅ Group Ideas API Client & Hook
   - ✅ Trip Members API Client & Hook
   - ✅ Logistics API Client & Hook

3. **Lower Priority**:
   - ✅ Expenses API Client & Hook
   - Authentication improvements
   - Permissions API Client & Hook

## Standardization Guidelines

All new API integrations should follow these standards:

1. **API Module Structure**:

   - Use feature-specific modules in `/lib/api/`
   - Export typed functions with clear parameter definitions
   - Use `Result<T>` return type pattern

2. **Client Wrapper Structure**:

   - Create a module in `/lib/client/` with matching name
   - Re-export from `/lib/client/index.ts`
   - Use the standardized error handling with `tryCatch` and `handleApiResponse`

3. **React Hook Structure**:

   - Create a hook in `/hooks/use-[feature].ts`
   - Include state management and utility functions
   - Provide proper loading/error state handling
   - Use toast notifications for user feedback

4. **Typing Requirements**:
   - All API parameters and return types must be explicitly typed
   - Use TypeScript interfaces/types for models
   - Document functions with JSDoc comments

## Next Steps

1. ✅ Implement client wrapper and hook for Trips API
2. ✅ Implement client wrapper and hook for Destinations API
3. ✅ Implement client wrapper and hook for Places API
4. ✅ Implement client wrapper and hook for Trip Members API
5. ✅ Implement client wrapper and hook for Comments API
6. Update routes.ts to include missing API routes
7. Refactor existing components to use the new hooks
8. Add tests for API integrations

## Recent Changes

- 2023-10-10: Standardized the Tags API client and hook
- 2023-10-10: Created the Comments API client and hook
- 2023-10-10: Added Activities API client and hook
- 2023-10-10: Updated API constants in api.ts to avoid route duplication with routes.ts
- 2023-10-10: Improved error handling in client API wrappers
- 2023-10-10: Implemented Trips API client and hook
- 2023-10-12: Implemented Tasks API client and hook
- 2023-10-12: Added isSuccess type guard to Result pattern for type safety
- 2023-10-12: Updated routes.ts to include tasks endpoints
- 2024-06-XX: Implemented Expenses API client wrapper and React hook
- 2024-06-XX: Fully integrated Expenses across UI components, migrated budget tab to use the new hook
- 2024-06-XX: Completed Expenses implementation with test coverage and removed legacy code
- 2024-06-XX: Completed Tasks API integration with route handlers
- 2024-06-XX: Added tagging and voting support to Tasks API
- 2024-06-XX: Enhanced Tasks API with personal and group task management
- 2024-06-XX: Documented Group Plans and Group Ideas API integration
- 2024-06-XX: Verified Group Ideas voting functionality and optimistic updates
- 2024-06-XX: Improved error handling across all API hooks
- 2024-06-XX: Implemented Places API client hook with full CRUD operations
- 2024-06-XX: Implemented Trip Members API client hook with invitation and management features
- 2024-06-XX: Implemented Comments API client hook with replies and reactions support

## Client-Side Integration Progress

Client-side API integration follows these steps for each module:

1. **Create Client API Module**: Implement a type-safe client wrapper in `/lib/client/[module].ts`
2. **Implement React Hook**: Create a custom React hook in `/hooks/use-[module].ts`
3. **Integrate in Components**: Update UI components to use the new hook
4. **Write Tests**: Add tests for the client wrapper and hook

### Completed Modules

#### Tasks API

- ✅ Client wrapper in `/lib/client/tasks.ts`
- ✅ React hook in `/hooks/use-tasks.ts`
- ✅ UI components in `/components/ui/features/tasks/`
  - ✅ `TaskManager` - Complete task management with CRUD, assignment, and tagging
  - ✅ `TaskList` - Filterable/sortable list with loading states
  - ✅ `TaskItem` - Individual task with actions
- ✅ Support for both personal and group tasks
- ✅ Optimistic updates for better UX
- ✅ Complete loading states for all operations

#### Group Plans API

- ✅ Client wrapper in `/lib/client/groupPlans.ts`
- ✅ React hook in `/hooks/use-group-plans.ts`
- ✅ Integrated with group plans page (`/app/groups/[id]/plans/plans-client.tsx`)
- ✅ CRUD operations for group plans
- ✅ Error handling with toast notifications
- ✅ Optimistic updates for better UX
- ✅ Atomized components following the atomic design pattern:
  - ✅ Molecules: `GroupPlanIdea`, `GroupPlanActivity`
  - ✅ Organisms: `GroupPlanCard`
- ✅ Standardized API implementation in `/lib/api/groups.ts`

#### Group Ideas API

- ✅ Client integration through `/lib/client/groupPlans.ts`
- ✅ React hook in `/hooks/use-group-ideas.ts`
- ✅ Integration with interactive idea board (`/app/groups/[id]/plans/[slug]/idea-board.tsx`)
- ✅ Support for creating, updating, and deleting ideas
- ✅ Voting integration via `useVotes` hook
- ✅ Optimistic updates for real-time feel

#### Tags API

- ✅ Client wrapper in `/lib/client/tags.ts`
- ✅ React hook in `/hooks/use-tags.ts`
- ✅ Standardized Result pattern
- ✅ Type-safe API calls
- ✅ Error handling

#### Comments API

- ✅ Client wrapper in `/lib/client/comments.ts`
- ✅ React hook in `/hooks/use-comments.ts`
- ✅ Support for replies and nested comments
- ✅ Error handling with toasts
- ✅ Optimistic UI updates

#### Tasks API

- ✅ Client wrapper in `/lib/client/tasks.ts`
- ✅ React hook in `/hooks/use-tasks.ts`
- ✅ CRUD operations plus specialized task functions
- ✅ Loading state tracking for all operations
- ✅ Comprehensive error handling with toasts
- ✅ Support for personal and group tasks
- ✅ Integrated with route handlers (API endpoints)
- ✅ Updated routes in routes.ts
- ✅ Complete tagging and voting integration

### Next Planned Modules

1. **Destinations API**: CRUD operations and search
2. **Places API**: Location and place data operations
3. **Trip Members API**: Member management and permissions

### Client Integration Plan

To continue the client API integration effort, we'll follow this approach for each remaining module:

1. **Evaluate Current State**:

   - Check for existing direct API calls in components
   - Identify components that should use the API

2. **Implement Client Wrapper** (if not already done):

   - Create structured client wrapper in `/lib/client/`
   - Ensure proper typing and error handling
   - Follow established patterns

3. **Create React Hook**:

   - Build custom hook to manage state and API calls
   - Implement optimistic updates for better UX
   - Add comprehensive error handling

4. **Update Components**:

   - Replace direct API calls with hook usage
   - Implement loading states and error handling UI
   - Ensure consistent patterns across the app

5. **Testing & Documentation**:
   - Add tests for both client wrapper and hook
   - Update API documentation
   - Create usage examples

## Standardization Guidelines

When implementing new client API modules, follow these patterns:

### 1. Client API Module Structure

```typescript
// lib/client/[module].ts

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';

export async function listItems(): Promise<Result<Item[]>> {
  return tryCatch(
    fetch(API_ROUTES.MODULE.LIST, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Item[]>(response))
  );
}

// Additional CRUD methods...
```

### 2. React Hook Structure

```typescript
// hooks/use-[module].ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import { listItems, createItem, updateItem, deleteItem } from '@/lib/client/[module]';

export function useModule(params) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Implementation...

  return {
    items,
    isLoading,
    error,
    // Additional methods...
  };
}
```

## Best Practices

- Use the Result pattern for all API calls
- Properly type all parameters and return values
- Handle loading states and errors consistently
- Use optimistic UI updates where appropriate
- Follow the established naming conventions
- Update API_ROUTES in constants
- Update this document when adding new modules

## API Client Integration

We've implemented a standardized approach for frontend components to interact with backend API services:

### Result Pattern

A standardized `Result<T>` type for consistent error handling between backend and frontend:

```typescript
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };
```

### Client Wrappers

Client-side wrapper modules in `/lib/client/` that provide type-safe access to the API:

```typescript
// Example: /lib/client/trips.ts
export async function getTrip(tripId: string): Promise<Result<Trip>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_DETAILS(tripId), {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trip');
      }
      return response.json();
    })
  );
}
```

### React Hooks

Custom React hooks that leverage the client wrappers for state management:

```typescript
// Example: /hooks/use-trips.ts
export function useTrips(includeShared = false) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trips on mount
  useEffect(() => {
    async function fetchTrips() {
      setIsLoading(true);
      const result = await listTrips(includeShared);

      if (isSuccess(result)) {
        setTrips(result.data.trips);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    }

    fetchTrips();
  }, [includeShared]);

  return { trips, isLoading, error };
}
```

## Recent Integration Progress

### Completed Integrations

1. **Trips Module**:

   - ✅ Created client-side API wrapper in `lib/client/trips.ts`
   - ✅ Created React hook in `hooks/use-trips.ts`
   - ✅ Updated TripContext to use the API client
   - ✅ Fixed type issues between backend and frontend interfaces
   - ✅ Added mapping between different property names (city_id/destination_id)

2. **Groups Module**:

   - ✅ Created client-side API wrapper in `lib/client/groups.ts`
   - ✅ Created React hook in `hooks/use-groups.ts`
   - ✅ Updated GroupsClientPage to use the API client
   - ✅ Updated CreateGroupModal to use the API client
   - ✅ Added proper conversion between different group schemas

3. **Itinerary Module**:

   - ✅ Created client-side API wrapper in `lib/client/itinerary.ts`
   - ✅ Implemented LogisticsTabContent using the API client

4. **Tags Module**:

   - ✅ Created client-side API wrapper in `lib/client/tags.ts`
   - ✅ Created React hook in `hooks/use-tags.ts`
   - ✅ Fixed type safety issues in Result pattern handling
   - ✅ Added proper type guards for Result type safety

5. **Standardized Client API Approach**:
   - ✅ Added centralized client API exports in `lib/client/index.ts`
   - ✅ Created shared `handleApiResponse` utility for consistent response handling
   - ✅ Added proper `tryCatch` utility in `utils/result.ts`
   - ✅ Standardized type guards pattern for Result type safety

### Next Steps

1. **Complete React Hooks**:

   - Create hooks for remaining modules (Comments, Places, etc.)
   - Add documentation for each hook
   - Standardize error handling pattern across all hooks

2. **Activities API**:

   - Complete client wrapper implementation
   - Create React hook for activities
   - Integrate with activity components

3. **Comments API**:
   - Implement client wrapper
   - Create React hook
   - Integrate with comment components

## Standard API Client Integration Pattern

To ensure consistency across all API client integrations, follow this standardized pattern:

### 1. Client Wrapper Implementation

Create a client wrapper file (e.g., `lib/client/comments.ts`):

```typescript
import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import type { Comment } from '@/types';
import { handleApiResponse } from './index';

/**
 * List all comments for an entity
 */
export async function listComments(
  entityType: string,
  entityId: string
): Promise<Result<Comment[]>> {
  return tryCatch(
    fetch(`${API_ROUTES.COMMENTS}?entityType=${entityType}&entityId=${entityId}`, {
      method: 'GET',
      cache: 'no-store',
    }).then(handleApiResponse)
  );
}

// Add other API functions...
```

### 2. Add to Client Index

Update `lib/client/index.ts` to export the new module:

```typescript
// Existing exports...
export * from './comments';
```

### 3. Create React Hook

Create a hook file (e.g., `hooks/use-comments.ts`):

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Result } from '@/utils/result';
import { listComments } from '@/lib/client';

/**
 * Type guard to check if a result is successful
 */
function isSuccess<T>(result: Result<T, Error>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Hook for managing comments with loading states and error handling
 */
export function useComments({ entityType, entityId, fetchOnMount = true }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshComments = useCallback(async () => {
    if (!entityType || !entityId) return;

    setIsLoading(true);
    setError(null);

    const result = await listComments(entityType, entityId);

    if (isSuccess(result)) {
      setComments(result.data);
    } else {
      setError(result.error.message || 'Failed to fetch comments');
    }

    setIsLoading(false);
  }, [entityType, entityId]);

  // Implement other methods...

  useEffect(() => {
    if (fetchOnMount) {
      refreshComments();
    }
  }, [fetchOnMount, refreshComments]);

  return {
    comments,
    isLoading,
    error,
    refreshComments,
    // Other methods...
  };
}
```

### 4. Update API.md

After completing the integration, update this file to reflect the new status.

## Next Steps

### High Priority

1. **Complete Client Wrappers**:

   - Implement remaining API client wrappers for all API modules
   - Create React hooks for all major features
   - Standardize error handling and loading states

2. **Activities API**:

   - Complete AI-powered recommendations
   - Add social features (voting, popularity)
   - Implement categorization

3. **Permissions API**:
   - Complete role permission verification system
   - Implement ownership transfer functionality
   - Add audit trail for permission changes

### Medium Priority

1. **Expenses API**:

   - Add currency conversion
   - Implement split expense logic
   - Add payment tracking

2. **Itineraries API**:
   - Implement AI optimization
   - Add time-based scheduling
   - Integrate with external APIs for availability

## Module Details

### Activities API

```typescript
// List of implemented functions
listActivities(parentId, parentType);
getActivity(activityId);
createActivity(parentId, parentType, data);
updateActivity(activityId, data);
deleteActivity(activityId);
searchActivities(query, params);
suggestActivity(parentId, parentType, suggestion);
```

**TODOs**:

- Implement voting system for suggested activities
- Add AI-powered activity recommendations
- Implement AI categorization
- Create client wrapper

### Comments API

```typescript
// List of implemented functions
listComments(entityId, entityType);
getComment(commentId);
createComment(entityId, entityType, data);
updateComment(commentId, data);
deleteComment(commentId);
getThreadedComments(entityId, entityType);
```

**TODOs**:

- Create client wrapper

### Destinations API

```typescript
// List of implemented functions
listDestinations(params);
getDestination(id);
createDestination(data);
updateDestination(id, data);
deleteDestination(id);
searchDestinations(query);
getPopularDestinations(limit);
```

**TODOs**:

- Create client wrapper

### Expenses API

```typescript
// List of implemented functions
listExpenses(tripId);
getExpense(expenseId);
createExpense(tripId, data);
updateExpense(expenseId, data);
deleteExpense(expenseId);
getTripBudgetSummary(tripId);
```

**TODOs**:

- Implement currency conversion
- Add split expense functionality
- Add payment tracking
- Create client wrapper

### Groups API

```typescript
// List of implemented functions
listGroups(userId);
getGroup(groupId);
createGroup(data);
updateGroup(groupId, data);
deleteGroup(groupId);
addMember(groupId, userId, role);
removeMember(groupId, userId);
listMembers(groupId);
```

**Complete including client wrapper and React hooks**

### Itineraries API

```typescript
// List of implemented functions
listItineraries(tripId);
getItinerary(tripId, day);
createItineraryItem(tripId, data);
updateItineraryItem(itemId, data);
deleteItineraryItem(itemId);
reorderItineraryItems(tripId, itemIds);
```

**TODOs**:

- Implement AI optimization for itineraries
- Add time-based scheduling
- Integrate with external availability APIs

### Permissions API

```typescript
// List of implemented functions
listPermissionRequests(tripId);
getPermissionRequest(tripId, requestId);
createPermissionRequest(tripId, data);
updatePermissionRequest(tripId, requestId, data);
deletePermissionRequest(tripId, requestId);
approvePermissionRequest(tripId, requestId, resolvedBy);
rejectPermissionRequest(tripId, requestId, resolvedBy, reason);
checkPermissionStatus(tripId, userId);
getTripAccessList(tripId);
changeTripUserRole(tripId, userId, newRole, actorId);
transferTripOwnership(tripId, currentOwnerId, newOwnerId); // TODO
```

**TODOs**:

- Complete role-based permission verification logic
- Implement ownership transfer functionality
- Add audit trail for permission changes
- Create client wrapper

### Places API

```typescript
// List of implemented functions
listPlaces(params);
getPlace(placeId);
createPlace(data);
updatePlace(placeId, data);
deletePlace(placeId);
searchPlaces(query, params);
getNearbyPlaces(lat, lng, radius);
```

**TODOs**:

- Create client wrapper

### Tags API

```typescript
// List of implemented functions
listTags(entityType, entityId);
getTag(tagId);
createTag(data);
updateTag(tagId, data);
deleteTag(tagId);
searchTags(query);
suggestTags(entityType, content);
addTagToEntity(entityType, entityId, tagName);
removeTagFromEntity(entityType, entityId, tagName);
```

**Complete including client wrapper and React hook**

### Trips API

```typescript
// List of implemented functions
listTrips(userId);
getTrip(tripId);
createTrip(data);
updateTrip(tripId, data);
deleteTrip(tripId);
listPublicTrips({ limit, offset });
listUserTripsWithMembership(userId, { includeShared, limit, offset });
getTripWithDetails(tripId);
updateTripWithDetails(tripId, data);
```

**Complete including client wrapper and React hooks**

### Trip Members API

```typescript
// List of implemented functions
listTripMembers(tripId);
getTripMember(tripId, userId);
addTripMember(tripId, userData, role);
updateTripMember(tripId, userId, data);
removeTripMember(tripId, userId);
```

**TODOs**:

- Create client wrapper

## Long-term API Roadmap

1. **API Versioning**: Implement versioning for stable API interfaces
2. **Rate Limiting**: Add rate limiting for public endpoints
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Analytics**: Add tracking of API usage and performance metrics
5. **Documentation**: Generate comprehensive API docs with Swagger/OpenAPI
6. **Complete Client Integration**: Create client wrappers and React hooks for all API modules

# Tasks API

The Tasks API provides CRUD operations, assignment, voting, and tagging for both personal and group tasks. All endpoints use the TABLES constants and the Result pattern. Task data is enriched using the `task_details` view for rich info (including tags, votes, and user profiles).

## Endpoints & Functions

| Function                           | Description                            |
| ---------------------------------- | -------------------------------------- |
| listTasks(userId)                  | List all personal tasks for a user     |
| listGroupTasks(tripId)             | List all group tasks for a trip        |
| getTask(taskId)                    | Get a single task by ID                |
| createTask(data)                   | Create a new task (with optional tags) |
| updateTask(taskId, data)           | Update an existing task                |
| deleteTask(taskId)                 | Delete a task                          |
| assignTask(taskId, assigneeId)     | Assign a task to a user                |
| listAssignedTasks(userId)          | List tasks assigned to a user          |
| voteTask(taskId, userId, voteType) | Vote on a task (up/down)               |
| addTagToTask(taskId, tagName)      | Add a tag to a task                    |
| removeTagFromTask(taskId, tagName) | Remove a tag from a task               |

## Usage Notes

- All functions return a `Result<T>` type for consistent error handling.
- Use the `task_details` view for rich task info (tags, votes, user profiles).
- Tags are upserted and linked to tasks; voting is upserted per user per task.
- Assignment and group tasks are supported via `assignee_id` and `trip_id` fields.
- The API supports both personal (no trip) and group (trip-based) tasks.

## Example

```typescript
import { listTasks, createTask, assignTask, voteTask } from '@/lib/api/tasks';

const myTasks = await listTasks(userId);
const newTask = await createTask({ title: 'Book hotel', owner_id: userId });
await assignTask(newTask.id, assigneeId);
await voteTask(newTask.id, userId, 'up');
```

## Integration Plan: Prioritized Action Items

To complete our API integration and atomization work, we'll focus on these key modules:

### 1. Itineraries Module (Highest Priority)

- [ ] Refactor `/app/api/itineraries/` route handlers to use centralized `/lib/api/itineraries.ts` API
- [x] Atomize `/app/trips/[tripId]/components/tab-contents/itinerary-tab-content.tsx` into:
  - [x] Atoms: ItineraryItemAction, ItineraryItemStatus, ItineraryDayHeader
  - [x] Molecules: ItineraryItemCard, ItineraryDaySection, UnscheduledItemsSection
  - [x] Templates: ItineraryTabTemplate
  - _Note: Placeholder implementations are in place; further extraction and unit testing are planned._
- [ ] Add unit tests for client wrapper and React hook
- [ ] Update documentation in this file to mark as complete

### 2. Activities Module

- [ ] Refactor `/app/api/activities/` route handlers to use centralized `/lib/api/activities.ts` API
- [ ] Verify full integration of client wrapper and React hook
- [ ] Atomize activity-related UI components
- [ ] Add unit tests for client wrapper and React hook
- [ ] Update documentation in this file to mark as complete

### 3. Expenses Module

- [ ] Refactor `/app/api/trips/[tripId]/expenses/` to use centralized `/lib/api/expenses.ts` API
- [ ] Complete atomization of `components/expenses/budget-tab.tsx`:
  - [ ] Atoms: BudgetProgress, ExpenseCategory, ExpenseAmount
  - [ ] Molecules: BudgetSummary, ExpenseItem, ExpenseFilter
  - [ ] Organisms: ExpenseList, BudgetBreakdown
  - [ ] Templates: BudgetTabTemplate
- [ ] Add unit tests for client wrapper and React hook
- [ ] Update documentation in this file to mark as complete

### Approach for Each Module

1. **API Integration**:
   - Analyze current route handler implementation
   - Refactor to use corresponding lib/api functions
   - Test API endpoints to ensure functionality is preserved
2. **Component Atomization**:
   - Identify atomic elements within each page/component
   - Create reusable atoms and molecules following our atomic design system
   - Build new component hierarchy using these atoms
3. **Testing and Documentation**:
   - Write unit tests for client wrappers and React hooks
   - Update API.md with completion status
   - Document each atomized component in Storybook

## How to Use the Expenses Hook

To manage trip expenses in your UI components, use the new `useExpenses` hook:

```typescript
import { useExpenses } from '@/hooks/use-expenses';

function TripExpensesSection({ tripId }: { tripId: string }) {
  const { expenses, isLoading, error, addExpense, editExpense, removeExpense, summary, refresh } =
    useExpenses(tripId);

  // ...render UI, call addExpense/editExpense/removeExpense as needed
}
```

## Testing the Expenses Module

### Client Wrapper Tests

To test the Expenses client wrapper, create tests in `__tests__/lib/client/expenses.test.ts`:

```typescript
import {
  listTripExpenses,
  getTripExpense,
  createTripExpense,
  updateTripExpense,
  deleteTripExpense,
  getTripExpenseSummary,
} from '@/lib/client/expenses';
import { mockFetch } from '@/utils/testing/mock-fetch';

describe('Expenses client wrapper', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('listTripExpenses fetches expenses for a trip', async () => {
    const mockExpenses = [{ id: '1', title: 'Test expense', amount: 100 }];
    mockFetch.mockResponse({ expenses: mockExpenses });

    const result = await listTripExpenses('trip-123');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockExpenses);
    expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-123/expenses', {
      method: 'GET',
    });
  });

  // Add similar tests for other functions
});
```

### Hook Tests

To test the useExpenses hook, create tests in `__tests__/hooks/use-expenses.test.tsx`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useExpenses } from '@/hooks/use-expenses';
import * as expensesClient from '@/lib/client/expenses';

// Mock the client wrapper functions
jest.mock('@/lib/client/expenses');

describe('useExpenses hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (expensesClient.listTripExpenses as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: '1', title: 'Test expense', amount: 100 }],
    });
  });

  test('loads expenses on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useExpenses('trip-123'));

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.expenses).toEqual([{ id: '1', title: 'Test expense', amount: 100 }]);
    expect(expensesClient.listTripExpenses).toHaveBeenCalledWith('trip-123');
  });

  test('addExpense adds a new expense', async () => {
    (expensesClient.createTripExpense as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: '2', title: 'New expense', amount: 50 },
    });

    const { result, waitForNextUpdate } = renderHook(() => useExpenses('trip-123'));

    await waitForNextUpdate();

    act(() => {
      result.current.addExpense({ title: 'New expense', amount: 50 });
    });

    await waitForNextUpdate();

    expect(result.current.expenses).toContainEqual({ id: '2', title: 'New expense', amount: 50 });
    expect(expensesClient.createTripExpense).toHaveBeenCalledWith('trip-123', {
      title: 'New expense',
      amount: 50,
    });
  });

  // Add similar tests for other methods
});
```

### Integration Tests

For key UI components that use the Expenses module:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BudgetTab } from '@/components/expenses/budget-tab';
import * as expensesHook from '@/hooks/use-expenses';

jest.mock('@/hooks/use-expenses');

describe('BudgetTab integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (expensesHook.useExpenses as jest.Mock).mockReturnValue({
      expenses: [{ id: '1', title: 'Test expense', amount: 100 }],
      isLoading: false,
      error: null,
      addExpense: jest.fn(),
      editExpense: jest.fn(),
      removeExpense: jest.fn(),
      refresh: jest.fn(),
      fetchSummary: jest.fn(),
      summary: { total: 100 }
    });
  });

  test('renders expense list', () => {
    render(<BudgetTab
      tripId="trip-123"
      initialMembers={[]}
    />);

    expect(screen.getByText('Test expense')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  test('opens add expense form when button is clicked', async () => {
    render(<BudgetTab
      tripId="trip-123"
      initialMembers={[]}
      canEdit={true}
    />);

    fireEvent.click(screen.getByText('Add Expense'));

    await waitFor(() => {
      expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    });
  });

  // Add more integration tests
});
```

## API Integration to Frontend Standardization

This section tracks our progress in standardizing how frontend components interact with backend APIs, focusing particularly on the trip feature tab contents.

### Current Status of Trip Tab Components

| Tab Component       | Uses Client Wrapper | Uses React Hook | Status     | Notes                                                                  |
| ------------------- | ------------------- | --------------- | ---------- | ---------------------------------------------------------------------- |
| PlacesTabContent    | ✅                  | ✅              | Complete   | Uses `use-places-v2` hook and Places client                            |
| LogisticsTabContent | ✅                  | ✅              | Complete   | Uses `useLogistics` hook and Itinerary client with atomized components |
| BudgetTabContent    | ✅                  | ✅              | Complete   | Fully integrated with Expenses API                                     |
| ItineraryTabContent | ✅                  | ✅              | Complete   | Now uses useItinerary hook with atomized components                    |
| NotesTabContent     | ✅                  | ✅              | Complete   | Uses atomized components with proper useNotes hook                     |
| ActivityTabContent  | ✅                  | ✅              | Complete   | Uses ActivityTimeline component with proper API integration            |
| ManageTabContent    | ❌                  | ❌              | Needs Work | Uses direct API calls, needs client wrapper                            |

### Frontend Integration Priorities

1. **High Priority**:
   - ✅ Complete `LogisticsTabContent` - DONE
   - ✅ Complete `ItineraryTabContent` - DONE
   - ✅ Create `NotesTabContent` client wrapper and hook - DONE
   - Create `ManageTabContent` client wrapper and hook

## Atomization Roadmap

To complete our API integration and atomization work, we'll focus on these key modules:

### 1. Notes Module (Highest Priority)

- ✅ Create proper `/lib/api/notes.ts` API module
- ✅ Create client wrapper in `/lib/client/notes.ts`
- ✅ Create React hook in `/hooks/use-notes.ts`
- ✅ Atomize `/app/trips/[tripId]/components/tab-contents/notes-tab-content.tsx` into:
  - ✅ Atoms: NoteEditor, NoteTitle, NoteContent
  - ✅ Molecules: NoteCard, CollaborativeEditor
  - ✅ Templates: NotesTabTemplate
- ✅ Add unit tests for client wrapper and React hook
- ✅ Update documentation in this file to mark as complete

### 2. Budget Module

- [ ] Complete atomization of `components/expenses/budget-tab.tsx`:
  - [ ] Atoms: BudgetProgress, ExpenseCategory, ExpenseAmount
  - [ ] Molecules: BudgetSummary, ExpenseItem, ExpenseFilter
  - [ ] Organisms: ExpenseList, BudgetBreakdown
  - [ ] Templates: BudgetTabTemplate
- [ ] Add unit tests for component atoms
- [ ] Update documentation in this file to mark as complete

### 3. Activity Module

- [ ] Refactor `/app/api/activities/` route handlers to use centralized `/lib/api/activities.ts` API
- [ ] Verify full integration of client wrapper and React hook
- [ ] Atomize activity-related UI components:
  - [ ] Atoms: ActivityIcon, ActivityTimestamp, ActivityDescription
  - [ ] Molecules: ActivityItem, ActivityFilter
  - [ ] Organisms: ActivityFeed, ActivityTimeline
- [ ] Add unit tests for client wrapper and React hook
- [ ] Update documentation in this file to mark as complete

### 4. Manage Module

- [ ] Create client wrapper in `/lib/client/trip-management.ts`
- [ ] Create React hook in `/hooks/use-trip-management.ts`
- [ ] Atomize components in manage-tab-content.tsx
- [ ] Add unit tests for client wrapper and React hook
