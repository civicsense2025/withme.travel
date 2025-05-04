
# Onborda Implementation Plan for withme.travel

After reviewing the Onborda product tour library, I can see it offers significant advantages over static onboarding approaches. Here's a comprehensive implementation plan to integrate Onborda into withme.travel.

## 1. Overview of Onborda Features

Onborda is a modern product tour library for Next.js that provides:
- Interactive guided tours powered by Framer Motion
- Seamless cross-route navigation while maintaining tour context
- Multiple tour support for different user journeys
- Customizable UI that integrates with Tailwind CSS
- Built on Radix UI components for accessibility

## 2. Implementation Plan

### Phase 1: Initial Setup (1-2 days)

1. **Install dependencies**
   ```bash
   npm install onborda
   # or
   pnpm add onborda
   ```

2. **Create Onborda provider in components/providers.tsx**
   ```tsx
   import { OnbordaProvider } from 'onborda';
   
   // Add to existing providers.tsx or create new component
   export function OnboardaWrapper({ children }) {
     return (
       <OnbordaProvider>
         {children}
       </OnbordaProvider>
     );
   }
   ```

3. **Integrate provider in app/layout.tsx**
   ```tsx
   import { OnboardaWrapper } from '@/components/providers';
   
   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           <OnboardaWrapper>
             {/* Existing providers */}
             {children}
           </OnboardaWrapper>
         </body>
       </html>
     );
   }
   ```

### Phase 2: User Onboarding Tour (3-4 days)

1. **Define key onboarding steps**
   - Create a config file at `lib/onboarding/tours.ts`
   ```tsx
   import { TourConfig } from 'onborda';
   
   export const mainOnboardingTour: TourConfig = {
     id: 'main-onboarding',
     steps: [
       {
         id: 'welcome',
         title: 'Welcome to withme.travel',
         content: 'Plan trips with friends and make travel easier together.',
         target: '.hero-section', // Target hero section on homepage
       },
       {
         id: 'create-trip',
         title: 'Create your first trip',
         content: 'Get started by creating a new trip or exploring templates.',
         target: '.create-trip-button',
       },
       // Additional steps as needed
     ],
   };
   ```

2. **Create Onboarding Controller Component**
   ```tsx
   // components/onboarding/onboarding-controller.tsx
   'use client';
   
   import { useEffect } from 'react';
   import { useTour } from 'onborda';
   import { useAuth } from '@/components/auth-provider';
   import { mainOnboardingTour } from '@/lib/onboarding/tours';
   
   export function OnboardingController() {
     const { startTour, endTour } = useTour();
     const { user } = useAuth();
     
     useEffect(() => {
       // Start tour if user is new and hasn't completed onboarding
       if (user && !user.onboarded) {
         startTour(mainOnboardingTour);
       }
       
       return () => {
         endTour();
       };
     }, [user, startTour, endTour]);
     
     return null; // This is a logic-only component
   }
   ```

3. **Add controller to app page**
   ```tsx
   // app/page.tsx
   import { OnboardingController } from '@/components/onboarding/onboarding-controller';
   
   export default function Home() {
     return (
       <>
         <OnboardingController />
         {/* Rest of homepage content */}
       </>
     );
   }
   ```

### Phase 3: Track Onboarding Completion (2 days)

1. **Create API endpoint to mark onboarding complete**
   ```tsx
   // app/api/user/onboarding/complete/route.ts
   import { createRouteHandlerClient } from '@supabase/ssr';
   import { NextResponse } from 'next/server';
   import { TABLES } from '@/utils/constants/database';
   
   export async function POST() {
     const supabase = createRouteHandlerClient();
     
     const { data: { session } } = await supabase.auth.getSession();
     if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     // Update user profile
     const { error } = await supabase
       .from(TABLES.PROFILES)
       .update({ onboarded: true })
       .eq('id', session.user.id);
       
     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
     
     return NextResponse.json({ success: true });
   }
   ```

2. **Add completion tracking to onboarding controller**
   ```tsx
   // components/onboarding/onboarding-controller.tsx (updated)
   'use client';
   
   import { useEffect } from 'react';
   import { useTour } from 'onborda';
   import { useAuth } from '@/components/auth-provider';
   import { mainOnboardingTour } from '@/lib/onboarding/tours';
   
   export function OnboardingController() {
     const { startTour, endTour, currentTour } = useTour();
     const { user, updateUser } = useAuth();
     
     useEffect(() => {
       if (user && !user.onboarded) {
         startTour(mainOnboardingTour);
       }
       
       return () => {
         endTour();
       };
     }, [user, startTour, endTour]);
     
     // Track tour completion
     useEffect(() => {
       if (currentTour?.completed && user && !user.onboarded) {
         // Mark onboarding as complete
         fetch('/api/user/onboarding/complete', {
           method: 'POST',
         }).then(() => {
           // Update local user state
           updateUser({ ...user, onboarded: true });
         });
       }
     }, [currentTour?.completed, user, updateUser]);
     
     return null;
   }
   ```

