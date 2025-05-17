# withme.travel API Implementation Status

This document tracks the status of the API implementation across different modules. It provides an overview of completed work and pending features.

## Architecture Overview

The withme.travel API is structured around a modular architecture:

1. **API Modules**: Feature-specific modules in `/lib/api/` containing CRUD operations and specialized functions
2. **Shared Types**: Common types and interfaces defined in `/lib/api/_shared.ts`
3. **Result Pattern**: Standardized `Result<T>` return type for consistent error handling
4. **Route Handlers**: Next.js API routes that call these modules

## Implementation Status

| Module | Status | CRUD Complete | Advanced Features | Notes |
|--------|--------|---------------|-------------------|-------|
| Activities | In Progress | ✅ | ⚠️ Partial | Advanced features need AI implementation |
| Comments | Complete | ✅ | ✅ | Includes threaded comments & reactions |
| Destinations | Complete | ✅ | ✅ | Includes search, filtering, and recommendations |
| Expenses | Complete | ✅ | ⚠️ Partial | Currency conversion pending |
| Groups | Complete | ✅ | ✅ | Includes access control and member management |
| Itineraries | Complete | ✅ | ⚠️ Partial | AI optimization pending |
| Permissions | Complete | ✅ | ⚠️ Partial | Role-based permissions partially implemented |
| Places | Complete | ✅ | ✅ | Includes geocoding and reverse lookup |
| Tags | Complete | ✅ | ✅ | Includes filtering and suggestion features |
| Trips | Complete | ✅ | ✅ | Full member management, sharing features |
| Trip Members | Complete | ✅ | ✅ | Role management, invitation system |

Legend:
- ✅ Complete
- ⚠️ Partial implementation
- ❌ Not started

## Next Steps

### High Priority

1. **Activities API**:
   - Complete AI-powered recommendations
   - Add social features (voting, popularity)
   - Implement categorization

