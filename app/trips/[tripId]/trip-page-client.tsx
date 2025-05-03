'use client';
import { PAGE_ROUTES, API_ROUTES } from '@/utils/constants/routes';
import { ITINERARY_CATEGORIES, ITEM_STATUSES, TRIP_ROLES, type TripRole, type ItemStatus } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/database';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { TabErrorFallback } from '@/components/error-fallbacks/tab-error-fallback';
import { TripDataErrorFallback } from '@/components/error-fallbacks/trip-data-error-fallback';
import { TripDataProvider, useTripData } from './context/trip-data-provider';
import { useAuth } from '@/lib/hooks/use-auth';
import { useTripSubscriptions } from './hooks/use-trip-subscriptions';
import { ItineraryTabContent, BudgetTabContent, NotesTabContent, ManageTabContent } from './components/tab-contents';
import { MemberProfile } from '@/components/members-tab';
import { formatDate } from '@/lib/utils';
import { Profile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Pencil, ChevronLeft, Camera, Loader2, Users, CalendarDays, Info, PanelLeftClose, PanelRightClose, DollarSign, ImagePlus, AlertCircle, Wifi, WifiOff, Clock, Edit, Eye, UserRound, Activity, RefreshCw, ExternalLink, ImageIcon, RotateCw, MapPin, MousePointer, Coffee, MousePointerClick, CheckCircle, XCircle, PanelLeftOpen, Plane, BedDouble, Landmark, Utensils, Car, Sparkles, HelpCircle, MapIcon, Share, Calendar, FileEdit, UserPlus2, LogOut, Settings, Heart } from 'lucide-react';
import { User, RealtimeChannel } from '@supabase/supabase-js';
import { type DisplayItineraryItem, type ItineraryCategory } from '@/types/itinerary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { QuickAddItemForm } from '@/app/trips/components/QuickAddItemForm';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageSearchSelector } from '@/components/images/image-search-selector';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShareTripButton } from '@/components/trips/ShareTripButton';
import { TripHeader, type TripHeaderProps, type MemberWithProfile } from '@/components/trip-header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { type TravelInfo, type TravelTimesResult, calculateTravelTimes } from '@/lib/mapbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ItineraryItemForm } from '@/components/itinerary/itinerary-item-form';
import { EditTripForm, type EditTripFormValues } from '@/app/trips/components/EditTripForm';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Trip, ItineraryItem, ItinerarySection as DbItinerarySection } from '@/types/database.types';
import { ManualDbExpense, UnifiedExpense, ItinerarySection, TripPrivacySetting } from '@/types/trip';
import { ProcessedVotes } from '@/types/votes';

import { ActivityTabContent } from '@/app/trips/[tripId]/components/tab-contents/activity-tab-content';


// React imports

// Next.js imports
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

// Error fallback components

// Monitoring
import * as Sentry from '@sentry/nextjs';

// Context providers

// Custom hooks

// Tab content components

// UI Components

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;


import type { TripMember } from './context/trip-data-provider';

// --- Import Extracted Components ---
import BudgetSnapshotSidebar from '@/components/trips/budget-snapshot-sidebar';
import TripSidebarContent from '@/components/trips/trip-sidebar-content';
// Types

// Local utility functions to avoid import issues
// Format error messages consistently
function formatError(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return fallback;
}

// Format a date range consistently
function formatDateRange(startDate?: string | Date | null, endDate?: string | Date | null): string {
  if (!startDate && !endDate) return 'Dates not set';

  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;

  if (startStr && !endStr) return `From ${startStr}`;
  if (!startStr && endStr) return `Until ${endStr}`;
  if (startStr && endStr) return `${startStr} - ${endStr}`;

  return 'Invalid date range';
}

// Add getInitials function since it's not exported from lib/utils
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Define IconMap with lowercase keys
const IconMap: Record<string, React.ElementType> = {
  flight: Plane,
  accommodation: BedDouble, // Fixed key
  attraction: Landmark,
  restaurant: Utensils,
  cafe: Coffee,
  transportation: Car, // Fixed key
  activity: Activity,
  custom: Sparkles,
  other: HelpCircle,
};

// ----- INTERFACES -----