### Phase 4: Add DB Schema Updates (1 day)

1. **Update profiles table schema (if needed)**
   ```sql
   -- Add onboarded column to profiles table if it doesn't exist
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;
   ```

2. **Create migration file if using migrations**
   ```sql
   -- migrations/add_onboarded_field.sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;
   ```

## 3. Additional Feature Tours

Beyond onboarding, here are other features that could benefit from Onborda tours:

### 1. Trip Planning Process (2-3 days)
```tsx
// lib/onboarding/tours.ts
export const tripPlanningTour: TourConfig = {
  id: 'trip-planning',
  steps: [
    {
      id: 'trip-overview',
      title: 'Trip Overview',
      content: 'This is where you can see all your trip details at a glance.',
      target: '.trip-overview-tab',
    },
    {
      id: 'add-itinerary-item',
      title: 'Add to Itinerary',
      content: 'Click here to add activities, accommodations, or transportation to your trip.',
      target: '.add-itinerary-item-button',
    },
    {
      id: 'invite-members',
      title: 'Invite Friends',
      content: 'Collaborate by inviting friends to join your trip planning.',
      target: '.members-tab',
    },
  ],
};
```

### 2. Collaborative Features Tour (2 days)
```tsx
export const collaborationTour: TourConfig = {
  id: 'collaboration-features',
  steps: [
    {
      id: 'presence-indicators',
      title: 'See Who\'s Online',
      content: 'These indicators show which trip members are currently online.',
      target: '.presence-indicator',
    },
    {
      id: 'collaborative-notes',
      title: 'Shared Notes',
      content: 'Write notes together in real-time with your travel companions.',
      target: '.collaborative-notes',
    },
    {
      id: 'comments-section',
      title: 'Discuss Ideas',
      content: 'Add comments to discuss specific itinerary items.',
      target: '.trip-item-comments',
    },
  ],
};
```

### 3. Budget Management Tour (2 days)
```tsx
export const budgetTour: TourConfig = {
  id: 'budget-management',
  steps: [
    {
      id: 'budget-overview',
      title: 'Budget Overview',
      content: 'Track your trip expenses and budget in one place.',
      target: '.budget-tab',
    },
    {
      id: 'add-expense',
      title: 'Add Expenses',
      content: 'Click here to add new expenses to your trip.',
      target: '.add-expense-button',
    },
    {
      id: 'expense-categories',
      title: 'Expense Categories',
      content: 'Organize expenses by categories for better tracking.',
      target: '.expense-categories',
    },
  ],
};
```

### 4. Feature Discovery for New Features (ongoing)

Create dynamic tours to introduce new features as they're released:

```tsx
// components/feature-discovery/new-feature-tour.tsx
'use client';

import { useEffect } from 'react';
import { useTour } from 'onborda';
import { useLocalStorage } from '@/hooks';

export function NewFeatureTour({ featureKey, tourConfig }) {
  const { startTour } = useTour();
  const [seenFeatures, setSeenFeatures] = useLocalStorage('seen-features', {});
  
  useEffect(() => {
    // Only show tour if user hasn't seen this feature
    if (!seenFeatures[featureKey]) {
      startTour(tourConfig);
      // Mark feature as seen
      setSeenFeatures({
        ...seenFeatures,
        [featureKey]: true,
      });
    }
  }, [featureKey, tourConfig, startTour, seenFeatures, setSeenFeatures]);
  
  return null;
}
```

## 4. UI Component for Manual Tour Triggers

Create buttons to allow users to start tours manually:

```tsx
// components/ui/tour-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useTour } from 'onborda';

export function TourButton({ tourConfig, children, ...props }) {
  const { startTour } = useTour();
  
  return (
    <Button 
      onClick={() => startTour(tourConfig)} 
      variant="ghost" 
      size="sm" 
      {...props}
    >
      {children || 'Take the tour'}
    </Button>
  );
}
```

## 5. Testing Plan (2 days)

1. **Unit testing for tour configurations**
2. **Integration testing for onboarding completion**
3. **User testing with different devices/screen sizes**
4. **Accessibility testing**

## 6. Timeline Summary

- **Phase 1 (Initial Setup)**: 1-2 days
- **Phase 2 (User Onboarding)**: 3-4 days
- **Phase 3 (Completion Tracking)**: 2 days  
- **Phase 4 (DB Schema Updates)**: 1 day
- **Additional Feature Tours**: 6-7 days (can be implemented iteratively)
- **Testing**: 2 days

**Total initial implementation**: ~10 days for core functionality
**Extended implementation**: ~17 days for all features

