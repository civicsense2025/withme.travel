# Authentication System Documentation

## Overview

The withme.travel authentication system supports both account-based and guest/anonymous flows. Users can create and explore trips as guests, and upgrade to a full account at any time. Authentication is required for sharing, collaboration, and persistent storage, but not for initial trip creation.

### Key Features
- **Guest/Anonymous Trip Creation:** Users can create a trip and explore the app without an account. A temporary guest session is created and managed securely.
- **Seamless Upgrade to Account:** At any point, guests can sign up or log in to save their progress and unlock full features. Their guest trip is seamlessly linked to their new account.
- **Account-Based Access:** Logged-in users have access to all features, including collaboration, sharing, and persistent storage.
- **Unified Auth State Management:** The AuthProvider and hooks handle both guest and authenticated user states, ensuring a consistent experience.
- **A/B Testing Ready:** The new flow enables robust experimentation on onboarding, conversion, and retention.

---

## Best Practices (2025)

- **Always use `getUser()` for Supabase auth checks** (never `getSession()`). This ensures you get the latest, secure user state and avoids stale or missing data.
- **Profile data must always be pulled from `public.profiles`**. Never use `public.users` (deprecated) for user-facing info.
- **Use the centralized `AuthProvider` and hooks** for all auth state and actions in React components.
- **Defensive programming:** Always check for null/undefined user, guest, or session states. Handle all loading, error, and fallback cases.
- **Never expose guest tokens or allow guest access to other users' data.**
- **Upgrade path:** When a guest signs up, always link their guest data to the new account securely.
- **Use constants from `utils/constants/database.ts`** for all DB access (never magic strings).
- **Enforce Row Level Security (RLS)** on all sensitive tables and endpoints.
- **Never store sensitive info in public tables or client-side state.**

---

## Guest Collaboration & Whiteboarding

- **Guest tokens** allow users to join group planning sessions and collaborative whiteboards without an account.
- Guests can:
  - Create and join group plans and whiteboards in real time
  - Add, edit, and move ideas, tasks, and comments
  - See other guests' and members' presence and edits live
- **Security boundaries:**
  - Each guest token is isolated to its own group/plan context
  - Guests cannot access or modify other groups or plans they are not invited to
  - Guest tokens are never exposed outside their intended session
  - All sensitive actions (export, sharing, inviting, persistent save) require upgrade to a full account
- **Upgrade path:**
  - At any time, a guest can sign up/log in to claim their group/plan and continue collaborating with full access
  - All guest edits and contributions are preserved and linked to the new account
- **Defensive design:**
  - The UI always reflects guest vs. member capabilities
  - Backend enforces strict RLS and token validation for all collaborative actions

---

## How It Works

### 1. Guest Session Creation
- When a user creates a trip without being logged in, the backend issues a secure, anonymous session (guest token) and associates the trip with this session.
- The guest session is managed via secure cookies, just like authenticated sessions, but with limited permissions.
- Guests can create, view, and edit their own trips, but cannot share, collaborate, or access account-only features until they upgrade.

### 2. Seamless Upgrade Path
- At any point, a guest can choose to sign up or log in.
- Upon authentication, the backend links the guest's trip(s) and data to the new user account, preserving all progress.
- The UI prompts users to upgrade at key moments (e.g., when trying to share or invite others).

### 3. Auth State Management
- The `AuthProvider` manages both guest and authenticated user states.
- All client and server utilities (hooks, helpers) are updated to recognize and handle guest sessions.
- Defensive programming ensures the UI always reflects the correct state (guest, logged in, loading, or error).

### 4. Permissions & Security
- Guest sessions have restricted permissions and cannot access or modify other users' data.
- All sensitive actions (sharing, collaboration, profile editing) require full authentication.
- The backend enforces these rules using Row Level Security (RLS) and session validation.

---

## Example Usage

### Guest Trip Creation (No Account Required)
```tsx
// In a client component
import { useAuth } from '@/components/auth-provider';

export default function CreateTripButton() {
  const { user, isGuest, createGuestTrip, signUp } = useAuth();

  const handleCreateTrip = async () => {
    if (isGuest) {
      // Create a trip as a guest
      await createGuestTrip();
    } else {
      // Create a trip as a logged-in user
      // ...
    }
  };

  return (
    <button onClick={handleCreateTrip}>
      {isGuest ? 'Try Without Account' : 'Create Trip'}
    </button>
  );
}
```

### Upgrading to Full Account
```tsx
// Prompt shown when guest tries to share or collaborate
if (isGuest) {
  return (
    <div>
      <p>Sign up to save and share your trip!</p>
      <button onClick={signUp}>Sign Up</button>
    </div>
  );
}
```

### Server-side Auth Check
```ts
import { createServerComponentClient } from '@supabase/ssr';

export async function getServerSession() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### Why This Change?
- **Lower Friction:** Users can immediately try the core features without the barrier of account creation.
- **Increased Engagement:** Early data shows higher engagement and more trips started when users aren't forced to sign up first.
- **Flexible Onboarding:** We can now experiment with different upgrade prompts, timing, and messaging to optimize conversion.

const { data: profile } = await supabase
  .from(TABLES.PROFILES)
  .select('name, avatar_url, bio')
  .eq('id', user.id)
  .single();
```

### Client-side Auth State
```tsx
import { useAuth } from '@/components/auth-provider';

const { user, isGuest, signUp } = useAuth();
if (!user && !isGuest) return <Loading />;
if (isGuest) return <button onClick={signUp}>Sign Up</button>;
```

---

## What to Avoid

- Never use `getSession()` for auth checks—always use `getUser()`.
- Never query or join on `public.users` for profile data—always use `public.profiles`.
- Never use magic strings for table/field names—always use constants.
- Never assume a user is authenticated—always check and handle guest/null states.
- Never expose guest tokens or allow cross-user guest access.

---

## FAQ

**Q: Why use `getUser()` instead of `getSession()`?**
A: `getUser()` always returns the current, secure user state and is recommended by Supabase for all server/client checks. `getSession()` can be stale or missing in SSR/edge environments.

**Q: Where should I get user profile data?**
A: Always from `public.profiles`. `public.users` is deprecated and should never be used for display or joins.

**Q: How do I handle guest vs. authenticated users?**
A: Use the `AuthProvider` and its hooks. Always check for both states and handle loading/errors defensively.

**Q: How do I ensure secure connections?**
A: Use only the official Supabase clients, enforce RLS, never expose tokens, and always validate user/session on the backend.

**Q: What if I need to join user data in a query?**
A: Join on `public.profiles` using the user's ID. Never join on `public.users`.

**Q: Can guests collaborate in real time on group plans and whiteboards?**
A: Yes! Guest tokens allow real-time group planning and whiteboarding with other guests and members, but guests are strictly isolated to their invited group/plan. All sensitive actions and persistent saves require an upgrade to a full account.

---

## Summary

The new authentication system enables a frictionless, guest-friendly onboarding experience while maintaining robust security and a seamless upgrade path to full accounts. This unlocks powerful A/B testing and conversion optimization, helping us build a more engaging and user-friendly platform.