// Define AccessRequest type (matching the structure from API response)
interface AccessRequestUser {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AccessRequest {
  id: string;
  user_id: string;
  message: string | null;
  created_at: string;
  user: AccessRequestUser | null;
}

/**
 * Represents a trip member with associated profile information as stored in the database
 * Used for transferring trip member data between SSR and client components
 */
interface LocalTripMemberFromSSR {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  joined_at: string;
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

/**
 * Props for the TripPageClient component
 * Contains all necessary data to render a trip page from SSR
 */
export interface TripPageClientProps {
  tripId: string;
  canEdit: boolean;
}

// --- Utility Functions --- //
// Corrected adaptMembersToWithProfile function
const adaptMembersToWithProfile = (members: TripMember[]): MemberWithProfile[] => {
  if (!Array.isArray(members)) return [];
  return members.map((member) => ({
    id: member.id,
    trip_id: member.trip_id,
    user_id: member.user_id,
    role: member.role as TripRole,
    joined_at: member.joined_at,
    profiles: member.profile
      ? {
          id: member.profile.id,
          name: member.profile.name,
          avatar_url: member.profile.avatar_url,
          username: null,
        }
      : null,
    privacySetting: 'private' as TripPrivacySetting,
  }));
};

// Type converter function to adapt TripMember to LocalTripMemberFromSSR
const adaptMembersToSSR = (members: TripMember[]): LocalTripMemberFromSSR[] => {
  if (!Array.isArray(members)) return [];
  return members.map((member) => ({
    id: member.id,
    trip_id: member.trip_id,
    user_id: member.user_id,
    role: member.role as TripRole,
    joined_at: member.joined_at,
    profiles: member.profile
      ? {
          id: member.profile.id,
          name: member.profile.name,
          avatar_url: member.profile.avatar_url,
          username: null,
        }
      : null,
  }));
};

// Add the missing TRIP_EXPENSES route function to the wrapper
// Since we can't modify the original API_ROUTES directly, we'll create a local helper
const getExpensesRoute = (tripId: string) => `/api/trips/${tripId}/expenses`;

// Define enums for type safety
// Using ITINERARY_CATEGORIES and ITEM_STATUSES directly from imports

// Type assertion helper
const isValidCategory = (category: string | null): category is ItineraryCategory => {
  if (!category) return false;
  const allowedCategories = Object.values(ITINERARY_CATEGORIES);
  return allowedCategories.includes(category as any); // Use 'any' to bypass strict type checking
};

// Helper function to map API items to DisplayItineraryItem
const mapApiItemToDisplay = (item: any): DisplayItineraryItem => {
  // Add necessary type checks and mappings here
  // Explicitly handle the category mapping
  const mappedCategory = isValidCategory(item.category)
    ? item.category
    : ITINERARY_CATEGORIES.FLEXIBLE_OPTIONS; // Use FLEXIBLE_OPTIONS as fallback

  return {
    ...item,
    category: mappedCategory,
    // Map other fields if necessary to match DisplayItineraryItem
    // For example, ensure required fields have default values if nullable in API type
    title: item.title ?? 'Untitled Item',
    estimated_cost: typeof item.estimated_cost === 'number' ? item.estimated_cost : null,
    // ... other potential mappings ...
  } as DisplayItineraryItem; // Assert the final type
};

// Updated Helper function to map API sections to local interface, including item mapping
const mapApiSections = (apiSections: any[] | undefined): ItinerarySection[] => {
  if (!Array.isArray(apiSections)) return [];
  return apiSections.map((section) => ({
    ...section,
    items: (section.itinerary_items || []).map(mapApiItemToDisplay), // Map each item within the section
  }));
};

// Helper function for comparing item arrays (simplified ID check)
const compareItemArrays = (arr1: DisplayItineraryItem[], arr2: DisplayItineraryItem[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const ids1 = new Set(arr1.map(item => item.id));
  const ids2 = new Set(arr2.map(item => item.id));
  if (ids1.size !== ids2.size) return false; // Check size for efficiency
  // Check if all IDs from arr1 exist in arr2
  for (const id of ids1) {
    if (!ids2.has(id)) {
      return false;
    }
  }
  return true;
};

// --- Main Client Component --- //
export function TripPageClient({ tripId, canEdit }: TripPageClientProps) {
  // --- Debugging --- //
  console.log('[TripPageClient] Rendering with props:', { tripId, canEdit });
  // --- End Debugging --- //

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname(); // Defined using hook
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user } = useAuth(); // AppUser type from AuthProvider

  // Get data from context
  const contextData = useTripData();
  const {
    tripData,
    isLoading,
    isItemsLoading,
    isMembersLoading,
    error,
    refetchTrip,
    refetchItinerary,
    refetchMembers,
    optimisticUpdate,
  } = contextData;

  // --- Add Logging --- //
  useEffect(() => {
    console.log('[TripPageClient] Context State Update:', {
      isLoading,
      isItemsLoading,
      isMembersLoading,
      error,
      tripDataExists: !!tripData,
      tripExists: !!tripData?.trip,
      itemsCount: tripData?.items?.length,
      membersCount: tripData?.members?.length,
      receivedItems: tripData?.items,
      receivedSections: tripData?.sections,
    });
  }, [isLoading, isItemsLoading, isMembersLoading, error, tripData]);
  // --- End Logging --- //

  // --- Calculate userRole --- //
  const userRole = useMemo<TripRole | null>(() => {
    if (!user || !tripData?.members) {
      return null;
    }
    const currentUserMember = tripData.members.find((member) => member.user_id === user.id);
    return (currentUserMember?.role as TripRole) || null;
  }, [user, tripData?.members]);
  // --- End Calculate userRole --- //

  // --- Local State Management --- //

  // UI State
  const initialTab = searchParams?.get('tab') || 'itinerary';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditTripSheetOpen, setIsEditTripSheetOpen] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [isSavingPlaylistUrl, setIsSavingPlaylistUrl] = useState(false);

  // Re-add editedPlaylistUrl state, initialized from context
  const [editedPlaylistUrl, setEditedPlaylistUrl] = useState(tripData?.trip?.playlist_url ?? null);

  // Keep local state for items and expenses
  const [allItineraryItems, setAllItineraryItems] = useState<DisplayItineraryItem[]>([]);
  const [manualExpenses, setManualExpenses] = useState<ManualDbExpense[]>(
    tripData?.manual_expenses || []
  ); // Assuming expenses aren't in context yet