## 7. Benefits Over Current Approach

1. **Interactive vs Static**: Replaces static how-to text with interactive guidance
2. **Contextual Learning**: Shows users features in the context where they'll use them
3. **Cross-Route Support**: Maintains tour state even when navigating between pages
4. **Progressive Disclosure**: Introduces features gradually to avoid overwhelming users
5. **Customizable**: Can be styled to match withme.travel's design system
6. **Trackable**: Provides metrics on which tours users complete or abandon

## 8. Next Steps

1. Install and test Onborda in a development environment
2. Create the first basic onboarding tour
3. Implement onboarding completion tracking
4. Gather user feedback and iterate
5. Gradually expand to additional feature tours


# Expanded Onborda Implementation for withme.travel

## 1. Overview of Onborda Features

Onborda is a modern product tour library for Next.js that provides:
- Interactive guided tours powered by Framer Motion animations
- Seamless cross-route navigation while maintaining tour context
- Multiple tour support for different user journeys and features
- Customizable UI that integrates with Tailwind CSS
- Built on Radix UI components for accessibility
- MutationObserver support for dynamic content

## 2. Detailed Implementation Guide

### Phase 1: Initial Setup (1-2 days)

#### 1. Install dependencies
```bash
pnpm add onborda
```

#### 2. Create Onborda provider in existing providers file

```tsx
// components/providers.tsx
'use client';

import { OnbordaProvider } from 'onborda';
import { ThemeProvider } from '@/components/theme-provider';
// Import other existing providers

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <OnbordaProvider 
        options={{
          zIndex: 9999, // Above modals and other UI elements
          defaultShowProgress: true,
          defaultShowCloseButton: true,
          defaultHighlightColor: "hsl(var(--primary))", // Match withme.travel theme
          defaultOverlayOpacity: 0.7,
          defaultShowArrow: true,
        }}
      >
        {/* Other existing providers */}
        {children}
      </OnbordaProvider>
    </ThemeProvider>
  );
}
```

#### 3. Extend types to include onboarded property

```typescript
// types/global.d.ts (augment or create)

// Update User type to include onboarded field
interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  onboarded?: boolean; // New field indicating onboarding completion
  // Other existing fields
}
```

### Phase 2: Onboarding Infrastructure (3-4 days)

#### 1. Create onboarding directory structure

```
/lib
  /onboarding
    /tours
      main-tour.ts
      trip-planning-tour.ts
      collaboration-tour.ts
      budget-tour.ts
    index.ts      # Export all tours
    hooks.ts      # Custom onboarding hooks
    types.ts      # Onboarding type definitions
    utils.ts      # Helper functions

/components
  /onboarding
    onboarding-controller.tsx
    tour-button.tsx
    feature-tour.tsx
    tour-trigger.tsx
```

#### 2. Define detailed type definitions

```typescript
// lib/onboarding/types.ts
import { TourConfig as OnbordaTourConfig, TourStep as OnbordaTourStep } from 'onborda';

// Extend built-in types with withme.travel specific properties
export interface TourStep extends OnbordaTourStep {
  requiredRole?: 'admin' | 'editor' | 'viewer'; // Only show step for certain roles
  requiredFeature?: string;                     // Only show if feature flag is true
  skipIf?: (userData: any) => boolean;          // Custom skip logic
}

export interface TourConfig extends OnbordaTourConfig {
  steps: TourStep[];
  allowSkip?: boolean;              // Can user skip the entire tour?
  required?: boolean;               // Is this tour required to complete?
  requireAuth?: boolean;            // Require authentication
  persistCompletion?: boolean;      // Save completion to database
  autostart?: boolean;              // Start automatically
  priority?: number;                // Higher priority tours shown first
}

// Tour categories
export type TourCategory = 
  | 'onboarding'
  | 'trip-planning'
  | 'collaboration'
  | 'budget'
  | 'advanced'
  | 'new-feature';
```

#### 3. Create main onboarding tour with more detailed steps

```typescript
// lib/onboarding/tours/main-tour.ts
import { TourConfig } from '../types';

export const mainOnboardingTour: TourConfig = {
  id: 'main-onboarding',
  allowSkip: false,
  required: true,
  persistCompletion: true,
  autostart: true,
  priority: 10,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to withme.travel!',
      content: 'Plan trips with friends and make travel easier together. This quick tour will show you how to get started.',
      target: '.hero-section',
      placement: 'center',
      showBackdrop: true,
      highlightPadding: 8,
    },
    {
      id: 'create-trip',
      title: 'Create your first trip',
      content: 'Get started by creating a new trip. You can start from scratch or use one of our templates.',
      target: '.create-trip-button',
      placement: 'bottom',
      showArrow: true,
    },
    {
      id: 'trending-destinations',
      title: 'Discover destinations',
      content: 'Explore trending destinations for inspiration or search for your dream location.',
      target: '.trending-destinations',
      placement: 'left',
    },
    {
      id: 'navbar',
      title: 'Navigation',
      content: 'Access your trips, saved content, and account settings from the navigation bar.',
      target: '.navbar',
      placement: 'bottom',
    },
    {
      id: 'profile',
      title: 'Complete your profile',
      content: 'Add more details to your profile to enhance collaboration with travel companions.',
      target: '.user-menu-button',
      placement: 'bottom-end',
      showArrow: true,
    },
    {
      id: 'finish',
      title: 'You\'re all set!',
      content: 'You\'re ready to start planning your trips. Happy travels!',
      placement: 'center',
      showBackdrop: true,
      target: 'body',
    },
  ],
};
```

