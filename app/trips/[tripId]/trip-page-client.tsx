'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom"; // Import from react-dom instead of react
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MembersTab, MemberProfile } from "@/components/members-tab";
import { BudgetTab } from "@/components/budget-tab";
import { PresenceProvider, usePresenceContext } from "@/components/presence/presence-context";
import { PresenceErrorBoundary } from "@/components/presence/presence-error-boundary";
import { TripDataProvider, useTripData } from "./context/trip-data-provider";
import { DB_TABLES } from "@/utils/constants/database"; // Keep this if needed elsewhere
import { useAuth } from "@/components/auth-provider";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Pencil, ChevronLeft, Camera, Loader2, Users, CalendarDays, Info, 
  PanelLeftClose, PanelRightClose, DollarSign, ImagePlus, 
  AlertCircle, Wifi, WifiOff, Clock, Edit, Eye, UserRound, Activity,
  RefreshCw, ExternalLink, ImageIcon, RotateCw, MapPin, MousePointer, 
  Coffee, MousePointerClick, CheckCircle, XCircle
} from "lucide-react";
import { User } from '@supabase/supabase-js';
import { formatError, formatDateRange, getInitials } from "@/lib/utils"; // Moved getInitials here
import { type DisplayItineraryItem, type FetchedItineraryData } from '@/types/itinerary';
import ItineraryTab from "@/components/itinerary/itinerary-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from '@supabase/supabase-js';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { QuickAddItemForm } from '@/app/trips/components/QuickAddItemForm';
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ImageSearchSelector } from '@/components/images/image-search-selector';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShareTripButton } from "@/components/trips/ShareTripButton";
import { TripHeader, type TripHeaderProps, type MemberWithProfile } from "@/components/trip-header"; // Added MemberWithProfile import
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { type TravelInfo, type TravelTimesResult, calculateTravelTimes } from "@/lib/mapbox";
import {
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter, 
  SheetClose
} from "@/components/ui/sheet";
import { ItineraryItemForm } from "@/components/itinerary/itinerary-item-form";
import { EditTripForm, type EditTripFormValues } from "@/app/trips/components/EditTripForm"; // Corrected import path
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClientFocusMode } from '@/components/trips/client-focus-mode';
import { FocusSessionProvider } from '@/contexts/focus-session-context';

import { DB_FIELDS, PAGE_ROUTES, TRIP_ROLES, ITINERARY_CATEGORIES, ITEM_STATUSES, TripRole, ItemStatus, API_ROUTES } from "@/utils/constants";
import { Trip, ItineraryItem } from '@/types/database.types';
import type { TripMember } from './context/trip-data-provider';
type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

// --- Import Extracted Components ---
import TripPresenceIndicator from '@/components/trips/trip-presence-indicator';
import BudgetSnapshotSidebar from '@/components/trips/budget-snapshot-sidebar';
import TripSidebarContent from '@/components/trips/trip-sidebar-content';
import type { ExtendedUserPresence } from '@/types/presence'; // Import necessary type

// Define ManualDbExpense type locally (matching definition in page.tsx)
interface ManualDbExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string; // User ID
  date: string; // ISO string
  created_at: string;
  updated_at?: string | null;
  source?: string | null;
}

// Define the ItinerarySection type
interface ItinerarySection {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  items: DisplayItineraryItem[];
}

// Add source to UnifiedExpense for differentiation
interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null;
  source: 'manual' | 'planned';
}

// Define component state interfaces - these might be simplified later
interface TripPageState {
  // ... (keep interface definition) ...
}
interface LoadingState {
  // ... (keep interface definition) ...
}
interface ErrorState {
  // ... (keep interface definition) ...
}

// Type for members passed from SSR
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

// Props for the main client component
interface TripPageClientProps {
  tripId: string;
  tripName: string;
  tripDescription: string | null;
  startDate: string | null;
  endDate: string | null;
  tripDurationDays: number | null;
  coverImageUrl: string | null;
  destinationId: string | null;
  initialMembers: LocalTripMemberFromSSR[];
  initialSections: ItinerarySection[];
  initialUnscheduledItems: DisplayItineraryItem[];
  initialManualExpenses: ManualDbExpense[];
  userRole: TripRole | null;
  canEdit: boolean;
  isTripOver: boolean;
  destinationLat?: number | null;
  destinationLng?: number | null;
  initialTripBudget: number | null;
  initialTags: { id: string; name: string }[];
  slug: string | null;
  privacySetting: TripPrivacySetting | null;
  playlistUrl?: string | null;
}

