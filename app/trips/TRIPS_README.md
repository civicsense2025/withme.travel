# Trips Feature

This directory (`app/trips`) contains the primary frontend code for trip planning and management in withme.travel.

---

## 🚦 How Group Planning Flows Into Trips

### Visual Hierarchy

```
Group
 └─ Plan (Idea Board / Whiteboard)
     └─ [Voting, Brainstorming, Polls]
         └─ "Create Trip" Action
             └─ Trip
                 └─ Trip Cities (multi-city, ordered)
                     └─ Itinerary Sections (per city)
                         └─ Itinerary Items
```

- **Groups**: Collaborative spaces for friends to brainstorm, vote, and plan.
- **Plans**: Each group can have multiple whiteboards/idea boards (plans) for different trip ideas.
- **Trip Creation**: Once consensus is reached, a plan can be turned into a trip with one click. The trip is auto-populated with selected destinations, dates, and group members.
- **Trips**: Support multiple cities (multi-city), with each city having its own dates and itinerary sections.

---

## 🧩 Directory Structure

```
app/trips/
├── [tripId]/             # Detailed view for a specific trip
│   ├── components/       # UI for trip detail (itinerary, budget, members, etc.)
│   ├── context/          # Trip data providers and error boundaries
│   ├── edit/             # Edit trip details
│   ├── itinerary/        # View/edit specific itinerary items
│   ├── manage/           # Manage trip settings/members
│   ├── validation/       # Zod schemas/validation logic
│   └── page.tsx          # Main trip detail page
├── components/           # Reusable trip components (list, create, etc.)
├── create/               # Trip creation flow (multi-step, from group/plan or scratch)
│   ├── components/       # Create trip form components
│   ├── success/          # Success page after trip creation
│   └── page.tsx          # Main trip creation entry
├── public/               # Public trip pages (by slug)
├── utils/                # Trip-specific utility functions
├── page.tsx              # "/trips" (user's trip list)
├── trips-client.tsx      # Client logic for trip list
└── README.md             # This file
```

---

## 🌍 Multi-City Trip Model

- **Trips**: Now support multiple cities via a `trip_cities` join table (not just a single `destination_id`).
- **trip_cities**: Each row links a trip to a city, with:
  - `position` (order in trip)
  - `arrival_date` / `departure_date` (per-city dates)
- **Itinerary Sections**: Each section is attached to a specific `trip_city_id`, so you can organize plans by city.
- **Itinerary Items**: Belong to an itinerary section, which is scoped to a city.

**Example:**

- Trip: "Europe 2024"
  - Paris (July 1–4)
    - Day 1: Paris Museums
    - Day 2: Montmartre
  - Rome (July 4–7)
    - Day 4: Colosseum
    - Day 5: Vatican

---

## 👫 Group & Plan Integration

- **Groups**: Users start by creating a group and inviting friends.
- **Plans (Whiteboards)**: Each group can have multiple plans (idea boards) for different trip ideas.
- **Voting & Polls**: Members brainstorm, vote, and run polls to decide on destinations, dates, and budgets.
- **Trip Creation**: When ready, a plan can be converted into a trip. The trip creation form is pre-filled with the chosen cities, dates, and group members.
- **Group-Trip Link**: The group remains linked to the trip for ongoing discussion and coordination.

---

## 🛠️ Key Features & Components

- **Trip Listing**: `/trips` page shows all your trips.
- **Trip Creation**: Multi-step form supports creating trips from scratch or from a group plan.
- **Trip Detail View**: Tabbed interface for itinerary, members, budget, notes, etc.
- **Multi-City Management**: Add, remove, and reorder cities in a trip; set per-city dates.
- **Itinerary Management**: Organize itinerary sections and items by city.
- **Member Management**: Invite/manage trip members, roles, and permissions.
- **Real-time Collaboration**: See who's online, what they're editing, and collaborate live.
- **Error Handling**: Robust error boundaries and fallback UIs.

---

## 🔗 Related Code & Docs

- **API Routes:** `app/api/trips/`
- **Group/Plan Logic:** `app/groups/`, `app/groups/[id]/plans/`
- **Global Components:** `components/trips/`
- **Types:** `types/database.types.ts`, `types/multi-city.ts`, `types/ideaPlan.ts`
- **Constants:** `utils/constants/database.ts`, `utils/constants/routes.ts`
- **Docs:** See `docs/features/groups.md`, `docs/features/group plans.md`, `CHANGELOG.md`

---

## 🚧 Status & Future Work

- **Multi-city trips**: Fully supported in backend and UI.
- **Group-to-trip flow**: Seamless, with auto-population from plans.
- **Itinerary by city**: Supported; UI improvements ongoing.
- **Budgeting, voting, and templates**: Supported, with further enhancements planned.
- **Public trip pages**: Exist; further polish and sharing features in progress.
- **Ongoing**: Improving real-time collaboration, error handling, and mobile UX.

---

## 📈 Visual Flow: From Group to Trip

```
[Group]
   └─ [Plan/Whiteboard]
         └─ [Voting, Polls, Brainstorming]
               └─ [Create Trip]
                     └─ [Trip]
                           └─ [Trip Cities]
                                 └─ [Itinerary Sections]
                                       └─ [Itinerary Items]
```

- **Every trip can have multiple cities, each with its own dates and itinerary.**
- **Trips are often born from group plans, but can also be created solo.**
- **The system is designed for flexibility, collaboration, and fun.**

---

_For more, see the [Groups Feature Doc](../docs/features/groups.md) and [Group Plans Doc](../docs/features/group%20plans.md)._