#### 4. Create custom hooks for onboarding management

```typescript
// lib/onboarding/hooks.ts
'use client';

import { useEffect, useState } from 'react';
import { useTour } from 'onborda';
import { useAuth } from '@/components/auth-provider';
import { mainOnboardingTour } from './tours/main-tour';

// Hook to manage onboarding status
export function useOnboarding() {
  const { user, updateUser } = useAuth();
  const { startTour, currentTour, endTour } = useTour();
  const [isComplete, setIsComplete] = useState<boolean>(user?.onboarded || false);
  
  // Start tour if user is not onboarded
  const startOnboarding = () => {
    if (user && !user.onboarded) {
      startTour(mainOnboardingTour);
    }
  };
  
  // Mark onboarding as complete
  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user/onboarding/complete', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Update local state
        updateUser({ ...user, onboarded: true });
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };
  
  // Track tour completion
  useEffect(() => {
    if (currentTour?.completed && user && !isComplete) {
      completeOnboarding();
    }
  }, [currentTour?.completed, user, isComplete]);
  
  return {
    isComplete,
    startOnboarding,
    completeOnboarding,
    currentTour,
    endTour,
  };
}

// Hook for feature tours
export function useFeatureTour(tourId: string, tourConfig: any) {
  const { startTour, endTour, currentTour } = useTour();
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(false);
  
  // Check local storage to see if user has seen this tour
  useEffect(() => {
    const seenTours = JSON.parse(localStorage.getItem('seen-tours') || '{}');
    setHasSeenTour(!!seenTours[tourId]);
  }, [tourId]);
  
  // Start feature tour
  const startFeatureTour = () => {
    startTour(tourConfig);
  };
  
  // Mark tour as seen
  const markTourAsSeen = () => {
    const seenTours = JSON.parse(localStorage.getItem('seen-tours') || '{}');
    seenTours[tourId] = true;
    localStorage.setItem('seen-tours', JSON.stringify(seenTours));
    setHasSeenTour(true);
  };
  
  // Track tour completion
  useEffect(() => {
    if (currentTour?.id === tourId && currentTour?.completed && !hasSeenTour) {
      markTourAsSeen();
    }
  }, [currentTour, tourId, hasSeenTour]);
  
  return {
    hasSeenTour,
    startFeatureTour,
    markTourAsSeen,
  };
}
```

#### 5. Create robust onboarding controller

```tsx
// components/onboarding/onboarding-controller.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding/hooks';
import { useAuth } from '@/components/auth-provider';

export function OnboardingController() {
  const { user } = useAuth();
  const { isComplete, startOnboarding } = useOnboarding();
  const pathname = usePathname();
  const hasTriggeredOnboarding = useRef(false);
  
  // Start onboarding on homepage for new users
  useEffect(() => {
    // Only trigger onboarding on the homepage for new users
    if (
      !isComplete &&
      user &&
      pathname === '/' &&
      !hasTriggeredOnboarding.current
    ) {
      hasTriggeredOnboarding.current = true;
      
      // Small delay to ensure page has loaded
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isComplete, pathname, startOnboarding]);
  
  return null; // This is a logic-only component
}
```

#### 6. Add TypeScript-friendly tour button component

```tsx
// components/onboarding/tour-button.tsx
'use client';

import { ComponentPropsWithoutRef } from 'react';
import { useTour } from 'onborda';
import { Button } from '@/components/ui/button';
import { TourConfig } from '@/lib/onboarding/types';

interface TourButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  tourConfig: TourConfig;
  onTourStart?: () => void;
  onTourEnd?: () => void;
}

export function TourButton({
  tourConfig,
  children = 'Take the tour',
  variant = 'outline',
  size = 'sm',
  onTourStart,
  onTourEnd,
  ...props
}: TourButtonProps) {
  const { startTour, endTour } = useTour();
  
  const handleStartTour = () => {
    startTour(tourConfig);
    onTourStart?.();
  };
  
  return (
    <Button 
      onClick={handleStartTour} 
      variant={variant} 
      size={size} 
      {...props}
    >
      {children}
    </Button>
  );
}
```