// Dynamically import CollaborativeNotes
const CollaborativeNotes = dynamic(
  () => import('@/components/collaborative-notes').then(mod => mod.CollaborativeNotes),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

// --- Utility Functions --- //
// Corrected adaptMembersToWithProfile function
const adaptMembersToWithProfile = (members: TripMember[]): MemberWithProfile[] => {
  if (!Array.isArray(members)) return [];
  return members.map(member => ({
    id: member.id,
    trip_id: member.trip_id,
    user_id: member.user_id,
    role: member.role as TripRole,
    joined_at: member.joined_at,
    profiles: member.profile ? {
      id: member.profile.id,
      name: member.profile.name,
      avatar_url: member.profile.avatar_url,
      username: null
    } : null,
    privacySetting: 'private' as TripPrivacySetting
  }));
};

// Type converter function to adapt TripMember to LocalTripMemberFromSSR
const adaptMembersToSSR = (members: TripMember[]): LocalTripMemberFromSSR[] => {
    if (!Array.isArray(members)) return [];
    return members.map(member => ({
        id: member.id,
        trip_id: member.trip_id,
        user_id: member.user_id,
        role: member.role as TripRole,
        joined_at: member.joined_at,
        profiles: member.profile ? {
            id: member.profile.id,
            name: member.profile.name,
            avatar_url: member.profile.avatar_url,
            username: null
        } : null
    }));
};

// Add the missing TRIP_EXPENSES route function to the wrapper
// Since we can't modify the original API_ROUTES directly, we'll create a local helper
const getExpensesRoute = (tripId: string) => `/api/trips/${tripId}/expenses`;

// --- Main Client Component --- //
export function TripPageClient({
  tripId,
  tripName,
  tripDescription: initialTripDescription,
  startDate,
  endDate,
  tripDurationDays,
  coverImageUrl: initialCoverImageUrl,
  destinationId,
  initialMembers,
  initialSections,
  initialUnscheduledItems,
  initialManualExpenses,
  userRole,
  canEdit,
  isTripOver,
  destinationLat,
  destinationLng,
  initialTripBudget,
  initialTags,
  slug,
  privacySetting: initialPrivacySetting,
  playlistUrl: initialPlaylistUrl,
}: TripPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname(); // Defined using hook
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user } = useAuth(); // AppUser type from AuthProvider

  // Get data from context
  const { tripData, isLoading, error, refetchTrip, refetchItinerary, refetchMembers } = useTripData();

  // --- Local State Management --- //

  // UI State
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || "itinerary"); // Initialize from URL or default
  const [isEditTripSheetOpen, setIsEditTripSheetOpen] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [isSavingPlaylistUrl, setIsSavingPlaylistUrl] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);

  // Trip Details State (derived or initialized from props/context)
  const [editedTripName, setEditedTripName] = useState(tripData?.trip?.name || tripName);
  const [editedTripDescription, setEditedTripDescription] = useState(tripData?.trip?.description ?? initialTripDescription);
  const [currentPrivacySetting, setCurrentPrivacySetting] = useState<TripPrivacySetting | null>(tripData?.trip?.privacy_setting as TripPrivacySetting | null ?? initialPrivacySetting);
  const [displayedCoverUrl, setDisplayedCoverUrl] = useState(tripData?.trip?.cover_image_url ?? initialCoverImageUrl);
  const [editedTags, setEditedTags] = useState<{ id: string; name: string }[]>(tripData?.tags || initialTags || []);
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState<string | null>(tripData?.trip?.playlist_url ?? initialPlaylistUrl ?? null);
  const [editedPlaylistUrl, setEditedPlaylistUrl] = useState(currentPlaylistUrl);
  const [tripBudget, setTripBudget] = useState<number | null>(tripData?.trip?.budget ?? initialTripBudget ?? null);

  // Itinerary & Expense State (derived or initialized from props/context)
  const [allItineraryItems, setAllItineraryItems] = useState<DisplayItineraryItem[]>(() => [
      ...(tripData?.sections?.flatMap(s => s.items || []) || initialSections?.flatMap(s => s.items || []) || []),
      ...(tripData?.items || initialUnscheduledItems || [])
  ]);
  const [manualExpenses, setManualExpenses] = useState<ManualDbExpense[]>(initialManualExpenses || []); // Assuming expenses aren't in context yet

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], paidById: '' });

  // --- Derived State --- //
  const durationDays = tripDurationDays ?? tripData?.trip?.duration_days ?? 0;

  const totalPlannedCost = useMemo(() => {
    return allItineraryItems
      .filter(item => item.estimated_cost && item.estimated_cost > 0)
      .map(item => ({
        id: item.id,
        title: item.title,
        amount: item.estimated_cost ?? null,
        currency: item.currency ?? null,
        category: item.category || null,
        date: item.date ?? null,
        source: 'planned' as const,
        paidBy: null
      }));
  }, [allItineraryItems]);

  const totalPlannedExpenses = useMemo(() => {
     return totalPlannedCost.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [totalPlannedCost]);

  const totalSpent = useMemo(() => {
    const expenses = Array.isArray(manualExpenses) ? manualExpenses : [];
    return expenses.reduce((sum, expense) => sum + (typeof expense.amount === 'number' && !isNaN(expense.amount) ? expense.amount : 0), 0);
  }, [manualExpenses]);

  // --- Effects --- //

  // Sync local state with context/props when they change
  useEffect(() => {
    setEditedTripName(tripData?.trip?.name || tripName);
    setEditedTripDescription(tripData?.trip?.description ?? initialTripDescription);
    setCurrentPrivacySetting(tripData?.trip?.privacy_setting as TripPrivacySetting | null ?? initialPrivacySetting);
    setDisplayedCoverUrl(tripData?.trip?.cover_image_url ?? initialCoverImageUrl);
    setEditedTags(tripData?.tags || initialTags || []);
    setCurrentPlaylistUrl(tripData?.trip?.playlist_url ?? initialPlaylistUrl ?? null);
    setTripBudget(tripData?.trip?.budget ?? initialTripBudget ?? null);

    const combinedItems = [
      ...(tripData?.sections?.flatMap(s => s.items || []) || []),
      ...(tripData?.items || [])
    ];
    // Only update if the items actually changed to avoid infinite loops if callbacks depend on it
    if (JSON.stringify(combinedItems) !== JSON.stringify(allItineraryItems)) {
        setAllItineraryItems(combinedItems);
    }
  }, [tripData, tripName, initialTripDescription, initialPrivacySetting, initialCoverImageUrl, initialTags, initialPlaylistUrl, initialTripBudget, allItineraryItems]); // Added allItineraryItems to dep array

  // Update URL when activeTab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, pathname, searchParams, router]);

  // --- API Callbacks --- //

  const handleSaveTripDetails = useCallback(async (data: EditTripFormValues & { destination_id?: string | null }) => {
    setIsEditTripSheetOpen(false); // Close sheet optimistically
    const originalState = {
        name: editedTripName,
        description: editedTripDescription,
        privacy: currentPrivacySetting,
        tags: editedTags,
    };

    // Optimistic UI updates
    setEditedTripName(data.name);
    setEditedTripDescription(data.description ?? null);
    setCurrentPrivacySetting(data.privacy_setting as TripPrivacySetting | null);
    if (data.tags) {
        // Assume tags are just names for now, adjust if API expects IDs
        setEditedTags(data.tags.map((name, index) => ({ id: `temp-${name}-${index}`, name })));
    }

    try {
        const { tags: tagNames, ...tripUpdatePayload } = data;

        // Update Trip Details
        const tripResponse = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripUpdatePayload),
        });
        if (!tripResponse.ok) throw new Error(await tripResponse.text() || 'Failed to update trip');

        // Update Tags (handle potential name-to-ID mapping if needed)
        const tagsResponse = await fetch(API_ROUTES.TRIP_TAGS(tripId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags: tagNames || [] }), // Send tag names
        });
        if (!tagsResponse.ok) console.warn("Failed to update trip tags.");

        await refetchTrip(); // Refetch to get definitive data
        toast({ title: "Trip Updated", description: `Successfully updated ${data.name}.` });

    } catch (error) {
        console.error("Error updating trip:", error);
        // Revert optimistic updates on failure
        setEditedTripName(originalState.name);
        setEditedTripDescription(originalState.description);
        setCurrentPrivacySetting(originalState.privacy);
        setEditedTags(originalState.tags);
        toast({ title: 'Error Updating Trip', description: formatError(error), variant: 'destructive' });
    }
}, [tripId, toast, refetchTrip, editedTripName, editedTripDescription, currentPrivacySetting, editedTags]);

  const handleSaveBudget = useCallback(async (newBudget: number) => {
    setIsEditingBudget(false);
    const originalBudget = tripBudget;
    setTripBudget(newBudget); // Optimistic update

    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: newBudget }),
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to update budget');

      await refetchTrip(); // Refetch for consistency
      toast({ title: "Budget Updated", description: `Trip budget set.` });

    } catch (error) {
      console.error("Error updating budget:", error);
      setTripBudget(originalBudget); // Revert
      toast({ title: "Failed to update budget", description: formatError(error), variant: "destructive" });
      throw error; // Re-throw for sidebar handling
    }
  }, [tripId, toast, refetchTrip, tripBudget]);

  const handleAddExpense = useCallback(async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.paidById) {
        toast({ title: "Missing information", description: "Please fill all fields including Paid By", variant: "destructive" });
        return;
    }
    const amountValue = Number.parseFloat(newExpense.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid positive amount.", variant: "destructive" });
        return;
    }

    const expensePayload = { ...newExpense, amount: amountValue, currency: "USD", trip_id: tripId };
    setIsAddExpenseOpen(false); // Close dialog optimistically

    try {
        const response = await fetch(getExpensesRoute(tripId), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expensePayload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to add expense");

        // TODO: Ideally, refetch expenses instead of manual update
        const newManualExpenseEntry: ManualDbExpense = { ...result.expense, source: 'manual' };
        setManualExpenses(prev => [newManualExpenseEntry, ...(prev || [])]);
        toast({ title: "Expense Added" });
        setNewExpense({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], paidById: "" });

    } catch (error) {
        console.error("Failed to add expense:", error);
        toast({ title: "Error", description: formatError(error as Error, "Failed to add expense"), variant: "destructive" });
    }
}, [tripId, toast, newExpense]);

  const handleCoverImageSelect = useCallback(async (selectedUrl: string) => {
    setIsSavingCover(true);
    setIsImageSelectorOpen(false);
    const originalUrl = displayedCoverUrl;
    setDisplayedCoverUrl(selectedUrl); // Optimistic update

    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image_url: selectedUrl }),
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to update cover');
      await refetchTrip(); // Refetch
      toast({ title: "Cover image updated!" });
    } catch (error) {
      console.error("Error updating cover image:", error);
      setDisplayedCoverUrl(originalUrl); // Revert
      toast({ title: "Failed to update cover image", description: formatError(error), variant: "destructive" });
    } finally {
      setIsSavingCover(false);
    }
  }, [tripId, toast, refetchTrip, displayedCoverUrl]);

  const handleSavePlaylistUrl = useCallback(async () => {
    if (editedPlaylistUrl && editedPlaylistUrl.trim() === '') {
      toast({ title: 'Invalid URL', description: 'Playlist URL cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsSavingPlaylistUrl(true);
    const originalUrl = currentPlaylistUrl;
    setCurrentPlaylistUrl(editedPlaylistUrl);

    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_url: editedPlaylistUrl || null }),
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to update playlist URL');
      await refetchTrip(); // Refetch
      toast({ title: 'Playlist URL updated' });
    } catch (error) {
      setCurrentPlaylistUrl(originalUrl);
      toast({ title: 'Error', description: formatError(error as Error), variant: 'destructive' });
    } finally {
      setIsSavingPlaylistUrl(false);
    }
  }, [tripId, toast, refetchTrip, editedPlaylistUrl, currentPlaylistUrl]);

  // --- Itinerary Item Callbacks --- //
  // (Assuming handleReorder, handleDeleteItem, handleVote, handleStatusChange, handleAddItem, handleEditItem are defined elsewhere or moved to a hook)
  // Example placeholders if needed:
  const handleReorder = useCallback(async (info: any) => { console.log("Reorder:", info); /* API Call */ }, []);
  const handleDeleteItem = useCallback(async (itemId: string) => { console.log("Delete:", itemId); /* API Call + Optimistic Update */ }, []);
  const handleVote = useCallback(async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => { 
    console.log("Vote:", itemId, dayNumber, voteType); 
    /* API Call */ 
  }, []);
  const handleStatusChange = useCallback(async (itemId: string, status: ItemStatus | null) => { console.log("Status Change:", itemId, status); /* API Call */ }, []);
  const handleAddItem = useCallback((dayNumber: number | null) => { console.log("Add Item for day:", dayNumber); /* Open Sheet */ }, []);
  const handleEditItem = useCallback((item: DisplayItineraryItem) => { console.log("Edit Item:", item); /* Open Sheet */ }, []);
  const handleSaveNewItem = useCallback(async (newItemData: Partial<DisplayItineraryItem>) => { console.log("Save New:", newItemData); /* API Call */ return newItemData as DisplayItineraryItem; }, []);
  const handleSaveEditedItem = useCallback(async (updatedItemData: Partial<DisplayItineraryItem>) => { console.log("Save Edit:", updatedItemData); /* API Call */ }, []);
  const handleItemAdded = useCallback((item: DisplayItineraryItem) => { setAllItineraryItems(prev => [...(prev || []), item]); }, []);

  // --- Rendering --- //

  if (isLoading && !tripData) { // Improved loading check
    return <Skeleton className="h-screen w-full" />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Loading Trip</AlertTitle>
          <AlertDescription>{formatError(error)} <Button onClick={() => router.refresh()} variant="link">Reload</Button></AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tripData?.trip) { // Check if trip data itself is missing
     return (
       <div className="container mx-auto p-8 text-center">
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle>
           <AlertDescription>Could not load trip data. Please try again later.</AlertDescription>
         </Alert>
       </div>
     );
   }

  // --- Define Tabs Content --- //
  const ItineraryTabContent = () => {
      const currentUserProfile: Profile | null = user?.profile ? {
          id: user.id,
          email: user.email || '',
          name: user.profile.name || '',
          avatar_url: user.profile.avatar_url || null,
          username: user.profile.username || null,
          created_at: user.created_at || '',
          updated_at: user.updated_at || '',
          bio: user.profile.bio || null,
          location: user.profile.location || null,
          website: user.profile.website || null,
          referred_by: user.profile.referred_by || null,
      } : null;

      return (
          <ItineraryTab
              tripId={tripId}
              itineraryItems={allItineraryItems}
              setItineraryItems={setAllItineraryItems}
              userId={user?.id || ''}
              user={currentUserProfile}
              userRole={userRole}
              startDate={tripData?.trip?.start_date || startDate}
              durationDays={durationDays}
              onReorder={handleReorder}
              onDeleteItem={handleDeleteItem}
              onVote={handleVote}
              onEditItem={handleEditItem as (item: DisplayItineraryItem) => Promise<void>}
              onItemStatusChange={handleStatusChange}
              onAddItem={handleAddItem}
          />
      );
  };

  const BudgetTabContent = () => (
    <BudgetTab 
      tripId={tripId} 
      canEdit={canEdit}
      isTripOver={isTripOver}
      manualExpenses={manualExpenses}
      plannedExpenses={totalPlannedCost} // Use derived state
      initialMembers={tripData?.members ? adaptMembersToSSR(tripData.members) : []} // Adapt members from context
    />
  );

  const NotesTabContent = () => (
    <CollaborativeNotes tripId={tripId} readOnly={!canEdit} />
  );

  const ManageTabContent = () => (
      <MembersTab
          tripId={tripId}
          canEdit={canEdit}
          userRole={userRole}
          initialMembers={tripData?.members ? adaptMembersToSSR(tripData.members) : []} // Adapt members from context
      />
  );

  // Define tabs structure (memoized)
  const tabs = useMemo(() => {
    const baseTabs = [
      { value: "itinerary", label: "Itinerary", content: <ItineraryTabContent /> },
      { value: "budget", label: "Budget", content: <BudgetTabContent /> },
      { value: "notes", label: "Notes", content: <NotesTabContent /> },
    ];
    if (canEdit) {
      baseTabs.push({ value: "manage", label: "Manage", content: <ManageTabContent /> });
    }
    return baseTabs;
  // Update dependencies as needed based on what tab content relies on
  }, [canEdit, allItineraryItems, manualExpenses, tripData?.members, userRole, startDate, durationDays, user?.profile, user?.id]);

  // --- Main JSX --- //
  return (
    <TooltipProvider>
      <FocusSessionProvider tripId={tripId}>
        <div className="min-h-screen flex flex-col bg-background">
          <TripHeader
            tripId={tripId}
            tripName={editedTripName}
            startDate={tripData?.trip?.start_date || startDate}
            endDate={tripData?.trip?.end_date || endDate}
            coverImageUrl={displayedCoverUrl}
            canEdit={canEdit}
            onEdit={() => setIsEditTripSheetOpen(true)}
            onChangeCover={() => setIsImageSelectorOpen(true)}
            isSaving={isSavingCover}
            privacySetting={currentPrivacySetting}
            slug={tripData?.trip?.public_slug || slug}
            members={tripData?.members ? adaptMembersToWithProfile(tripData.members) : []}
            tags={editedTags}
            extraContent={
              <div className="flex items-center gap-2">
                <TripPresenceIndicator />
                {canEdit && (
                  <Button variant="outline" size="icon" onClick={() => setShowFocusMode(!showFocusMode)} className="h-8 w-8">
                    <Coffee className={`h-4 w-4 transition-colors ${showFocusMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                )}
                <ShareTripButton slug={tripData?.trip?.public_slug || slug} privacySetting={currentPrivacySetting} className="h-8" />
              </div>
            }
          />

          {/* Focus Mode UI */}
          {showFocusMode && canEdit && (
            <div className="container mx-auto px-4 py-2 sticky top-[60px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <ClientFocusMode tripId={tripId} />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-grow container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="md:col-span-1 lg:col-span-1 space-y-6">
                {/* Use Extracted BudgetSnapshotSidebar */}
                <BudgetSnapshotSidebar
                  targetBudget={tripBudget}
                  totalPlanned={totalPlannedExpenses}
                  totalSpent={totalSpent}
                  canEdit={canEdit}
                  isEditing={isEditingBudget}
                  onEditToggle={setIsEditingBudget}
                  onSave={handleSaveBudget}
                  onLogExpenseClick={() => setIsAddExpenseOpen(true)} // Example handler
                />
                {/* Use Extracted TripSidebarContent */}
                <TripSidebarContent
                  description={editedTripDescription}
                  privacySetting={currentPrivacySetting}
                  startDate={tripData?.trip?.start_date || startDate}
                  endDate={tripData?.trip?.end_date || endDate}
                  tags={editedTags}
                  canEdit={canEdit}
                  onEdit={() => setIsEditTripSheetOpen(true)}
                />
                {/* Playlist Section */}
                {/* ... */}
              </div>

              {/* Main Content Tabs */}
              <div className="md:col-span-2 lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* ... TabsList and TabsContent using tabs array ... */}
                </Tabs>
              </div>
            </div>
          </div>

          {/* --- Dialogs and Sheets --- */}
          {/* ... Edit Trip Sheet using EditTripForm ... */}
          {/* ... Add Expense Dialog ... */}
          {/* ... Image Selector Dialog ... */}
          {/* ... Add/Edit Itinerary Item Sheets ... */}

        </div>
      </FocusSessionProvider>
    </TooltipProvider>
  );
}

// Wrapper component (keep as is)
function TripPageClientWrapper(props: TripPageClientProps) {
  return (
    <TripDataProvider tripId={props.tripId}>
      <PresenceProvider tripId={props.tripId}>
        <PresenceErrorBoundary>
          <TripPageClient {...props} />
        </PresenceErrorBoundary>
      </PresenceProvider>
    </TripDataProvider>
  );
}

export default TripPageClientWrapper;