2. **Permissions API**:
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
listActivities(parentId, parentType)
getActivity(activityId)
createActivity(parentId, parentType, data)
updateActivity(activityId, data)
deleteActivity(activityId)
searchActivities(query, params)
suggestActivity(parentId, parentType, suggestion)
```

**TODOs**:
- Implement voting system for suggested activities
- Add AI-powered activity recommendations
- Implement AI categorization

### Comments API

```typescript
// List of implemented functions
listComments(entityId, entityType)
getComment(commentId)
createComment(entityId, entityType, data)
updateComment(commentId, data)
deleteComment(commentId)
getThreadedComments(entityId, entityType)
```

**Complete**

### Destinations API

```typescript
// List of implemented functions
listDestinations(params)
getDestination(id)
createDestination(data)
updateDestination(id, data)
deleteDestination(id)
searchDestinations(query)
getPopularDestinations(limit)
```

**Complete**

### Expenses API

```typescript
// List of implemented functions
listExpenses(tripId)
getExpense(expenseId)
createExpense(tripId, data)
updateExpense(expenseId, data)
deleteExpense(expenseId)
getTripBudgetSummary(tripId)
```

**TODOs**:
- Implement currency conversion
- Add split expense functionality
- Add payment tracking

### Groups API

```typescript
// List of implemented functions
listGroups(userId)
getGroup(groupId)
createGroup(data)
updateGroup(groupId, data)
deleteGroup(groupId)
addMember(groupId, userId, role)
removeMember(groupId, userId)
listMembers(groupId)
```

**Complete**

### Itineraries API

```typescript
// List of implemented functions
listItineraries(tripId)
getItinerary(tripId, day)
createItineraryItem(tripId, data)
updateItineraryItem(itemId, data)
deleteItineraryItem(itemId)
reorderItineraryItems(tripId, itemIds)
```

**TODOs**:
- Implement AI optimization for itineraries
- Add time-based scheduling
- Integrate with external availability APIs

### Permissions API

```typescript
// List of implemented functions
listPermissionRequests(tripId)
getPermissionRequest(tripId, requestId)
createPermissionRequest(tripId, data)
updatePermissionRequest(tripId, requestId, data)
deletePermissionRequest(tripId, requestId)
approvePermissionRequest(tripId, requestId, resolvedBy)
rejectPermissionRequest(tripId, requestId, resolvedBy, reason)
checkPermissionStatus(tripId, userId)
getTripAccessList(tripId)
changeTripUserRole(tripId, userId, newRole, actorId)
transferTripOwnership(tripId, currentOwnerId, newOwnerId) // TODO
```

**TODOs**:
- Complete role-based permission verification logic
- Implement ownership transfer functionality
- Add audit trail for permission changes

### Places API

```typescript
// List of implemented functions
listPlaces(params)
getPlace(placeId)
createPlace(data)
updatePlace(placeId, data)
deletePlace(placeId)
searchPlaces(query, params)
getNearbyPlaces(lat, lng, radius)
```

**Complete**

### Tags API

```typescript
// List of implemented functions
listTags(entityType, entityId)
getTag(tagId)
createTag(data)
updateTag(tagId, data)
deleteTag(tagId)
searchTags(query)
suggestTags(entityType, content)
```

**Complete**

### Trips API

```typescript
// List of implemented functions
listTrips(userId)
getTrip(tripId)
createTrip(data)
updateTrip(tripId, data)
deleteTrip(tripId)
```

**Complete**

### Trip Members API

```typescript
// List of implemented functions
listTripMembers(tripId)
getTripMember(tripId, userId)
addTripMember(tripId, userData, role)
updateTripMember(tripId, userId, data)
removeTripMember(tripId, userId)
```

**Complete**

## Long-term API Roadmap

1. **API Versioning**: Implement versioning for stable API interfaces
2. **Rate Limiting**: Add rate limiting for public endpoints
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Analytics**: Add tracking of API usage and performance metrics
5. **Documentation**: Generate comprehensive API docs with Swagger/OpenAPI 

# Tasks API

The Tasks API provides CRUD operations, assignment, voting, and tagging for both personal and group tasks. All endpoints use the TABLES constants and the Result pattern. Task data is enriched using the `task_details` view for rich info (including tags, votes, and user profiles).

## Endpoints & Functions

| Function | Description |
|----------|-------------|
| listTasks(userId) | List all personal tasks for a user |
| listGroupTasks(tripId) | List all group tasks for a trip |
| getTask(taskId) | Get a single task by ID |
| createTask(data) | Create a new task (with optional tags) |
| updateTask(taskId, data) | Update an existing task |
| deleteTask(taskId) | Delete a task |
| assignTask(taskId, assigneeId) | Assign a task to a user |
| listAssignedTasks(userId) | List tasks assigned to a user |
| voteTask(taskId, userId, voteType) | Vote on a task (up/down) |
| addTagToTask(taskId, tagName) | Add a tag to a task |
| removeTagFromTask(taskId, tagName) | Remove a tag from a task |

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

## Integration Plan: Centralized API Adoption

This plan outlines how to fully integrate the new centralized API modules (`/lib/api/*.ts`) into the Next.js route handlers under `/app/api/`, and remove legacy/duplicated logic. The goal is to ensure all business logic lives in the API modules, with route handlers acting as thin adapters.

### General Steps for Each Module
1. **Inventory**: List all route handler files for the domain (e.g., `/app/api/trips`, `/app/api/trips/[tripId]`, etc.)
2. **Refactor**: Update each route handler to import and use the corresponding functions from `/lib/api/` (e.g., `import { listTrips } from '@/lib/api/trips'`)
3. **Remove**: Delete or comment out any legacy business logic, direct DB access, or duplicated code in route handlers
4. **Test**: Ensure all endpoints return the same (or improved) results, and that error handling is consistent
5. **Document**: Mark the migration as complete in this checklist

### Integration Checklist by Module

#### Trips API
- [x] `/app/api/trips/route.ts` → use `lib/api/trips`
- [x] `/app/api/trips/[tripId]/route.ts` → use `lib/api/trips`
- [x] `/app/api/trips/[tripId]/members/` (GET, POST, PATCH, DELETE) → use `lib/api/tripMembers`
- [x] `/app/api/trips/[tripId]/members/import/` (POST) → use `lib/api/tripMembers`
- [x] Advanced features (invites, import, permissions): migrated to `lib/api/tripMembers`
- [x] `/app/api/trips/[tripId]/permissions/` (GET, POST, PATCH) → use `lib/api/permissions`
- [x] `/app/api/trips/[tripId]/tags/` (GET, PUT) → use `lib/api/tags`
- [x] Remove all direct DB logic from these files
  - [x] Main CRUD logic migrated for trips and trip detail
  - [x] Public trips and shared trips logic centralized in `lib/api/trips`
  - [x] Pagination and cities support implemented
  - [x] Trip details now include members and cities
  - [x] Trip members: all features (add, invite, import, check access) centralized
  - [x] Permissions: all endpoints centralized
  - [x] Tags: all endpoints centralized in `lib/api/tags` and `lib/api/trips`

#### Groups API
- [x] `/app/api/groups/route.ts` → use `lib/api/groups`
- [x] `/app/api/groups/[groupId]/route.ts` → use `lib/api/groups`
- [x] `/app/api/groups/[groupId]/tasks/` → use `lib/api/tasks` (already using centralized API)
- [x] Remove all direct DB logic from these files
- [x] Advanced features implemented in `lib/api/groups`:
  - [x] Group member management and role checks
  - [x] Guest group creation and token management
  - [x] Group details with related data (members, trips)
  - [ ] TODO: Group plans/ideas implementation
  - [ ] TODO: Group invitations and join requests
  - [ ] TODO: Group analytics and activity tracking

#### Places API
- [ ] `/app/api/places/route.ts` → use `lib/api/places`
- [ ] Remove all direct DB logic from these files

#### Comments API
- [ ] `/app/api/comments/route.ts` → use `lib/api/comments`
- [ ] `/app/api/comments/[id]/route.ts` → use `lib/api/comments`
- [ ] `/app/api/comments/[id]/replies/route.ts` → use `lib/api/comments`
- [ ] `/app/api/comments/[id]/reactions/route.ts` → use `lib/api/comments`
- [ ] Remove all direct DB logic from these files

#### Activities API
- [ ] `/app/api/activities/` (and subroutes) → use `lib/api/activities`
- [ ] Remove all direct DB logic from these files

#### Itineraries API
- [ ] `/app/api/itineraries/route.ts` → use `lib/api/itineraries`
- [ ] `/app/api/itineraries/[slug]/route.ts` → use `lib/api/itineraries`
- [ ] Remove all direct DB logic from these files

#### Tags API
- [ ] `/app/api/tags/route.ts` → use `lib/api/tags`
- [ ] Remove all direct DB logic from these files

#### Permissions API
- [ ] `/app/api/trips/[tripId]/permissions/route.ts` → use `lib/api/permissions`
- [ ] `/app/api/trips/[tripId]/permissions/request/route.ts` → use `lib/api/permissions`
- [ ] Remove all direct DB logic from these files

#### Expenses API
- [ ] `/app/api/trips/[tripId]/expenses/route.ts` → use `lib/api/expenses`
- [ ] `/app/api/trips/[tripId]/expenses/[expenseId]/route.ts` → use `lib/api/expenses`
- [ ] Remove all direct DB logic from these files

#### Trip Members API
- [ ] `/app/api/trips/[tripId]/members/` → use `lib/api/tripMembers`
- [ ] Remove all direct DB logic from these files

### Additional Steps
- [ ] Update all tests/mocks to use the new API modules
- [ ] Remove any unused utility functions that are now handled by the API modules
- [ ] Update documentation and onboarding guides to reference the new API structure
- [ ] Add TODOs in route handlers for any advanced features not yet implemented in the API modules

For each handler, replace all business logic with calls to the centralized API module, and remove any direct DB or legacy code.
Mark each completed migration in the checklist above.

### Progress should be tracked in this file as each module is migrated. 

## Implementation Plan for Remaining Modules

Below is a step-by-step plan for migrating each remaining API module to the centralized pattern. For each, follow these steps:

1. **Inventory**: List all route handler files for the domain (e.g., `/app/api/groups`, `/app/api/groups/[groupId]`, etc.)
2. **Refactor**: Update each route handler to import and use the corresponding functions from `/lib/api/` (e.g., `import { listGroups } from '@/lib/api/groups'`)
3. **Remove**: Delete or comment out any legacy business logic, direct DB access, or duplicated code in route handlers
4. **Test**: Ensure all endpoints return the same (or improved) results, and that error handling is consistent
5. **Document**: Mark the migration as complete in this checklist
6. **TODOs**: For any advanced features or new requirements, add TODOs in the API module for future implementation

### Groups API
- **Route Handlers:**
  - `/app/api/groups/route.ts`
  - `/app/api/groups/[groupId]/route.ts`
  - `/app/api/groups/[groupId]/tasks/`
- **Centralized Module:** `lib/api/groups`, `lib/api/tasks`
- **Advanced Features/TODOs:**
  - Group invitations and join requests
  - Group role management and audit trail
  - Group analytics and activity feed
- **Checklist:**
  - [x] Refactor all handlers to use centralized API
  - [x] Remove direct DB logic
  - [x] Add TODOs for advanced features
  - [x] Mark as complete in this doc

### Places API
- **Route Handlers:**
  - `/app/api/places/route.ts`
- **Centralized Module:** `lib/api/places`
- **Advanced Features/TODOs:**
  - Place reviews and ratings
  - Place suggestion engine
- **Checklist:**
  - [ ] Refactor handler to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

### Comments API
- **Route Handlers:**
  - `/app/api/comments/route.ts`
  - `/app/api/comments/[id]/route.ts`
  - `/app/api/comments/[id]/replies/route.ts`
  - `/app/api/comments/[id]/reactions/route.ts`
- **Centralized Module:** `lib/api/comments`
- **Advanced Features/TODOs:**
  - Threaded comments and moderation
  - Comment reactions and reporting
- **Checklist:**
  - [ ] Refactor all handlers to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

### Activities API
- **Route Handlers:**
  - `/app/api/activities/` (and subroutes)
- **Centralized Module:** `lib/api/activities`
- **Advanced Features/TODOs:**
  - AI-powered activity recommendations
  - Activity voting and popularity
  - Activity categorization and tagging
- **Checklist:**
  - [ ] Refactor all handlers to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

### Itineraries API
- **Route Handlers:**
  - `/app/api/itineraries/route.ts`
  - `/app/api/itineraries/[slug]/route.ts`
- **Centralized Module:** `lib/api/itineraries`
- **Advanced Features/TODOs:**
  - AI itinerary optimization
  - Time-based scheduling and availability
- **Checklist:**
  - [ ] Refactor all handlers to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

### Tags API
- **Route Handlers:**
  - `/app/api/tags/route.ts`
- **Centralized Module:** `lib/api/tags`
- **Advanced Features/TODOs:**
  - Tag suggestion and auto-categorization
- **Checklist:**
  - [ ] Refactor handler to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

### Permissions API
- **Route Handlers:**
  - `/app/api/trips/[tripId]/permissions/request/route.ts`
- **Centralized Module:** `lib/api/permissions`
- **Advanced Features/TODOs:**
  - Permission change audit trail
  - Ownership transfer workflows
- **Checklist:**
  - [ ] Refactor handler to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

### Expenses API
- **Route Handlers:**
  - `/app/api/trips/[tripId]/expenses/route.ts`
  - `/app/api/trips/[tripId]/expenses/[expenseId]/route.ts`
- **Centralized Module:** `lib/api/expenses`
- **Advanced Features/TODOs:**
  - Currency conversion
  - Split expense logic
  - Payment tracking
- **Checklist:**
  - [ ] Refactor all handlers to use centralized API
  - [ ] Remove direct DB logic
  - [ ] Add TODOs for advanced features
  - [ ] Mark as complete in this doc

---

**General Guidance:**
- For each migration, add TODOs for any advanced or new features directly in the relevant API module.
- Use the Result pattern and shared types for all new/updated endpoints.
- Keep this file updated as you complete each migration.
- For onboarding, reference this plan and the completed modules above as examples of the new pattern. 