### Phase 3: API and Database Integration (2-3 days)

#### 1. Create detailed API endpoint for onboarding completion

```typescript
// app/api/user/onboarding/complete/route.ts
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get request body if any additional data is sent
    const requestData = await request.json().catch(() => ({}));
    
    // Get current timestamp
    const completedAt = new Date().toISOString();
    
    // Update user profile
    const { error: updateError } = await supabase
      .from(TABLES.PROFILES)
      .update({
        onboarded: true,
        onboarded_at: completedAt,
        onboarding_data: requestData.tourData || null,
      })
      .eq(FIELDS.PROFILES.ID, session.user.id);
    
    if (updateError) {
      console.error('Error updating onboarding status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update onboarding status' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      completedAt,
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Create API endpoint to get onboarding status

```typescript
// app/api/user/onboarding/status/route.ts
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get user profile with onboarding status
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select(`
        ${FIELDS.PROFILES.ONBOARDED},
        ${FIELDS.PROFILES.ONBOARDED_AT},
        ${FIELDS.PROFILES.ONBOARDING_DATA}
      `)
      .eq(FIELDS.PROFILES.ID, session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching onboarding status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding status' },
        { status: 500 }
      );
    }
    
    // Return onboarding status
    return NextResponse.json({
      onboarded: data.onboarded || false,
      onboardedAt: data.onboarded_at || null,
      onboardingData: data.onboarding_data || null,
    });
  } catch (error) {
    console.error('Onboarding status fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3. Add SQL migration script with full details

```sql
-- migrations/add_onboarding_fields.sql

-- Add onboarding fields to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB,
  ADD COLUMN IF NOT EXISTS feature_tours_seen JSONB DEFAULT '{}'::JSONB;

-- Create function to update onboarding status
CREATE OR REPLACE FUNCTION update_onboarding_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarded = TRUE AND OLD.onboarded = FALSE THEN
    NEW.onboarded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set onboarded_at timestamp
DROP TRIGGER IF EXISTS set_onboarded_at ON profiles;
CREATE TRIGGER set_onboarded_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_onboarding_status();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarded ON profiles (onboarded);

-- Create onboarding events table to track detailed onboarding activity
CREATE TABLE IF NOT EXISTS onboarding_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  tour_id VARCHAR(100),
  step_id VARCHAR(100),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index for onboarding events
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events (user_id);
```

### Phase 4: Feature-Specific Tours (3-4 days)

#### 1. Create Trip Planning Tour with detailed steps

```typescript
// lib/onboarding/tours/trip-planning-tour.ts
import { TourConfig } from '../types';

export const tripPlanningTour: TourConfig = {
  id: 'trip-planning',
  allowSkip: true,
  persistCompletion: true,
  requireAuth: true,
  steps: [
    {
      id: 'trip-header',
      title: 'Trip Overview',
      content: 'This is your trip dashboard. Here you can see all your trip details and collaborate with others.',
      target: '.trip-header',
      placement: 'bottom',
      highlightPadding: 10,
    },
    {
      id: 'trip-tabs',
      title: 'Trip Management Sections',
      content: 'Navigate between different aspects of your trip using these tabs.',
      target: '.trips-tabs',
      placement: 'bottom',
    },
    {
      id: 'itinerary-section',
      title: 'Plan Your Itinerary',
      content: 'Add day-by-day activities, accommodations, and transportation to your trip.',
      target: '.itinerary-section',
      placement: 'right',
      highlightPadding: 5,
    },
    {
      id: 'add-item-button',
      title: 'Add Items to Your Itinerary',
      content: 'Click here to add new activities, accommodations, or transportation.',
      target: '.add-itinerary-item-button',
      placement: 'top',
      showArrow: true,
    },
    {
      id: 'reorder-items',
      title: 'Organize Your Days',
      content: 'Drag and drop items to rearrange your itinerary as needed.',
      target: '.itinerary-item',
      placement: 'left',
    },
    {
      id: 'members-section',
      title: 'Collaborate with Others',
      content: 'Invite friends and family to join your trip planning.',
      target: '.members-tab',
      placement: 'left',
    },
    {
      id: 'finish',
      title: 'Ready to Plan!',
      content: 'You now know the basics of trip planning. Add your first activity to get started!',
      placement: 'center',
      showBackdrop: true,
      target: 'body',
    },
  ],
};
```

#### 2. Create integration for trip details page

```tsx
// app/trips/[tripId]/trip-tour-controller.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTour } from 'onborda';
import { tripPlanningTour } from '@/lib/onboarding/tours/trip-planning-tour';
import { useFeatureTour } from '@/lib/onboarding/hooks';

interface TripTourControllerProps {
  tripId: string;
  isNewTrip?: boolean;
}

export function TripTourController({ tripId, isNewTrip }: TripTourControllerProps) {
  const { startFeatureTour, hasSeenTour } = useFeatureTour('trip-planning', tripPlanningTour);
  const searchParams = useSearchParams();
  const showTour = searchParams.get('tour') === 'true';
  
  useEffect(() => {
    // Auto-start tour for new trips or when explicitly requested
    if ((isNewTrip || showTour) && !hasSeenTour) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startFeatureTour();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isNewTrip, showTour, hasSeenTour, startFeatureTour]);
  
  return null;
}
```

#### 3. Create advanced collaborative features tour

```typescript
// lib/onboarding/tours/collaboration-tour.ts
import { TourConfig } from '../types';

export const collaborationTour: TourConfig = {
  id: 'collaboration-features',
  allowSkip: true,
  persistCompletion: true,
  requireAuth: true,
  steps: [
    {
      id: 'presence-overview',
      title: 'Real-time Collaboration',
      content: 'withme.travel lets you plan trips together in real-time with your travel companions.',
      target: '.trip-header',
      placement: 'bottom',
    },
    {
      id: 'presence-indicators',
      title: 'See Who\'s Online',
      content: 'These indicators show which trip members are currently online.',
      target: '.presence-indicator',
      placement: 'right',
    },
    {
      id: 'collaborative-notes',
      title: 'Shared Notes',
      content: 'Write notes together in real-time with your travel companions.',
      target: '.collaborative-notes',
      placement: 'top',
    },
    {
      id: 'content-editing',
      title: 'Edit Together',
      content: 'Changes you make are instantly visible to others working on the trip.',
      target: '.collaborative-editor',
      placement: 'right',
    },
    {
      id: 'cursor-awareness',
      title: 'See Others\' Cursors',
      content: 'You can see where others are editing in real-time.',
      target: '.cursor-awareness',
      placement: 'bottom',
    },
    {
      id: 'finish',
      title: 'Ready to Collaborate!',
      content: 'Now you can plan your trip together with others in real-time.',
      placement: 'center',
      showBackdrop: true,
      target: 'body',
    },
  ],
};
```

## 3. FAQ Section

### General Questions

#### What is Onborda and why should we use it?
Onborda is a Next.js library for creating interactive product tours. It's ideal for withme.travel because it offers cross-route tour persistence, modern animations with Framer Motion, and integrates well with our existing Tailwind/Radix UI components. It replaces static instructional text with contextual, interactive guidance.

#### How does Onborda compare to other onboarding solutions?
Compared to alternatives like Intro.js or React-Joyride, Onborda is specifically built for Next.js applications with modern styling and cross-route capabilities, which is perfect for our multi-page application flow. It also offers better TypeScript integration and Tailwind CSS compatibility.

#### Will implementing Onborda require significant changes to our codebase?
No, integration is minimal. We'll add the Onborda provider to our existing providers, create tour configurations, and add the controller components. Most of our existing UI components don't need modification.

#### How will this impact performance?
Onborda has minimal impact on performance. It uses dynamic imports to only load when needed and leverages Framer Motion's efficient animation system. The core bundle is lightweight (approximately 20-30KB gzipped).

### Implementation Questions

#### Do we need to modify our database schema?
Yes, we need to add onboarding-related fields to the profiles table: `onboarded` (boolean), `onboarded_at` (timestamp), and `onboarding_data` (JSONB). We'll also create an optional `onboarding_events` table for detailed analytics.

#### How do we track onboarding completion for users?
We'll update the user's profile record when they complete the main onboarding tour. Additionally, we can track specific tour completions in the `feature_tours_seen` JSONB field or the `onboarding_events` table.

#### Can users skip the onboarding?
Yes, this is configurable per tour. For essential onboarding, we can set `allowSkip: false`, while feature-specific tours can have `allowSkip: true`. We can also provide manual triggers for users to restart tours.

#### What happens if a user changes page during a tour?
Onborda maintains the tour state across routes. When the user navigates to a new page, the tour will pause and resume once the target elements are available on the new page.

#### How do we handle responsive design in tours?
Onborda provides placement options that intelligently adjust based on screen size. We'll configure each step with appropriate placement options (top, bottom, left, right, etc.), and Onborda will position tooltips optimally based on available space.

### Technical Questions

#### How do we integrate with our authentication system?
We'll use our existing `auth-provider.tsx` to access user data. The onboarding controller will check if the user has completed onboarding and trigger the appropriate tour accordingly.

#### Can we have multiple tours active at once?
No, Onborda shows one tour at a time. However, we can sequence tours by triggering a new tour when one completes, creating a multi-stage onboarding journey.

#### How do we target dynamically created elements?
Onborda uses selectors to find target elements. For dynamically created items, we should ensure they have consistent class names or data attributes. Onborda also provides a `waitForElement` option to wait until elements become available.

#### Is the library accessible?
Yes, Onborda is built on Radix UI primitives, which provide strong accessibility foundations. Tooltips support keyboard navigation, and the overlay ensures proper focus management.

#### How can we customize the appearance to match our design?
Onborda accepts styling props for colors, padding, and animation settings. We can use our withme.travel color scheme from `utils/constants/ui.ts` and match our existing component styling.

## 4. 20 Feature Tour Ideas

Based on the codebase, here are 20 specific onboarding tour ideas:

### 1. Trip Creation Walkthrough
Guides users through creating their first trip from scratch, including naming, dates, and destination selection.

```typescript
// lib/onboarding/tours/trip-creation-tour.ts
export const tripCreationTour = {
  id: 'trip-creation',
  steps: [
    {
      id: 'start',
      title: 'Create a New Trip',
      content: 'Let\'s walk through creating your first trip.',
      target: '.create-trip-button',
    },
    {
      id: 'trip-name',
      title: 'Name Your Trip',
      content: 'Give your trip a descriptive name that helps you remember it.',
      target: '.trip-name-input',
    },
    {
      id: 'trip-dates',
      title: 'Set Your Travel Dates',
      content: 'Add your planned travel dates. Don\'t worry, you can change these later.',
      target: '.date-picker',
    },
    {
      id: 'destination',
      title: 'Choose a Destination',
      content: 'Search for your destination city or country.',
      target: '.destination-search',
    },
    // Additional steps...
  ],
};
```

### 2. Destination Exploration Tour
Showcases how to browse, search, and save destinations for future trips.

```typescript
export const destinationExplorationTour = {
  id: 'destination-exploration',
  steps: [
    {
      id: 'trending',
      title: 'Trending Destinations',
      content: 'Discover popular destinations other travelers are visiting.',
      target: '.trending-destinations',
    },
    {
      id: 'search',
      title: 'Search For Places',
      content: 'Find specific destinations you\'re interested in visiting.',
      target: '.destination-search-bar',
    },
    {
      id: 'filtering',
      title: 'Filter Destinations',
      content: 'Narrow down destinations by continent, interests, or season.',
      target: '.destination-filters',
    },
    // Additional steps...
  ],
};
```

### 3. Itinerary Management Tour
Shows how to add, edit, and organize itinerary items within a trip.

```typescript
export const itineraryManagementTour = {
  id: 'itinerary-management',
  steps: [
    {
      id: 'add-item',
      title: 'Add to Itinerary',
      content: 'Click here to add activities, accommodations, or transportation.',
      target: '.add-itinerary-item-button',
    },
    {
      id: 'itinerary-days',
      title: 'Organize by Day',
      content: 'Your itinerary is organized by day to help you plan your schedule.',
      target: '.ItineraryDaySection',
    },
    {
      id: 'item-details',
      title: 'Item Details',
      content: 'Click any item to view or edit its details.',
      target: '.itinerary-item',
    },
    // Additional steps...
  ],
};
```

### 4. Budget Management Tour
Introduction to the budget tracking features for trip expenses.

```typescript
export const budgetManagementTour = {
  id: 'budget-tour',
  steps: [
    {
      id: 'budget-overview',
      title: 'Budget Overview',
      content: 'Track all your trip expenses in one place.',
      target: '.budget-tab',
    },
    {
      id: 'add-expense',
      title: 'Record Expenses',
      content: 'Add new expenses as you plan or during your trip.',
      target: '.add-expense-button',
    },
    {
      id: 'expense-categories',
      title: 'Expense Categories',
      content: 'Organize expenses by categories like accommodation, food, and transportation.',
      target: '.expense-categories',
    },
    // Additional steps...
  ],
};
```

### 5. Trip Sharing Tour
Demonstrates how to invite others to collaborate on trip planning.

```typescript
export const tripSharingTour = {
  id: 'trip-sharing',
  steps: [
    {
      id: 'members-tab',
      title: 'Trip Members',
      content: 'See who has access to this trip and their permissions.',
      target: '.members-tab',
    },
    {
      id: 'invite-button',
      title: 'Invite Others',
      content: 'Add friends and family to collaborate on your trip planning.',
      target: '.invite-button',
    },
    {
      id: 'permission-levels',
      title: 'Permission Levels',
      content: 'Choose what others can view or edit in your trip.',
      target: '.permission-selector',
    },
    // Additional steps...
  ],
};
```

### 6. Collaborative Notes Tour
Introduces the real-time collaborative notes feature.

```typescript
export const collaborativeNotesTour = {
  id: 'collaborative-notes',
  steps: [
    {
      id: 'notes-tab',
      title: 'Trip Notes',
      content: 'Take notes and share thoughts with your travel companions.',
      target: '.trip-notes-editor',
    },
    {
      id: 'formatting',
      title: 'Format Your Notes',
      content: 'Use the toolbar to format text, add lists, and more.',
      target: '.editor-toolbar',
    },
    {
      id: 'real-time',
      title: 'Real-time Collaboration',
      content: 'Changes appear instantly for everyone viewing the notes.',
      target: '.collaborative-editor',
    },
    // Additional steps...
  ],
};
```

### 7. Maps and Location Features Tour
Showcases map-based planning tools and location searching.

```typescript
export const mapsFeaturesTour = {
  id: 'maps-features',
  steps: [
    {
      id: 'trip-map',
      title: 'Trip Map',
      content: 'View all your planned destinations and activities on a map.',
      target: '.trip-map',
    },
    {
      id: 'location-search',
      title: 'Find Places',
      content: 'Search for specific locations to add to your itinerary.',
      target: '.location-search',
    },
    {
      id: 'place-details',
      title: 'Place Details',
      content: 'View details about a location including address, hours, and reviews.',
      target: '.place-details',
    },
    // Additional steps...
  ],
};
```

### 8. Trip Templates Tour
Shows how to use pre-built trip templates to jumpstart planning.

```typescript
export const tripTemplatesTour = {
  id: 'trip-templates',
  steps: [
    {
      id: 'template-gallery',
      title: 'Template Gallery',
      content: 'Browse pre-built trip itineraries created by travel experts.',
      target: '.template-gallery',
    },
    {
      id: 'template-preview',
      title: 'Preview Templates',
      content: 'See what\'s included in each template before using it.',
      target: '.itinerary-template-detail',
    },
    {
      id: 'use-template',
      title: 'Use a Template',
      content: 'Apply a template to quickly build your trip itinerary.',
      target: '.use-template-button',
    },
    // Additional steps...
  ],
};
```

### 9. Profile Customization Tour
Guides users through setting up their profile details.

```typescript
export const profileCustomizationTour = {
  id: 'profile-customization',
  steps: [
    {
      id: 'profile-menu',
      title: 'Your Profile',
      content: 'Access your profile settings from here.',
      target: '.user-menu-button',
    },
    {
      id: 'avatar',
      title: 'Profile Picture',
      content: 'Add or change your profile picture to help others recognize you.',
      target: '.avatar-upload',
    },
    {
      id: 'display-name',
      title: 'Your Name',
      content: 'Set your display name for collaboration with others.',
      target: '.display-name-input',
    },
    // Additional steps...
  ],
};
```

### 10. Calendar Export Tour
Shows how to export trip plans to calendar applications.

```typescript
export const calendarExportTour = {
  id: 'calendar-export',
  steps: [
    {
      id: 'export-button',
      title: 'Export to Calendar',
      content: 'Share your itinerary with your calendar app.',
      target: '.export-calendar-dialog',
    },
    {
      id: 'export-options',
      title: 'Export Options',
      content: 'Choose what to include in your calendar export.',
      target: '.export-options',
    },
    {
      id: 'download-calendar',
      title: 'Download Calendar File',
      content: 'Download and import into your favorite calendar application.',
      target: '.download-calendar-button',
    },
    // Additional steps...
  ],
};
```

### 11. Likes and Favorites Tour
Introduces the functionality to save favorite content.

```typescript
export const likesTour = {
  id: 'likes-tour',
  steps: [
    {
      id: 'like-button',
      title: 'Save Favorites',
      content: 'Click the heart icon to save destinations or trips you\'re interested in.',
      target: '.like-button',
    },
    {
      id: 'saved-items',
      title: 'View Saved Items',
      content: 'Access all your saved content in one place.',
      target: '.saved-link',
    },
    {
      id: 'organize-saves',
      title: 'Organize Saved Items',
      content: 'Sort and filter your saved content by type or date.',
      target: '.saved-filters',
    },
    // Additional steps...
  ],
};
```

### 12. Travel Map Tour
Showcases the travel mapping feature to track visited places.

```typescript
export const travelMapTour = {
  id: 'travel-map',
  steps: [
    {
      id: 'map-overview',
      title: 'Your Travel Map',
      content: 'View and share all the places you\'ve visited.',
      target: '.TravelTracker',
    },
    {
      id: 'add-visited',
      title: 'Add Visited Places',
      content: 'Mark countries and cities you\'ve visited.',
      target: '.add-visited-button',
    },
    {
      id: 'share-map',
      title: 'Share Your Map',
      content: 'Share your travel history with friends or on social media.',
      target: '.share-map-button',
    },
    // Additional steps...
  ],
};
```

### 13. Notification Settings Tour


This implementation would significantly enhance the user experience by providing guided, interactive feature discovery instead of relying on static text instructions.