  // Add state for access requests
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paidById: '',
  });

  // --- Derived State --- //
  const durationDays = tripData?.trip?.duration_days ?? 0;
  const isTripOver = tripData?.trip?.end_date
    ? new Date(tripData.trip.end_date) < new Date()
    : false;
  const tripName = tripData?.trip?.name || 'Trip';
  const tripDescription = tripData?.trip?.description ?? null;
  const privacySetting =
    (tripData?.trip?.privacy_setting as TripPrivacySetting | null) ?? 'private';
  const coverImageUrl = tripData?.trip?.cover_image_url ?? null;
  const tripTags = tripData?.tags || [];
  const playlistUrl = tripData?.trip?.playlist_url ?? null;
  const tripBudget = tripData?.trip?.budget ?? null;

  const totalPlannedCost = useMemo(() => {
    return allItineraryItems
      .filter((item) => item.estimated_cost && item.estimated_cost > 0)
      .map((item) => ({
        id: item.id,
        title: item.title,
        amount: item.estimated_cost ?? null,
        currency: item.currency ?? null,
        category: item.category || null,
        date: item.date ?? null,
        source: 'planned' as const,
        paidBy: null,
      }));
  }, [allItineraryItems]);

  const totalPlannedExpenses = useMemo(() => {
    return totalPlannedCost.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [totalPlannedCost]);

  const totalSpent = useMemo(() => {
    const expenses = Array.isArray(manualExpenses) ? manualExpenses : [];
    return expenses.reduce(
      (sum, expense) =>
        sum + (typeof expense.amount === 'number' && !isNaN(expense.amount) ? expense.amount : 0),
      0
    );
  }, [manualExpenses]);

  // --- Effects --- //

  /**
   * Track page view in Sentry and handle cleanup on unmount
   */
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Viewed trip: ${tripId}`,
      level: 'info',
      data: {
        tripId: tripId,
        tripName: tripName,
      },
    });

    // Cleanup on unmount
    return () => {
      // Cancel any pending transactions
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Left trip: ${tripId}`,
        level: 'info',
      });
    };
  }, [tripId, tripName]);

  // Set up real-time subscriptions using custom hook
  useTripSubscriptions({
    tripId,
    onTripUpdate: refetchTrip,
    onItineraryUpdate: refetchItinerary,
    onMembersUpdate: refetchMembers,
    enabled: Boolean(supabase),
  });

  /**
   * Synchronize local itinerary items with data from TripContext
   * This effect runs when tripData.items or tripData.sections change.
   * It compares the derived items with the current local state inside the setter
   * to prevent unnecessary updates and infinite loops.
   */
  useEffect(() => {
    // Calculate the items based SOLELY on the incoming tripData
    const incomingItems = tripData?.items || [];
    const incomingSections = tripData?.sections || [];
    const mappedSections = mapApiSections(incomingSections); // Use helper
    const sectionItems = mappedSections.flatMap((s) => s.items || []);
    const unscheduledItems = incomingItems.map(mapApiItemToDisplay); // Map unscheduled items
    const newCombinedItems = [...sectionItems, ...unscheduledItems];

    // Use functional update to compare with current state inside the setter
    setAllItineraryItems(currentLocalItems => {
      // Compare the newly calculated items with the current state items
      if (!compareItemArrays(newCombinedItems, currentLocalItems)) {
        console.log(
          '[TripPageClient] Syncing itinerary items from context because item sets differ.'
        );
        // If different, update the state
        return newCombinedItems;
      }
      // If they are the same, return the existing state to prevent update loop
      return currentLocalItems;
    });

  }, [tripData?.items, tripData?.sections]); // Now only depends on incoming data

  /**
   * Update URL when activeTab changes to maintain tab state in the URL
   * This enables proper back button behavior and shareable URLs
   */
  useEffect(() => {
    const currentTabInUrl = searchParams?.get('tab');
    // Ensure activeTab is a valid string before setting params
    const validActiveTab = typeof activeTab === 'string' ? activeTab : 'itinerary';
    if (validActiveTab !== currentTabInUrl) {
      const params = new URLSearchParams(searchParams ?? undefined);
      params.set('tab', validActiveTab);
      // Use pathname from hook
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, searchParams, router, pathname]); // Add pathname

  // Update editedPlaylistUrl if the source changes (e.g., after save/refetch)
  useEffect(() => {
    setEditedPlaylistUrl(playlistUrl);
  }, [playlistUrl]);

  // Fetch access requests if user is admin
  useEffect(() => {
    if (userRole === 'admin') {
      const fetchAccessRequests = async () => {
        try {
          const response = await fetch(API_ROUTES.PERMISSION_REQUESTS(tripId));
          if (response.ok) {
            const { data } = await response.json();
            setAccessRequests(data || []);
          } else if (response.status === 401) {
            // Silently handle unauthorized errors
            console.log('User lacks permission to fetch access requests');
            setAccessRequests([]);
          } else {
            console.error('Failed to fetch access requests:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching access requests:', error);
          // Don't show toast for errors in this background fetch
          setAccessRequests([]);
        }
      };
      fetchAccessRequests();
    } else {
      // If user is not admin, ensure access requests are empty
      setAccessRequests([]);
    }
  }, [tripId, userRole]);

  // --- API Callbacks --- //

  // Add callback for managing access requests
  const handleManageAccessRequest = useCallback(
    async (requestId: string, approve: boolean) => {
      try {
        const response = await fetch(`${API_ROUTES.PERMISSION_REQUESTS(tripId)}/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: approve ? 'approved' : 'rejected' }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update access request');
        }

        // Remove the processed request from the local state
        setAccessRequests((prev) => prev.filter((req) => req.id !== requestId));
        toast({ title: `Request ${approve ? 'approved' : 'rejected'}` });

        // Optionally refetch members if approved, to ensure the new member appears
        if (approve) {
          refetchMembers();
        }
      } catch (error) {
        console.error('Failed to manage access request:', error);
        toast({
          title: 'Error',
          description: formatError(error, 'Could not update access request'),
          variant: 'destructive',
        });
      }
    },
    [tripId, toast, refetchMembers]
  );

  const handleSaveTripDetails = useCallback(
    async (data: EditTripFormValues & { destination_id?: string | null }) => {
      setIsEditTripSheetOpen(false);

      // Optimistic update (use context tripData)
      try {
        await optimisticUpdate('trip', (currentTrip) => {
          if (!currentTrip) return null;
          return {
            ...currentTrip,
            name: data.name,
            description: data.description ?? null,
            privacy_setting: data.privacy_setting,
            ...(data.destination_id !== undefined ? { destination_id: data.destination_id } : {}),
          };
        });
      } catch (error) {
        console.error('Failed optimistic update for trip:', error);
      }

      try {
        const { tags: tagNames, ...tripUpdatePayload } = data;

        // Update Trip Details
        const tripResponse = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripUpdatePayload),
        });
        if (!tripResponse.ok)
          throw new Error((await tripResponse.text()) || 'Failed to update trip');

        // Update Tags (handle potential name-to-ID mapping if needed)
        const tagsResponse = await fetch(API_ROUTES.TRIP_TAGS(tripId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: tagNames || [] }), // Send tag names
        });
        if (!tagsResponse.ok) console.warn('Failed to update trip tags.');

        await refetchTrip(); // Refetch to get definitive data
        toast({ title: 'Trip Updated', description: `Successfully updated ${data.name}.` });
      } catch (error) {
        console.error('Error updating trip:', error);
        // Revert happens automatically via refetchTrip or SWR rollback
        toast({
          title: 'Error Updating Trip',
          description: formatError(error),
          variant: 'destructive',
        });
      }
    },
    [tripId, toast, refetchTrip, optimisticUpdate]
  );

  const handleSaveBudget = useCallback(
    async (newBudget: number) => {
      setIsEditingBudget(false);

      // Optimistic update (use context tripData)
      try {
        await optimisticUpdate('trip', (currentTrip) => {
          if (!currentTrip) return null;
          return {
            ...currentTrip,
            budget: newBudget,
          };
        });
      } catch (error) {
        console.error('Failed optimistic update for budget:', error);
      }

      try {
        const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget: newBudget }),
        });
        if (!response.ok) throw new Error((await response.text()) || 'Failed to update budget');

        await refetchTrip(); // Refetch for consistency
        toast({ title: 'Budget Updated', description: `Trip budget set.` });
      } catch (error) {
        // Revert via refetch
        toast({
          title: 'Failed to update budget',
          description: formatError(error),
          variant: 'destructive',
        });
        throw error;
      }
    },
    [tripId, toast, refetchTrip, optimisticUpdate]
  );

  const handleAddExpense = useCallback(async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.paidById) {
      toast({
        title: 'Missing information',
        description: 'Please fill all fields including Paid By',
        variant: 'destructive',
      });
      return;
    }
    const amountValue = Number.parseFloat(newExpense.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount.',
        variant: 'destructive',
      });
      return;
    }

    const expensePayload = { ...newExpense, amount: amountValue, currency: 'USD', trip_id: tripId };
    setIsAddExpenseOpen(false); // Close dialog optimistically

    try {
      const response = await fetch(getExpensesRoute(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expensePayload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add expense');

      // TODO: Ideally, refetch expenses instead of manual update
      const newManualExpenseEntry: ManualDbExpense = { ...result.expense, source: 'manual' };
      setManualExpenses((prev) => [newManualExpenseEntry, ...(prev || [])]);
      toast({ title: 'Expense Added' });
      setNewExpense({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paidById: '',
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
      Sentry.captureException(error, {
        tags: { action: 'addExpense', tripId },
      });
      toast({
        title: 'Error',
        description: formatError(error as Error, 'Failed to add expense'),
        variant: 'destructive',
      });
    }
  }, [tripId, toast, newExpense]);
  /**
   * Handles the selection of a new cover image for the trip
   * Updates local state immediately for quick UI feedback
   * Then persists the change to the database
   */
  const handleCoverImageSelect = useCallback(
    async (selectedUrl: string) => {
      setIsSavingCover(true);
      setIsImageSelectorOpen(false);

      // Optimistic update (use context tripData)
      try {
        await optimisticUpdate('trip', (currentTrip) => {
          if (!currentTrip) return null;
          return {
            ...currentTrip,
            cover_image_url: selectedUrl,
          };
        });
      } catch (error) {
        console.error('Failed optimistic update for cover image:', error);
      }

      try {
        const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cover_image_url: selectedUrl }),
        });
        if (!response.ok) throw new Error((await response.text()) || 'Failed to update cover');
        await refetchTrip(); // Refetch
        toast({ title: 'Cover image updated!' });
      } catch (error: any) {
        // Revert via refetch
        toast({
          title: 'Failed to update cover image',
          description: formatError(error),
          variant: 'destructive',
        });
      } finally {
        setIsSavingCover(false);
      }
    },
    [tripId, toast, refetchTrip, optimisticUpdate]
  );

  const handleSavePlaylistUrl = useCallback(async () => {
    if (editedPlaylistUrl && editedPlaylistUrl.trim() === '') {
      toast({
        title: 'Invalid URL',
        description: 'Playlist URL cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    setIsSavingPlaylistUrl(true);

    // Optimistic update (use context tripData) - maybe not needed for simple URL
    // Directly fetch
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_url: editedPlaylistUrl || null }),
      });
      if (!response.ok) throw new Error((await response.text()) || 'Failed to update playlist URL');
      await refetchTrip(); // Refetch
      toast({ title: 'Playlist URL updated' });
    } catch (error) {
      // Revert via refetch
      setEditedPlaylistUrl(playlistUrl); // Reset input field if needed
      toast({
        title: 'Error',
        description: formatError(error as Error),
        variant: 'destructive',
      });
    } finally {
      setIsSavingPlaylistUrl(false);
    }
  }, [tripId, toast, refetchTrip, editedPlaylistUrl, playlistUrl]);

  const handleSectionReorder = useCallback(
    async (orderedDayNumbers: (number | null)[]) => {
      console.log('[handleSectionReorder Client] Triggered with:', orderedDayNumbers);
      // Note: Optimistic update of section order already happened in ItineraryTab
      // We just need to call the API here.

      try {
        const response = await fetch(`/api/trips/${tripId}/sections/reorder`, {
          // Use the new endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedDayNumbers }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Failed to reorder sections. API response not readable.' }));
          console.error(
            `[handleSectionReorder Client] API Error (${response.status}):`,
            errorData.error
          );
          throw new Error(errorData.error || 'Failed to save section order');
        }

        console.log('[handleSectionReorder Client] API Success');
        // Optionally refetch trip data if section order affects other parts, but maybe not needed
        // await refetchTrip();
        toast({ title: 'Day order saved.' }); // Confirmation toast
      } catch (error) {
        console.error('[handleSectionReorder Client] Error calling reorder API:', error);
        toast({
          title: 'Error Saving Day Order',
          description: formatError(error as Error, 'Could not save the new day order.'),
          variant: 'destructive',
        });
        // TODO: Implement revert logic if needed. This might involve:
        // 1. Storing original section order on drag start in ItineraryTab
        // 2. Passing a revert callback down to ItineraryTab or triggering refetch
        console.warn(
          '[handleSectionReorder Client] Reorder failed. UI state might be inconsistent until next fetch.'
        );
        // For now, a full refetch might be the simplest revert, although less smooth
        // await refetchTrip(); // Or maybe just refetch itinerary/sections?
      }
    },
    [tripId, toast] // Remove refetchTrip as it's not used in the function body
  );

  // --- Itinerary Item Callbacks --- //
  /**
   * Handles the API call to persist reordering after optimistic update in ItineraryTab
   */
  const handleReorder = useCallback(
    // Update signature to match data from ItineraryTab.handleDragEnd
    async (info: {
      itemId: string;
      newDayNumber: number | null; // Can be null for unscheduled
      newPosition: number;
    }) => {
      console.log(
        `[handleReorder Client] Triggered for item ${info.itemId} to day ${info.newDayNumber} pos ${info.newPosition}`
      );
      try {
        // Optimistic update is now handled in ItineraryTab's handleDragEnd
        // Just call the API endpoint here

        // Use the correct endpoint and method
        const response = await fetch(`/api/trips/${tripId}/itinerary/reorder`, {
          // Correct endpoint
          method: 'POST', // Correct method
          headers: { 'Content-Type': 'application/json' },
          // Send the payload expected by the API route
          body: JSON.stringify({
            itemId: info.itemId,
            newDayNumber: info.newDayNumber,
            newPosition: info.newPosition,
          }),
        });

        if (!response.ok) {
          // Log specific error from API if possible
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Failed to reorder item. API response not readable.' }));
          console.error(`[handleReorder Client] API Error (${response.status}):`, errorData.error);
          throw new Error(errorData.error || 'Failed to reorder item');
        }

        // API call succeeded, optimistic update is confirmed.
        // Optionally refetch for absolute consistency, but might not be needed
        // if optimistic update was accurate.
        console.log(`[handleReorder Client] API Success for item ${info.itemId}`);
        // await refetchItinerary(); // Consider if this is needed
      } catch (error) {
        console.error('[handleReorder Client] Error calling reorder API:', error);
        toast({
          title: 'Error Saving Order',
          description: formatError(error as Error, 'Could not save the new item order.'),
          variant: 'destructive',
        });

        // IMPORTANT: Trigger a state revert in ItineraryTab
        // Since optimistic update happened there, the revert must also happen there.
        // We might need to pass the originalItems state back up or add a dedicated revert callback.
        // For now, refetching is the simplest way to force UI sync after failure.
        console.warn('[handleReorder Client] Reorder failed. Refetching itinerary to revert UI.');
        await refetchItinerary();
      }
    },
    // Dependencies: tripId, toast, refetchItinerary.
    // ItineraryItems state is managed within ItineraryTab now.
    [tripId, toast, refetchItinerary]
  );

  /**
   * Handles deletion of an itinerary item
   * Updates UI optimistically and then persists deletion to the server
   */
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        // Optimistic update local state
        const updatedItems = allItineraryItems.filter((item) => item.id !== itemId);
        setAllItineraryItems(updatedItems);

        // Use optimistic update for context - ADD CHECK
        await optimisticUpdate('items', (currentItems) => {
          // Ensure currentItems is an array before filtering
          return Array.isArray(currentItems)
            ? currentItems.filter((item) => item.id !== itemId)
            : [];
        });

        // API Call
        const response = await fetch(`/api/trips/${tripId}/itinerary/items/${itemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        toast({ title: 'Item deleted successfully' });
      } catch (error) {
        console.error('Failed to delete item:', error);
        toast({
          title: 'Error',
          description: formatError(error as Error, 'Failed to delete item'),
          variant: 'destructive',
        });

        // Refetch to ensure UI is in sync with server state
        await refetchItinerary();
      }
    },
    [allItineraryItems, tripId, toast, optimisticUpdate, refetchItinerary, setAllItineraryItems]
  );

  const handleVote = useCallback(
    async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => {
      try {
        // Optimistic update with safer typing
        const updatedItems = allItineraryItems.map((item) => {
          if (item.id === itemId) {
            // Ensure we're working with numbers
            const currentVotes = typeof item.votes === 'number' ? item.votes : 0;
            const newVotes = voteType === 'up' ? currentVotes + 1 : Math.max(0, currentVotes - 1);

            // Create a new object with the same properties
            // Create a new object using spread syntax for immutability
            // and update the votes property, casting newVotes to ProcessedVotes
            // to satisfy the type checker for the optimistic update.
            // The actual type might be reconciled after the server response.
            return {
              ...item,
              votes: newVotes as unknown as ProcessedVotes,
            };
          }
          return item;
        });

        setAllItineraryItems(updatedItems as DisplayItineraryItem[]); // Cast the entire array

        // Call API to register the vote
        const response = await fetch(`/api/trips/${tripId}/itinerary/items/${itemId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voteType }),
        });

        if (!response.ok) {
          throw new Error('Failed to register vote');
        }

        const result = await response.json();

        // Update with server value
        setAllItineraryItems((items) =>
          items.map((item) => (item.id === itemId ? { ...item, votes: result.votes } : item))
        );
      } catch (error) {
        console.error('Failed to vote for item:', error);
        Sentry.captureException(error, {
          tags: { action: 'vote', tripId, itemId },
        });
        toast({
          title: 'Error',
          description: formatError(error as Error, 'Failed to vote for item'),
          variant: 'destructive',
        });

        // Refetch to ensure UI is in sync with server state
        await refetchItinerary();
      }
    },
    [allItineraryItems, tripId, toast, refetchItinerary, setAllItineraryItems]
  );

  const handleItemStatusChange = useCallback(
    async (itemId: string, status: ItemStatus | null) => {
      try {
        // Optimistic update local state
        const updatedItems = allItineraryItems.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              status: status as ItemStatus, // Cast here since we've validated it's a valid status
            };
          }
          return item;
        });

        setAllItineraryItems(updatedItems);

        // Use optimistic update for context - ADD CHECK
        await optimisticUpdate('items', (currentItems) => {
          // Ensure currentItems is an array before mapping
          if (!Array.isArray(currentItems)) return [];
          return currentItems.map((item) => {
            if (item.id === itemId) {
              return { ...item, status };
            }
            return item;
          });
        });

        // API Call
        const response = await fetch(`/api/trips/${tripId}/itinerary/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update item status');
        }
      } catch (error) {
        console.error('Failed to update item status:', error);
        toast({
          title: 'Error',
          description: formatError(error as Error, 'Failed to update item status'),
          variant: 'destructive',
        });

        // Refetch to ensure UI is in sync with server state
        await refetchItinerary();
      }
    },
    [allItineraryItems, tripId, toast, optimisticUpdate, refetchItinerary, setAllItineraryItems]
  );

  const handleAddItem = useCallback(
    (dayNumber: number | null) => {
      try {
        // Implement proper sheet opening logic here
        Sentry.addBreadcrumb({
          category: 'itinerary',
          message: `Adding item for day: ${dayNumber}`,
          level: 'info',
        });

        // Open sheet functionality would go here
        console.log('Add Item for day:', dayNumber);
      } catch (error) {
        console.error('Error handling add item:', error);
        Sentry.captureException(error, {
          tags: { action: 'addItem', tripId },
        });
      }
    },
    [tripId]
  );

  const handleEditItem = useCallback(
    (item: DisplayItineraryItem) => {
      try {
        // Implement proper sheet opening logic here
        Sentry.addBreadcrumb({
          category: 'itinerary',
          message: `Editing item: ${item.id}`,
          level: 'info',
          data: { itemId: item.id },
        });

        // Open sheet functionality would go here
        console.log('Edit Item:', item);
      } catch (error) {
        console.error('Error handling edit item:', error);
        Sentry.captureException(error, {
          tags: { action: 'editItem', tripId, itemId: item.id },
        });
      }
    },
    [tripId]
  );

  const handleSaveNewItem = useCallback(
    async (newItemData: Partial<DisplayItineraryItem>) => {
      try {
        const response = await fetch(`/api/trips/${tripId}/itinerary/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItemData),
        });

        if (!response.ok) {
          throw new Error('Failed to save new item');
        }

        const result = await response.json();
        const newItem = result.data;

        // Update local state
        setAllItineraryItems((prev) => [...prev, mapApiItemToDisplay(newItem)]);

        // Refetch to ensure consistency
        await refetchItinerary();

        toast({ title: 'Item added successfully' });

        return mapApiItemToDisplay(newItem);
      } catch (error) {
        console.error('Failed to save new item:', error);
        Sentry.captureException(error, {
          tags: { action: 'saveNewItem', tripId },
        });

        toast({
          title: 'Error',
          description: formatError(error as Error, 'Failed to save new item'),
          variant: 'destructive',
        });

        throw error;
      }
    },
    [tripId, toast, refetchItinerary, setAllItineraryItems]
  );

  const handleSaveEditedItem = useCallback(
    async (updatedItemData: Partial<DisplayItineraryItem>) => {
      if (!updatedItemData.id) {
        toast({
          title: 'Error',
          description: 'Item ID is required for updates',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Update local state optimistically
        setAllItineraryItems((prev) =>
          prev.map((item) =>
            item.id === updatedItemData.id ? { ...item, ...updatedItemData } : item
          )
        );

        // Call API to update the item
        const response = await fetch(`/api/trips/${tripId}/itinerary/items/${updatedItemData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItemData),
        });

        if (!response.ok) {
          throw new Error('Failed to update item');
        }

        // Refetch to ensure consistency
        await refetchItinerary();

        toast({ title: 'Item updated successfully' });
      } catch (error) {
        console.error('Failed to update item:', error);
        Sentry.captureException(error, {
          tags: { action: 'saveEditedItem', tripId, itemId: updatedItemData.id },
        });

        toast({
          title: 'Error',
          description: formatError(error as Error, 'Failed to update item'),
          variant: 'destructive',
        });

        // Refetch to revert to server state
        await refetchItinerary();
      }
    },
    [tripId, toast, refetchItinerary, setAllItineraryItems]
  );

  const handleItemAdded = useCallback(
    (item: DisplayItineraryItem) => {
      setAllItineraryItems((prev) => [...(prev || []), item]);
    },
    [setAllItineraryItems]
  );

  // Error fallback components have been moved to separate files

  // Define tabs structure (memoized) with error boundaries
  const tabs = useMemo<
    {
      value: string;
      label: string;
      content: React.ReactNode;
    }[]
  >(() => {
    const baseTabs = [
      {
        value: 'itinerary',
        label: 'Itinerary',
        content: (
          <ErrorBoundary
            FallbackComponent={(props) => (
              <TabErrorFallback
                {...props}
                tripId={tripId}
                section="itinerary"
                refetchFn={refetchItinerary}
              />
            )}
            onReset={() => refetchItinerary()}
          >
            <ItineraryTabContent
              tripId={tripId}
              allItineraryItems={allItineraryItems}
              setAllItineraryItems={setAllItineraryItems}
              userRole={userRole}
              durationDays={durationDays}
              startDate={tripData?.trip?.start_date || null}
              handleDeleteItem={handleDeleteItem}
              handleVote={handleVote}
              handleItemStatusChange={(id: string, status: ItemStatus | null) => 
                handleItemStatusChange(id, status as ItemStatus | null)
              }
              handleReorder={handleReorder}
              handleSectionReorder={handleSectionReorder}
            />
          </ErrorBoundary>
        ),
      },
      {
        value: 'budget',
        label: 'Budget',
        content: (
          <ErrorBoundary
            FallbackComponent={(props) => (
              <TabErrorFallback
                {...props}
                tripId={tripId}
                section="budget"
                refetchFn={refetchTrip}
              />
            )}
            onReset={() => refetchTrip()}
          >
            <BudgetTabContent
              tripId={tripId}
              canEdit={canEdit}
              isTripOver={isTripOver}
              manualExpenses={manualExpenses}
              plannedExpenses={totalPlannedCost}
              members={tripData?.members ? adaptMembersToSSR(tripData.members) : []}
              isLoading={isLoading}
            />
          </ErrorBoundary>
        ),
      },
      {
        value: 'activity',
        label: 'Activity',
        content: (
          <ErrorBoundary
            FallbackComponent={(props) => (
              <TabErrorFallback
                {...props}
                tripId={tripId}
                section="activity"
                refetchFn={refetchTrip} // Or a dedicated activity refetch
              />
            )}
            onReset={() => refetchTrip()} // Or a dedicated activity refetch
          >
            <ActivityTabContent tripId={tripId} />
          </ErrorBoundary>
        ),
      },
      /* Commenting out Notes Tab for now due to 403 error
      {
        value: 'notes',
        label: 'Notes',
        content: (
          <ErrorBoundary
            FallbackComponent={(props) => (
              <TabErrorFallback {...props} tripId={tripId} section="notes" />
            )}
            onReset={() => {
              // Force reload collaborative document data
              window.location.reload();
            }}
          >
            <NotesTabContent tripId={tripId} canEdit={canEdit} />
          </ErrorBoundary>
        ),
      },
      */
    ];

    // Remove manage tab entirely

    return baseTabs;
  }, [
    canEdit,
    tripId,
    tripData,
    allItineraryItems,
    setAllItineraryItems,
    userRole,
    durationDays,
    manualExpenses,
    totalPlannedCost,
    isTripOver,
    isLoading,
    handleReorder,
    handleDeleteItem,
    handleVote,
    handleItemStatusChange,
    handleSectionReorder,
    refetchItinerary,
    refetchTrip,
  ]);

  // --- Rendering --- //

  // Combine loading states correctly
  const combinedIsLoading = isLoading || isItemsLoading || isMembersLoading;

  // Show skeleton if loading AND there's no existing trip data to display
  if (combinedIsLoading && !tripData?.trip) {
    return <Skeleton className="h-screen w-full" />;
  }
  // Show specific error message if context provides an error
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Loading Trip</AlertTitle>
          <AlertDescription>
            {formatError(error)} {/* Display specific error from context */}{' '}
            <Button onClick={() => router.refresh()} variant="link">
              Reload Page
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show generic error only if not loading, no error, but trip data is still missing
  if (!combinedIsLoading && !error && !tripData?.trip) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle>
          {/* Keep generic message here as a fallback */}
          <AlertDescription>Could not load trip data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Add a final check to ensure tripData.trip is definitely available before rendering main content
  // This prevents errors if loading finished but data somehow didn't arrive
  if (!tripData?.trip) {
    console.error(
      '[TripPageClient] Reached render stage but tripData.trip is still null/undefined.',
      { isLoading, isItemsLoading, isMembersLoading, error }
    );
    return (
      <div className="container mx-auto p-8 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /> <AlertTitle>Unexpected State</AlertTitle>
          <AlertDescription>
            Failed to render trip information. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Main JSX --- //
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background container mx-auto px-4">
        <TripHeader
          tripId={tripId}
          tripName={tripName}
          startDate={tripData.trip.start_date}
          endDate={tripData.trip.end_date}
          coverImageUrl={coverImageUrl}
          canEdit={canEdit}
          onEdit={() => setIsEditTripSheetOpen(true)}
          onChangeCover={() => setIsImageSelectorOpen(true)}
          onMembers={() => setActiveTab('manage')}
          isSaving={isSavingCover}
          privacySetting={privacySetting}
          slug={tripData.trip.public_slug}
          members={tripData.members ? adaptMembersToWithProfile(tripData.members) : []}
          tags={tripTags}
          extraContent={
            <div className="flex items-center gap-2">
              {/* Any additional components can go here, but not another Share button */}
            </div>
          }
        />

        {/* Main Content Area - Remove container styles from here */}
        <div className="flex-grow py-6">
          {/* Change from grid to 2-column flex layout below header */}
          <div className="flex flex-col md:flex-row gap-6 relative">
            {/* Sidebar - Make it sticky */}
            <div className="w-full md:w-[300px] flex-shrink-0 space-y-6 md:sticky md:top-24 self-start">
              <BudgetSnapshotSidebar
                targetBudget={tripBudget}
                totalPlanned={totalPlannedExpenses}
                totalSpent={totalSpent}
                canEdit={canEdit}
                isEditing={isEditingBudget}
                onEditToggle={setIsEditingBudget}
                onSave={handleSaveBudget}
                onLogExpenseClick={() => setIsAddExpenseOpen(true)}
              />
              <TripSidebarContent
                description={tripDescription}
                privacySetting={privacySetting}
                startDate={tripData.trip.start_date}
                endDate={tripData.trip.end_date}
                tags={tripTags}
                canEdit={canEdit}
                userRole={userRole}
                accessRequests={accessRequests}
                onEdit={() => setIsEditTripSheetOpen(true)}
                onManageAccessRequest={handleManageAccessRequest}
              />
              {/* Commenting out Playlist Card for now to address CSP errors */}
              {/*
              <Card className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 6v2" />
                        <path d="M12 16v2" />
                        <path d="M6 12h2" />
                        <path d="M16 12h2" />
                      </svg>
                      Trip Playlist
                    </CardTitle>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Set the input field value when starting edit
                          setEditedPlaylistUrl(playlistUrl);
                          // Potentially open a dialog here instead of inline edit
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        {playlistUrl ? 'Change' : 'Add'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {playlistUrl ? (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden pt-[56.25%] rounded-md">
                        <iframe
                          src={playlistUrl}
                          className="absolute top-0 left-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        <span>
                          <a
                            href={playlistUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline hover:text-primary/80"
                          >
                            Open in Spotify <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                      {canEdit ? (
                        <div className="space-y-2">
                          <p>Add a Spotify playlist to set the mood for your trip!</p>
                          <div className="flex flex-col space-y-2">
                            <Input
                              placeholder="Paste Spotify embed URL"
                              value={editedPlaylistUrl || ''} // Use state for input value
                              onChange={(e) => setEditedPlaylistUrl(e.target.value)} // Update state on change
                            />
                            <Button
                              disabled={!editedPlaylistUrl || editedPlaylistUrl.trim() === ''}
                              onClick={handleSavePlaylistUrl}
                              className="w-full"
                            >
                              {isSavingPlaylistUrl ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Playlist'
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p>No playlist has been added to this trip yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              */}
            </div>

            {/* Main Content Area - Flex-grow to take remaining space */}
            <div className="flex-grow">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="min-h-[400px]">
                    {tab.content}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>

        {/* --- Dialogs and Sheets --- */}
        <Dialog open={isEditTripSheetOpen} onOpenChange={setIsEditTripSheetOpen}>
          <DialogContent className="sm:max-w-md overflow-y-auto max-h-[95vh]">
            <DialogHeader>
              <DialogTitle>Edit Trip Details</DialogTitle>
              <DialogDescription>Make changes to your trip details.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <EditTripForm
                trip={{
                  id: tripData.trip.id,
                  name: tripName,
                  privacy_setting: privacySetting,
                  start_date: tripData.trip.start_date || null,
                  end_date: tripData.trip.end_date || null,
                  tags: tripTags.map((tag) => tag.name) || [],
                  destination_id: tripData.trip.destination_id || null,
                  cover_image_url: coverImageUrl,
                }}
                initialDestinationName={tripData.trip.destination_name || null}
                onSave={handleSaveTripDetails}
                onClose={() => setIsEditTripSheetOpen(false)}
                onChangeCover={() => {
                  setIsEditTripSheetOpen(false); // Close edit dialog
                  setIsImageSelectorOpen(true); // Open image sheet
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Add a new expense to this trip.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {/* TODO: Implement Expense Form */}
              <p>Expense form not yet implemented</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                Cancel
              </Button>
              <Button type="button">Add Expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Image Selector to a Dialog instead of Sheet */}
        <Dialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
          <DialogContent className="sm:max-w-xl w-[90vw] md:w-full overflow-y-auto max-h-[95vh]">
            <DialogHeader>
              <DialogTitle>Select Cover Image</DialogTitle>
              <DialogDescription>
                Choose an image from Unsplash, Pexels, or upload your own.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ImageSearchSelector
                isOpen={isImageSelectorOpen} // Pass state to manage internal reset
                onClose={() => setIsImageSelectorOpen(false)}
                onImageSelect={(url, position) => {
                  handleCoverImageSelect(url);
                  // Note: Position adjustment might need separate handling if required
                }}
                initialSearchTerm={tripName} // Use trip name as initial search
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}