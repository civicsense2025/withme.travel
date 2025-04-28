'use client'

import * as React from 'react'; // Explicit React import for JSX types
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { createPortal } from "react-dom" // Import from react-dom instead of react
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import throttle from 'lodash/throttle'; // Import throttle
import { MembersTab, MemberProfile, TripMemberFromSSR } from "@/components/members-tab"
import { BudgetTab } from "@/components/budget-tab"
import { PresenceProvider, EditingWrapper, usePresenceContext, ActiveUsers } from "@/components/presence/presence-context"
import { PresenceErrorBoundary } from "@/components/presence/presence-error-boundary"
import { ConnectionState } from "@/types/presence"
import { TripDataProvider, useTripData } from "./context/trip-data-provider"; // Correct context path
import { DB_TABLES } from "@/utils/constants/database";
import { useAuth } from "@/components/auth-provider";
import { Profile } from "@/types/profile"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Pencil, ChevronLeft, Camera, Loader2, Users, CalendarDays, Info, 
  PanelLeftClose, PanelRightClose, DollarSign, ImagePlus, 
  AlertCircle, Wifi, WifiOff, Clock, Edit, Eye, UserRound, Activity,
  RefreshCw, ExternalLink, ImageIcon, RotateCw, MapPin, MousePointer,
  Coffee, MousePointerClick
} from "lucide-react"
import { User } from '@supabase/supabase-js'
import { formatError, formatDateRange } from "@/lib/utils"
import { type DisplayItineraryItem, type FetchedItineraryData } from '@/types/itinerary'
import ItineraryTab from "@/components/itinerary/itinerary-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"
import { RealtimeChannel } from '@supabase/supabase-js'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

import { QuickAddItemForm } from '@/app/trips/components/QuickAddItemForm'
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { ImageSearchSelector } from '@/components/images/image-search-selector'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShareTripButton } from "@/components/trips/ShareTripButton"
import { TripHeader, type TripHeaderProps } from "@/components/trip-header"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { type TravelInfo, type TravelTimesResult, calculateTravelTimes } from "@/lib/mapbox"
import {
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter, 
  SheetClose
} from "@/components/ui/sheet"
import { ItineraryItemForm } from "@/components/itinerary/itinerary-item-form"
import { EditTripForm } from "@/app/trips/components/EditTripForm"
import { EditTripFormValues } from "@/app/trips/components/EditTripForm"
import { type ProcessedVotes } from "@/types/votes"
import { usePresence } from '@/hooks/use-presence'; 
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { DB_FIELDS, PAGE_ROUTES, TRIP_ROLES, ITINERARY_CATEGORIES, ITEM_STATUSES, TripRole, ItemStatus, API_ROUTES } from "@/utils/constants";
import type { TripWithMemberInfo } from "@/utils/types"; // Revert type imports

// Define privacy setting type locally
// Define connectivity state type
enum TripConnectionState {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
}

// Define real-time update types
type TripUpdateType = 
  | 'trip_details'
  | 'members'
  | 'itinerary_items'
  | 'itinerary_sections'
  | 'expenses';

interface RealtimeUpdate<T> {
  type: TripUpdateType;
  data: T;
  timestamp: string;
  user_id: string;
}

// Define privacy setting type
type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

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

// Define the ItinerarySection type (assuming DisplayItineraryItem is defined elsewhere or globally)
// This should match the structure returned by the GET API route
interface ItinerarySection {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  items: DisplayItineraryItem[]; // Items belonging to this section
}

// Add source to UnifiedExpense for differentiation
interface UnifiedExpense {
  id: string | number;
  title: string | null; 
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null; 
  paidBy?: string | null; // Optional for planned items
  source: 'manual' | 'planned';
}

// Define component state interfaces
interface TripPageState {
  editedTripName: string;
  editedTripDescription: string | null;
  currentPrivacySetting: TripPrivacySetting | null;
  displayedCoverUrl: string | null;
  members: TripMemberFromSSR[];
  sections: ItinerarySection[];
  unscheduledItems: DisplayItineraryItem[];
  manualExpenses: ManualDbExpense[];
  tripBudget: number | null;
  editedTags: { id: string; name: string }[];
  currentPlaylistUrl: string | null;
  allItineraryItems: DisplayItineraryItem[];
}

// Define loading state interface
interface LoadingState {
  isLoading: boolean;
  isSavingTrip: boolean;
  isSavingCover: boolean;
  isSavingBudget: boolean;
  isSavingPlaylist: boolean;
  isLoadingTravelTimes: boolean;
}

// Define error state interface
interface ErrorState {
  tripError: Error | null;
  memberError: Error | null;
  itineraryError: Error | null;
  expenseError: Error | null;
  realtimeError: Error | null;
}

// Define connection state for real-time updates
interface ConnectionStatus {
  state: TripConnectionState;
  lastConnected: Date | null;
  retryCount: number;
}

// ... (Interface TripPageClientProps)
interface TripPageClientProps {
  tripId: string
  tripName: string
  tripDescription: string | null
  startDate: string | null
  endDate: string | null
  tripDurationDays: number | null
  coverImageUrl: string | null
  destinationId: string | null
  initialMembers: TripMemberFromSSR[]
  initialSections: ItinerarySection[]
  initialUnscheduledItems: DisplayItineraryItem[]
  initialManualExpenses: ManualDbExpense[]
  userRole: TripRole | null
  canEdit: boolean
  isTripOver: boolean
  destinationLat?: number | null
  destinationLng?: number | null
  initialTripBudget: number | null
  initialTags: { id: string; name: string }[]
  slug: string | null
  privacySetting: 'private' | 'shared_with_link' | 'public' | null
  playlistUrl?: string | null
}

// Dynamically import CollaborativeNotes *after* type definitions
const CollaborativeNotes = dynamic(
  () => import('@/components/collaborative-notes').then(mod => mod.CollaborativeNotes),
  {
    ssr: false, // Ensure it only runs on the client
    loading: () => <Skeleton className="h-64 w-full" /> // Show skeleton while loading
  }
);

// Dynamically import named PlaylistEmbed component only on the client
/* // Temporarily comment out dynamic import
const PlaylistEmbedComponent = dynamic(
  () => import('@/components/trips/PlaylistEmbed').then(mod => mod.PlaylistEmbed),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full max-w-xl mx-auto my-4 h-48" />
  }
);
*/

// --- New Budget Snapshot Sidebar Component --- 
interface BudgetSnapshotSidebarProps {
  targetBudget: number | null;
  totalPlanned: number;
  totalSpent: number;
  canEdit: boolean;
  isEditing: boolean;
  onEditToggle: (isEditing: boolean) => void;
  onSave: (newBudget: number) => Promise<void>; // Make async for API call
  onLogExpenseClick: () => void;
}

function BudgetSnapshotSidebar({
  targetBudget,
  totalPlanned,
  totalSpent,
  canEdit,
  isEditing,
  onEditToggle,
  onSave,
  onLogExpenseClick,
}: BudgetSnapshotSidebarProps) {
  const [editedBudget, setEditedBudget] = useState<string>(targetBudget?.toString() ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset edited budget if targetBudget changes externally or edit mode is cancelled
    setEditedBudget(targetBudget?.toString() ?? "");
  }, [targetBudget, isEditing]);

  const handleSaveClick = async () => {
    const newBudgetValue = parseFloat(editedBudget);
    if (isNaN(newBudgetValue) || newBudgetValue < 0) {
      // Basic validation - add toast later if needed
      console.error("Invalid budget value");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(newBudgetValue);
      // onEditToggle(false) will be called by parent on successful save
    } catch (error) {
      // Error handled by parent toast
      console.error("Failed to save budget from sidebar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    onEditToggle(false);
    // Reset state via useEffect
  };

  const remaining = targetBudget !== null ? targetBudget - totalPlanned : null;

  // Helper to format currency
  const formatCurrency = (value: number | null | undefined | string) => {
    // Explicitly handle null and undefined first
    if (value === null || value === undefined) {
      return "N/A";
    }

    let numericValue: number;

    // Try to convert potential strings to numbers
    if (typeof value === 'string') {
      // Prevent empty strings or non-numeric strings from becoming NaN later
      if (value.trim() === '' || isNaN(parseFloat(value))) {
         return "N/A"; 
      }
      numericValue = parseFloat(value);
    } else if (typeof value === 'number') {
       // If it's already a number, use it directly
      numericValue = value;
    } else {
       // If it's not null, undefined, string, or number, it's invalid
       return "N/A"; 
    }

    // Final check: ensure the result is a valid number before formatting
    if (isNaN(numericValue)) {
      return "N/A"; // Or perhaps return '$0.00' or some other default?
    }
    
    // Now we are confident numericValue is a valid number
    return `$${numericValue.toFixed(2)}`;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-md flex items-center">Budget Snapshot</h3>
        {canEdit && !isEditing && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditToggle(true)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Budget</span>
          </Button>
        )}
      </div>

      {/* Budget Details */ 
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Target Budget:</span>
          {isEditing ? (
             <Input 
                type="number"
                value={editedBudget}
                onChange={(e) => setEditedBudget(e.target.value)}
                placeholder="Enter budget"
                className="h-8 max-w-[120px] text-right"
                min="0"
                step="10"
             />
          ) : (
            <span className="font-medium">{formatCurrency(targetBudget)}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Planned:</span>
          <span className="font-medium">{formatCurrency(totalPlanned)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Spent:</span>
          <span className="font-medium">{formatCurrency(totalSpent)}</span>
        </div>
         <hr className="my-2 border-dashed" />
        <div className="flex justify-between font-semibold">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center cursor-help">
                Remaining
                <Info className="h-3 w-3 ml-1 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Remaining = Target Budget - Total Planned</p>
              <p className="text-xs text-muted-foreground">(Total Planned includes estimated itinerary costs)</p>
            </TooltipContent>
          </Tooltip>
          <span>{formatCurrency(remaining)}</span>
        </div>
      </div>
}
        {
        isEditing && (
          <div className="flex justify-end gap-2 pt-3 border-t border-dashed mt-3">
            <Button variant="ghost" size="sm" onClick={handleCancelClick} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Budget
            </Button>
          </div>
        )
      }
    </div>
  );
}

// --- Extracted TripSidebarContent Component --- 
interface TripSidebarContentProps {
  description: string | null;
  privacySetting: TripPrivacySetting | null;
  startDate: string | null;
  endDate: string | null;
  tags: { id: string; name: string }[];
  canEdit: boolean;
  onEdit: () => void;
}

function TripSidebarContent({ 
  description, 
  privacySetting, 
  startDate, 
  endDate, 
  tags, 
  canEdit, 
  onEdit 
}: TripSidebarContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Trip Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Description</Label>
          <p className="text-sm">{description || "No description"}</p>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Privacy</Label>
          <p className="text-sm capitalize">{privacySetting || 'Private'}</p>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Dates</Label>
          <p className="text-sm">{startDate && endDate ? formatDateRange(startDate, endDate) : "Not set"}</p>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags && tags.length > 0 ? (
              tags.map(tag => (
                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>
        </div>
        {canEdit && (
           <Button variant="outline" size="sm" className="mt-2 w-full" onClick={onEdit}>
              <Pencil className="mr-2 h-3 w-3" /> Edit Details
           </Button>
        )}
      </CardContent>
    </Card>
  );
}
// --- End Extracted Component ---

export function TripPageClient({ 
  tripId,
  tripName,
  tripDescription: initialTripDescription, // Renamed prop to avoid conflict
  startDate,
  endDate,
  tripDurationDays,
  coverImageUrl: initialCoverImageUrl,
  destinationId,
  initialMembers,
  initialSections, // Use directly
  initialUnscheduledItems, // Use directly
  initialManualExpenses,
  userRole,
  canEdit,
  isTripOver,
  destinationLat,
  destinationLng,
  initialTripBudget,
  initialTags,
  slug,
  privacySetting: initialPrivacySetting, // Rename prop
  playlistUrl: initialPlaylistUrl, // Rename prop
}: TripPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Real-time subscriptions
  const supabaseRef = useRef(createClient());
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  
  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    state: TripConnectionState.Connecting,
    lastConnected: null,
    retryCount: 0,
  });
  
  // Tab state
  const [currentTab, setCurrentTab] = useState<string>(searchParams.get('tab') || 'itinerary');
  const [allItineraryItems, setAllItineraryItems] = useState<DisplayItineraryItem[]>([]);
  
  // Missing state initializations
  const [editedTripName, setEditedTripName] = useState<string>(tripName || '');
  const [editedTripDescription, setEditedTripDescription] = useState<string | null>(initialTripDescription);
  const [currentPrivacySetting, setCurrentPrivacySetting] = useState<TripPrivacySetting | null>(initialPrivacySetting);
  const [displayedCoverUrl, setDisplayedCoverUrl] = useState<string | null>(initialCoverImageUrl);
  const [members, setMembers] = useState<TripMemberFromSSR[]>(initialMembers || []);
  const [sections, setSections] = useState<ItinerarySection[]>(initialSections || []);
  const [unscheduledItems, setUnscheduledItems] = useState<DisplayItineraryItem[]>(initialUnscheduledItems || []);
  const [manualExpenses, setManualExpenses] = useState<ManualDbExpense[]>(initialManualExpenses || []);
  const [tripBudget, setTripBudget] = useState<number | null>(initialTripBudget);
  const [editedTags, setEditedTags] = useState<{ id: string; name: string }[]>(initialTags || []);
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState<string | null>(initialPlaylistUrl || null);
  
  // UI state
  const [isEditTripSheetOpen, setIsEditTripSheetOpen] = useState(false);
  const [isEditItemSheetOpen, setIsEditItemSheetOpen] = useState(false);
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isMembersSheetOpen, setIsMembersSheetOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [isSavingPlaylistUrl, setIsSavingPlaylistUrl] = useState(false);
  const [editedPlaylistUrl, setEditedPlaylistUrl] = useState(initialPlaylistUrl || '');
  const [loadingTravelTimes, setLoadingTravelTimes] = useState(false);
  const [allAvailableTags, setAllAvailableTags] = useState<{ id: string; name: string }[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [addingItemToDay, setAddingItemToDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DisplayItineraryItem | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [travelTimes, setTravelTimes] = useState<Record<string, TravelTimesResult> | null>(null);
  
  // New expense form state
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paidById: ''
  });
  // Initialize and sort combined itinerary state
  useEffect(() => {
    const combinedItems = [
      ...(initialSections?.flatMap(s => s.items) || []),
      ...(initialUnscheduledItems || []),
    ];
    // Sort items initially by day (nulls/undefined last) and then position
    combinedItems.sort((a, b) => {
      // Treat null/undefined day numbers as MAX_SAFE_INTEGER for sorting purposes
      const dayA = a.day_number ?? Number.MAX_SAFE_INTEGER;
      const dayB = b.day_number ?? Number.MAX_SAFE_INTEGER;
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;

      if (dayA !== dayB) {
        return dayA - dayB; // Sort by day number first
      } else {
        return posA - posB; // If days are the same, sort by position
      }
    });
    setAllItineraryItems(combinedItems);
  }, [initialSections, initialUnscheduledItems]);

  // Initialize trip data when props change
  useEffect(() => {
    setEditedTripName(tripName || '');
    setEditedTripDescription(initialTripDescription);
    setCurrentPrivacySetting(initialPrivacySetting);
    setDisplayedCoverUrl(initialCoverImageUrl);
    setMembers(initialMembers || []);
    setSections(initialSections || []);
    setUnscheduledItems(initialUnscheduledItems || []);
    setManualExpenses(initialManualExpenses || []);
    setTripBudget(initialTripBudget);
    setEditedTags(initialTags || []);
    setCurrentPlaylistUrl(initialPlaylistUrl || null);
    setEditedPlaylistUrl(initialPlaylistUrl || '');
  }, [
    tripName,
    initialTripDescription,
    initialPrivacySetting,
    initialCoverImageUrl,
    initialMembers,
    initialSections,
    initialUnscheduledItems,
    initialManualExpenses,
    initialTripBudget,
    initialTags,
    initialPlaylistUrl
  ]);
  // --- Define handleSaveTripDetails INSIDE the component --- 
  const handleSaveTripDetails = async (data: EditTripFormValues & { destination_id: string | null }) => {
    console.log("Saving Trip Details:", data);
    try {
      const { tags, ...tripUpdatePayload } = data; // Separate tags

      // Update Trip Details
      const tripResponse = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripUpdatePayload),
      });
      if (!tripResponse.ok) {
        const errorData = await tripResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update trip details');
      }
      const updatedTripData = await tripResponse.json(); 

      // Update Tags (if changed)
      const tagsChanged = JSON.stringify(data.tags?.sort()) !== JSON.stringify(editedTags?.map(t => t.name).sort()); // Compare with current state
      if (tagsChanged && data.tags) {
        const tagsResponse = await fetch(API_ROUTES.TRIP_TAGS(tripId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: data.tags }),
        });
        if (!tagsResponse.ok) {
          console.warn("Failed to update trip tags.");
          toast({ title: 'Warning', description: 'Trip details saved, but failed to update tags.', variant: 'default' });
        } else {
          // Assuming API returns tag objects or we refetch
          // For now, update state optimistically based on names
          const newTags = data.tags.map((name, index) => ({ id: `temp-${name}-${index}`, name })); 
          setEditedTags(newTags);
        }
      } else if (tagsChanged && (!data.tags || data.tags.length === 0)) {
          // Handle tag clearing
          const tagsResponse = await fetch(API_ROUTES.TRIP_TAGS(tripId), {
             method: 'PUT', 
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ tags: [] }),
           });
           if (!tagsResponse.ok) { 
               console.warn("Failed to clear tags"); 
           } else {
               setEditedTags([]); 
           }
      }

      // Update Local State
      setEditedTripName(updatedTripData.trip?.name ?? editedTripName);
      setEditedTripDescription(updatedTripData.trip?.description ?? editedTripDescription);
      setCurrentPrivacySetting(updatedTripData.trip?.privacy_setting ?? currentPrivacySetting);
      // Update other necessary states like cover image if returned by API
      setDisplayedCoverUrl(updatedTripData.trip?.cover_image_url ?? displayedCoverUrl);

      // Close Sheet & Show Success
      setIsEditItemSheetOpen(false);
      toast({ title: "Trip Updated", description: `Successfully updated ${data.name}.` });

    } catch (error) {
      console.error("Error updating trip:", error);
      toast({ title: 'Error Updating Trip', description: formatError(error), variant: 'destructive' });
      throw error;
    }
  };
  // --- End handleSaveTripDetails --- 

  // Wrapper for vote handling - uses the main handleVote function
  const handleVoteWrapper = async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down'): Promise<void> => {
    try {
      await handleVote(itemId, dayNumber, voteType);
    } catch (error: any) {
      console.error("Vote wrapper failed:", error);
      // Error is already handled in handleVote
    }
  };

  // Wrapper for edit item handling - uses the main handleEditItem function
  const handleEditItemWrapper = async (item: DisplayItineraryItem): Promise<void> => {
    try {
      await handleEditItem(item);
    } catch (error: any) {
      console.error("Edit item wrapper failed:", error);
      toast({ 
        title: "Error Editing Item", 
        description: error?.message || "Failed to edit item", 
        variant: "destructive" 
      });
    }
  };
  
  // --- Restore onTabChange --- 
  const onTabChange = (value: string) => {
    // Update the local state
    setCurrentTab(value);
    
    // Update URL to reflect tab change
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  // --- End Restore ---
  
  // Itinerary handlers
  const handleStatusChange = async (itemId: string, status: ItemStatus | null): Promise<void> => {
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId) + `/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast({ title: "Status updated" });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({ title: "Error updating status", variant: "destructive" });
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string): Promise<void> => {
    if (!canEdit) return; // Ensure user has permission

    // Store the current state in case we need to revert
    const originalItems = [...allItineraryItems];

    // Optimistically remove the item from the UI
    setAllItineraryItems(prevItems => prevItems.filter(item => item.id !== itemId));

    try {
      const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If API fails, throw an error to trigger the catch block
        throw new Error('Failed to delete item on server');
      }

      // API call was successful
      toast({ title: "Item deleted" });
      // No need to set state again, optimistic update already happened

    } catch (error) {
      console.error("Failed to delete item:", error);
      toast({ 
        title: "Error deleting item", 
        description: "Could not delete item. Reverting changes.",
        variant: "destructive" 
      });
      // Revert the state if the API call failed
      setAllItineraryItems(originalItems);
      // Re-throw the error if needed by calling components
      throw error; 
    }
  };

  const handleEditItem = (item: DisplayItineraryItem): Promise<void> => {
    console.log("handleEditItem triggered for:", item);
    setEditingItem(item);
    setTargetSectionId(item.section_id ?? null);
    setIsEditItemSheetOpen(true);
    // Return a resolved promise for consistency with async signature
    return Promise.resolve();
  };

  const handleVote = async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down'): Promise<void> => {
    if (!user) {
      toast({ title: "Please login to vote", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(API_ROUTES.ITINERARY_ITEM_VOTE(tripId, String(itemId)), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, dayNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }
    } catch (error: any) {
      console.error("Vote failed:", error);
      toast({ title: "Vote Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };
  // --- END Itinerary Handlers ---
  
  // Recalculate itinerary duration based on current items
  const itineraryDurationDays = useMemo(() => {
      // ... calculation ...
  }, [allItineraryItems]);

  const durationDays = tripDurationDays ?? itineraryDurationDays ?? 0;

  // --- Calculate derived state for budget ---
  const totalPlannedCost = useMemo(() => {
    // Use the state variable `allItineraryItems` for calculation
    return allItineraryItems
      .filter(item => item.estimated_cost && item.estimated_cost > 0)
      .map(item => ({
        id: item.id,
        title: item.title,
        amount: item.estimated_cost ?? null, // Ensure null if undefined
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
    // Make sure manualExpenses is an array and handle null/undefined values
    const expenses = Array.isArray(manualExpenses) ? manualExpenses : [];
    const manualTotal = expenses.reduce((sum, expense) => {
      // Make sure amount is a number, default to 0 if null/undefined/NaN
      const amount = typeof expense.amount === 'number' && !isNaN(expense.amount) ? expense.amount : 0;
      return sum + amount;
    }, 0);
    return manualTotal;
  }, [manualExpenses]);

  const handleSaveBudget = async (newBudget: number) => {
    console.log("Attempting to save new budget:", newBudget);
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: newBudget }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update budget');
      }

      setTripBudget(newBudget);
      setIsEditingBudget(false);
      toast({ title: "Budget Updated", description: `Trip budget set to $${newBudget.toFixed(2)}` });

    } catch (error: any) {
      console.error("Error updating budget:", error);
      toast({ title: "Failed to update budget", description: formatError(error), variant: "destructive" });
      throw error;
    }
  };

  const handleAddExpense = async () => {
    try {
      if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.paidById) {
        toast({ title: "Missing information", description: "Please fill all fields including Paid By", variant: "destructive" })
        return
      }
      
      const amountValue = Number.parseFloat(newExpense.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
         toast({ title: "Invalid Amount", description: "Please enter a valid positive amount.", variant: "destructive" });
         return;
      }

      const expensePayload = {
        title: newExpense.title,
        amount: amountValue,
        category: newExpense.category,
        date: newExpense.date,
        paid_by: newExpense.paidById, 
        currency: "USD",
        trip_id: tripId,
      };

      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId) + '/expenses', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expensePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add expense");
      }

      const newManualExpenseEntry: ManualDbExpense = {
        id: result.expense?.id || `temp-${Date.now()}`,
        trip_id: tripId,
        title: expensePayload.title,
        amount: expensePayload.amount,
        currency: expensePayload.currency,
        category: expensePayload.category,
        paid_by: expensePayload.paid_by,
        date: expensePayload.date,
        created_at: new Date().toISOString(),
        source: 'manual'
      };
      setManualExpenses(prev => [newManualExpenseEntry, ...prev]);
      
      toast({ title: "Expense Added" });
      
      setNewExpense({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], paidById: "" })
      setIsAddExpenseOpen(false)

    } catch (error) { 
      console.error("Failed to add expense:", error)
      toast({ title: "Error", description: formatError(error as Error, "Failed to add expense"), variant: "destructive" })
    }
  };
  
  const handleOpenLogExpenseDialog = () => {
    setIsAddExpenseOpen(true);
  };

  // Fetch All Available Tags useEffect
  useEffect(() => {
    const fetchAllTags = async () => {
      setLoadingTags(true);
      try {
        // Assuming an API route /api/tags exists to fetch all tags
        // Replace with actual fetch logic if needed
        const response = await fetch(API_ROUTES.TAGS);
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const tagsData = await response.json();
        setAllAvailableTags(tagsData.tags || []);
      } catch (error) { 
        console.error("Error fetching all tags:", error);
        toast({ title: "Error", description: "Could not load available tags.", variant: "destructive" });
      } finally {
        setLoadingTags(false);
      }
    };

    fetchAllTags();
    
    // Clean up function
    return () => {
      // Nothing to clean up, but added for consistency
    };
  }, [toast, API_ROUTES?.TAGS]); // Fetch once on mount, include dependencies

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch Travel Times useEffect
  useEffect(() => {
    const fetchTravelTimes = async () => {
      if (!tripId || (!sections && !unscheduledItems)) return;
      const pointCount = (sections?.flatMap(s => s.items) || []).length + (unscheduledItems || []).length;
      if (pointCount < 2) {
          setTravelTimes({}); 
          return;
      }
      setLoadingTravelTimes(true);
      try {
        const controller = new AbortController();
        const signal = controller.signal;
        
        const response = await fetch(API_ROUTES.TRIP_TRAVEL_TIMES(tripId), {
          signal
        });
        if (!response.ok) throw new Error('Failed to fetch travel times');
        const data: Record<string, TravelTimesResult> = await response.json();
        setTravelTimes(data);
      } catch (error: any) {
        // Don't show error for aborted requests
        if (error.name !== 'AbortError') {
          console.error("Error fetching travel times:", error);
          setTravelTimes(null);
          toast({ title: "Could not load travel times", description: formatError(error), variant: "default" });
        }
      } finally {
        setLoadingTravelTimes(false);
      }
    };
    
    const controller = new AbortController();
    fetchTravelTimes();
    
    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [tripId, sections, unscheduledItems, toast]);

  const handleSavePlaylistUrl = async () => {
    if (editedPlaylistUrl.trim() === '') {
      toast({ title: 'Invalid URL', description: 'Playlist URL cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsSavingPlaylistUrl(true);
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_url: editedPlaylistUrl }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update playlist URL');
      }
      setCurrentPlaylistUrl(editedPlaylistUrl);
      toast({ title: 'Playlist URL updated' });
    } catch (error) {
      toast({ title: 'Error', description: formatError(error as Error), variant: 'destructive' });
    } finally {
      setIsSavingPlaylistUrl(false);
    }
  };

  // Handler for adding a new item
  const handleAddItem = (dayNumber: number | null) => {
    console.log("Triggering add item sheet for day:", dayNumber);
    setEditingItem(null);
    setAddingItemToDay(dayNumber);
    setIsAddItemSheetOpen(true);
  };

  // Updated handler for saving an edited item
  const handleSaveEditedItem = async (updatedItemData: Partial<DisplayItineraryItem>) => {
      if (!editingItem) return;

      const originalItems = [...allItineraryItems];
      // Optimistic update
      setAllItineraryItems(currentItems =>
          currentItems.map(item =>
              item.id === editingItem.id
                  ? { ...item, ...updatedItemData, day_number: updatedItemData.day_number ?? item.day_number } // Merge changes, retain day if not changed
                  : item
          )
      );
      setIsEditItemSheetOpen(false); // Close sheet optimistically

      try {
          const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, editingItem.id), {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedItemData),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update item');
          }

          toast({ title: "Item updated" });
      } catch (error) {
          console.error("Error updating item:", error);
          setAllItineraryItems(originalItems); // Revert
          toast({ 
              title: "Error Updating Item",
              description: formatError(error as Error, "Failed to update item"),
              variant: "destructive" 
          });
      }
  };

  // Add missing handleReorder function
  const handleReorder = async (reorderInfo: { 
    itemId: string; 
    newDayNumber: number | null; 
    newPosition: number; 
  }): Promise<void> => {
    const { itemId, newDayNumber, newPosition } = reorderInfo;
    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY_REORDER(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, newDayNumber, newPosition }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder items');
      }
    } catch (error) {
      console.error("Reorder failed:", error);
      toast({ title: "Reorder Failed", description: formatError(error as Error), variant: "destructive" });
      throw error;
    }
  };

  // Add missing handleSaveNewItem function
  const handleSaveNewItem = async (newItemData: Partial<DisplayItineraryItem>): Promise<DisplayItineraryItem> => {
    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      const createdItem = await response.json();
      setIsAddItemSheetOpen(false);
      toast({ title: "Item Added" });
      return createdItem;
    } catch (error) {
      console.error("Failed to create item:", error);
      toast({ title: "Error Creating Item", description: formatError(error as Error), variant: "destructive" });
      throw error;
    }
  };

  // Add missing handleItemAdded function
  const handleItemAdded = (item: DisplayItineraryItem) => {
    setAllItineraryItems(prevItems => [...prevItems, item]);
  };

  // Define tab components properly
  const ItineraryTabContent = (): React.ReactNode => {
    // Convert Supabase User to Profile type (keep this helper if needed)
    const userProfile: Profile | null = user ? {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || null,
      username: user.user_metadata?.username || '',
      bio: user.user_metadata?.bio || '',
      location: user.user_metadata?.location || '',
      website: user.user_metadata?.website || '',
      is_verified: user.user_metadata?.is_verified || false,
      created_at: user.created_at || '',
      updated_at: user.updated_at || ''
    } : null;
    
    return (
      <>
        <ItineraryTab
          tripId={tripId}
          itineraryItems={allItineraryItems}
          setItineraryItems={setAllItineraryItems}
          userId={user?.id || ''}
          user={userProfile}
          userRole={userRole}
          startDate={startDate ?? null}
          durationDays={durationDays}
          onReorder={handleReorder}
          onDeleteItem={handleDeleteItem}
          onVote={handleVote}
          onEditItem={handleEditItem}
          onItemStatusChange={handleStatusChange}
          onAddItem={handleAddItem}
          key={`itinerary-tab-${allItineraryItems.length}`}
        />
      </>
    );
  };

  const BudgetTabContent = (): React.ReactNode => (
    <BudgetTab
      tripId={tripId}
      canEdit={canEdit}
      isTripOver={isTripOver}
      manualExpenses={manualExpenses}
      plannedExpenses={totalPlannedCost}
      initialMembers={members}
    />
  );

  const NotesTabContent = (): React.ReactNode => (
    <CollaborativeNotes
      tripId={tripId}
      readOnly={!canEdit}
    />
  );

  const ManageTabContent = (): React.ReactNode => (
    <MembersTab
      tripId={tripId}
      canEdit={canEdit}
      userRole={userRole}
      initialMembers={members}
    />
  );
  
  // Define tabs array with proper types
  const tabs = [
    { value: "itinerary", label: "Itinerary", content: <ItineraryTabContent /> },
    { value: "budget", label: "Budget", content: <BudgetTabContent /> },
    { value: "notes", label: "Notes", content: <NotesTabContent /> },
  ];
  
  if (canEdit) {
    tabs.push({ value: "manage", label: "Manage", content: <ManageTabContent /> });
  }

  useEffect(() => {
    setDisplayedCoverUrl(initialCoverImageUrl);
    setTripBudget(initialTripBudget);
  }, [initialCoverImageUrl, initialTripBudget]);

  const handleCoverImageSelect = async (selectedUrl: string, position?: number) => {
    setIsSavingCover(true);
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image_url: selectedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cover image');
      }

      setDisplayedCoverUrl(selectedUrl);
      setIsImageSelectorOpen(false);
      toast({ title: "Cover image updated!" });

    } catch (error: any) {
      console.error("Error updating cover image:", error);
      toast({ 
        title: "Failed to update cover image", 
        description: formatError(error), 
        variant: "destructive"
      });
    } finally {
      setIsSavingCover(false);
    }
  };

  // Log to check the value
  useEffect(() => {
    console.log('privacySetting prop value:', initialPrivacySetting);
  }, [initialPrivacySetting]);

  // Effect to update current tab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.value === tabParam)) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  // Main Return Statement
  return (
    <PresenceProvider tripId={tripId}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="absolute top-4 left-4 z-20 h-9 w-9 p-0 bg-background/50 hover:bg-background/80 md:left-auto md:relative md:self-start md:mb-2 md:-ml-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Active Users Indicator */}
        <div className="absolute top-4 right-4 z-20 md:right-auto md:relative md:self-end md:mb-2 md:-mr-10">
          <TripPresenceIndicator />
        </div>

        <TripHeader
          tripId={tripId}
          tripName={editedTripName}
          tripDescription={editedTripDescription}
          startDate={startDate}
          endDate={endDate}
          coverImageUrl={displayedCoverUrl}
          destinationId={destinationId}
          destinationName={null}
          members={members as any}
          tags={editedTags}
          canEdit={canEdit}
          slug={slug}
          privacySetting={currentPrivacySetting}
          onEdit={() => setIsEditTripSheetOpen(true)}
          onMembers={() => setIsMembersSheetOpen(true)}
          onChangeCover={() => setIsImageSelectorOpen(true)}
        />

        {/* Content Area - Itinerary, Budget, Notes, etc. */}
        {/* Removed outer flex-1 div, using main container flex */}
        <main className="flex-1 px-1 pb-12"> {/* Add padding */}
            {/* Tabs Section */}
            <Tabs defaultValue={currentTab} onValueChange={onTabChange} className="w-full">
              <TabsList className={`grid w-full mb-6 ${tabs.length === 4 ? 'grid-cols-4' : tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}> 
                {tabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>
              {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {tab.content} 
                </TabsContent>
              ))}
            </Tabs>
          </main>

          {/* Floating Action Button */}
          {canEdit && currentTab === 'itinerary' && (
             <Button
               className="fixed bottom-6 right-6 md:bottom-10 md:right-10 rounded-full w-14 h-14 shadow-lg z-50"
               onClick={() => handleAddItem(null)} // Add to unscheduled by default
               title="Add Itinerary Item"
             >
               <ImagePlus className="h-6 w-6" />
             </Button>
           )}

        </div>

        {/* Edit Item Sheet */}
      <Sheet open={isEditItemSheetOpen} onOpenChange={setIsEditItemSheetOpen}>
        <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Itinerary Item</SheetTitle>
            <SheetDescription>
              Update the details for this itinerary item.
            </SheetDescription>
          </SheetHeader>
          {editingItem && (
            <EditingWrapper itemId={editingItem.id}>
              <ItineraryItemForm
                key={editingItem.id} 
                tripId={tripId}
                initialData={editingItem}
                onSave={handleSaveEditedItem}
                onClose={() => setIsEditItemSheetOpen(false)}
              />
            </EditingWrapper>
          )}
        </SheetContent>
      </Sheet>

      {/* --- ADD BACK Edit Trip Sheet --- */}
      <Sheet open={isEditTripSheetOpen} onOpenChange={setIsEditTripSheetOpen}>
        <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Trip Details</SheetTitle>
            <SheetDescription>
               Update the core details of your trip.
            </SheetDescription>
          </SheetHeader>
          <EditTripForm
            trip={{
              id: tripId,
              name: editedTripName,
              start_date: startDate,
              end_date: endDate,
              destination_id: destinationId,
              cover_image_url: displayedCoverUrl,
              privacy_setting: currentPrivacySetting,
              tags: editedTags.map(t => t.name),
            }}
            onSave={handleSaveTripDetails}
            onClose={() => setIsEditTripSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
      {/* --- END ADD BACK Edit Trip Sheet --- */}

      {/* ADD Item Sheet (New) */}
      <Sheet open={isAddItemSheetOpen} onOpenChange={setIsAddItemSheetOpen}>
        <SheetContent className="sm:max-w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Itinerary Item</SheetTitle>
            <SheetDescription>
              Fill in the details for the new item.
            </SheetDescription>
          </SheetHeader>
          <EditingWrapper itemId={`new-item-${Date.now()}`}>
            <ItineraryItemForm
              tripId={tripId}
              initialData={null} 
              dayNumber={addingItemToDay} 
              onSave={handleSaveNewItem}
              onItemAdded={handleItemAdded}
              onClose={() => setIsAddItemSheetOpen(false)}
            />
          </EditingWrapper>
        </SheetContent>
      </Sheet>
                 </TooltipProvider>
    </PresenceProvider>
  );
}

/**
 * TripPresenceIndicator - Real-time presence tracking component
 * 
 * This component displays the real-time presence of users in the trip page,
 * including their online status, cursor positions, and editing activities.
 * It also manages connection state and provides reconnection capabilities.
 * 
 * Features:
 * - Real-time user presence display with status badges
 * - Cursor position tracking and visualization
 * - Connection state management with auto-reconnection
 * - Detailed tooltips showing user activity
 */
function TripPresenceIndicator(): React.ReactNode {
  const { 
    activeUsers, 
    myPresence, 
    status,
    connectionState, 
    error: presenceError,
    recoverPresence
  } = usePresenceContext();
  
  // Define local connection status based on context data
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>(
    presenceError ? 'disconnected' : 'connected'
  );
  
  // Connection state management
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastReconnectTime, setLastReconnectTime] = useState<Date | null>(null);
  const [reconnectTimeoutId, setReconnectTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Add throttled cursor update function for better performance
  const throttledCursorUpdate = useCallback(
    throttle((x: number, y: number) => { // Use throttle directly
      if (myPresence) {
        const cursorPos = { x, y };
        // Use the hook's internal cursor position ref if available
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cursor-moved', { detail: cursorPos }));
        }
      }
    }, 50), // Throttle to 50ms for better performance
    [myPresence]
  );
  
  // Update connection status when error changes
  useEffect(() => {
    if (presenceError) {
      setConnectionStatus('disconnected');
    } else {
      setConnectionStatus('connected');
    }
  }, [presenceError]);
  
  // Cursor tracking state
  const [showCursors, setShowCursors] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  
  // Reference to the trip content area for cursor positioning
  const tripContentRef = useRef<HTMLDivElement | null>(null);
  
  // Update lastUpdateTime when activeUsers changes
  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [activeUsers]);
  
  // Format time ago for display
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };
  /**
   * Cursor Position Tracking System
   * 
   * This effect manages the lifecycle of cursor position elements:
   * - Sets up animation frames for smooth cursor transitions
   * - Tracks all cursor DOM elements created via portals
   * - Provides comprehensive cleanup to prevent memory leaks
   * - Removes all cursor elements when the component unmounts
   */
  useEffect(() => {
    // Set up cursor tracking with animation frames for smooth transitions
    let animationFrameId: number | null = null;
    let currentCursors: Record<string, HTMLElement> = {};
    
    // Add mouse move handler for cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (showCursors) {
        throttledCursorUpdate(e.clientX, e.clientY);
      }
    };
    
    // Add mousemove listener if cursor tracking is enabled
    if (showCursors) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    const updateCursors = () => {
      // Implementation is handled by the renderCursorPositions function
      // This hook mainly handles cleanup and initialization
      
      // Schedule next frame for potential cursor updates
      if (showCursors) {
        animationFrameId = requestAnimationFrame(updateCursors);
      }
    };
    
    // Start the animation frame loop if cursors are shown
    if (showCursors) {
      animationFrameId = requestAnimationFrame(updateCursors);
    }
    
    // Enhanced cleanup function with animation frame cancellation
    // Create a comprehensive cleanup function
    const cleanup = () => {
      // Clean up all types of cursor-related elements in one go
      ['.user-cursor', '[data-presence-tooltip]', '[data-presence-portal]'].forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          try {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          } catch (err) {
            console.warn(`Error removing element with selector ${selector}:`, err);
          }
        });
      });
    };
    
    // Correct return structure for useEffect cleanup
    return () => {
      // Remove mousemove listener
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Cancel throttled cursor update
      throttledCursorUpdate.cancel();
      
      // Cancel any pending animation frames
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Run the comprehensive cleanup
      cleanup();
      
      // Run cleanup again after a small delay to catch any elements that might have been
      // created right before unmount
      setTimeout(cleanup, 100);
    };
  }, [activeUsers, showCursors]); // Add semicolon here
  
  /**
   * Connection State Management System
   * 
   * This effect monitors and manages the network connection state:
   * - Listens for browser online/offline events
   * - Updates connection quality based on status and reconnect attempts
   * - Provides appropriate error messages based on connection state
   * - Cleans up event listeners and timeouts on unmount
   */
  useEffect(() => {
    // Event listeners for network changes
    const handleOnline = () => {
      console.log('Network came online, attempting to recover presence connection');
      handleReconnect();
    };
    
    const handleOffline = () => {
      console.log('Network went offline, marking connection as disrupted');
      setConnectionQuality('poor');
      setErrorMessage('Network connection lost. Waiting for reconnection...');
    };
    
    // Monitor connection quality
    const checkConnectionQuality = () => {
      // Use connectionStatus and reconnect attempts to determine quality
      if (connectionStatus === 'connected' && reconnectAttempts === 0) {
        setConnectionQuality('good');
      } else if (connectionStatus === 'connected' && reconnectAttempts > 0) {
        setConnectionQuality('fair');
      } else if (connectionStatus === 'connecting') {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkConnectionQuality();
    
    // Check when status changes
    if (connectionStatus === 'connected') {
      setErrorMessage(null);
    } else if (connectionStatus === 'connecting') {
      setErrorMessage('Connecting to presence service...');
    } else if (presenceError) {
      setErrorMessage(`Connection error: ${presenceError.message || 'Unknown error'}`);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Clear any pending reconnection timeout
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
    };
  }, [connectionStatus, reconnectAttempts, presenceError, reconnectTimeoutId]);
  
  // Effect for component unmount cleanup
  useEffect(() => {
    return () => {
      // Ensure we clean up all cursor elements and reconnect timeouts on unmount
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      
      // Clean up cursor elements
      cleanupCursorElements();
    };
  }, []);
  
  
  /**
   * User Status Grouping Logic
   * 
   * Organizes active users into groups based on their status:
   * - editing: Users actively editing content
   * - online: Users viewing but not editing
   * - away: Users who haven't interacted recently
   * 
   * This grouping is used for display in the UI with different visual treatments.
   */
  const usersByStatus = {
    editing: activeUsers.filter(user => user.status === 'editing'),
    online: activeUsers.filter(user => user.status === 'online'),
    away: activeUsers.filter(user => user.status === 'away'),
  };
  
  // Get status icon based on user status
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'editing':
        return <Edit className="h-3 w-3 text-blue-500" />;
      case 'online':
        return <Activity className="h-3 w-3 text-green-500" />;
      case 'away':
        return <Coffee className="h-3 w-3 text-yellow-500" />;
      case 'offline':
        return <UserRound className="h-3 w-3 text-gray-500" />;
      default:
        return <UserRound className="h-3 w-3 text-gray-500" />;
    }
  };
  
  // Define status display components with icons
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      editing: "bg-blue-500 hover:bg-blue-600",
      online: "bg-green-500 hover:bg-green-600",
      away: "bg-yellow-500 hover:bg-yellow-600",
      offline: "bg-gray-500 hover:bg-gray-600",
      error: "bg-red-500 hover:bg-red-600",
    };
    
    return (
      <Badge variant="secondary" className={`${statusStyles[status as keyof typeof statusStyles]} text-white text-xs flex items-center gap-1`}>
        {getStatusIcon(status)}
        <span>{status}</span>
      </Badge>
    );
  };

  /**
   * Reconnection Handling System
   * 
   * Manages recovery of lost presence connections with smart retry logic:
   * - Implements exponential backoff for retries (increases delay between attempts)
   * - Sets timeout limits for reconnection attempts
   * - Manages reconnection state (attempts, timeout IDs, etc.)
   * - Provides clear user feedback during reconnection process
   * - Automatically retries up to 5 times before requiring manual intervention
   */
  const handleReconnect = async () => {
    if (isReconnecting) return;
    
    // Clear any existing timeout
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      setReconnectTimeoutId(null);
    }
    
    // Set current time
    setLastReconnectTime(new Date());
    setIsReconnecting(true);
    setConnectionStatus({ state: TripConnectionState.Connecting, lastConnected: new Date(), retryCount: reconnectAttempts + 1 });
    
    try {
      setReconnectAttempts(prev => prev + 1);
      setErrorMessage('Attempting to reconnect...');
      
      // Add timeout for the reconnection attempt
      const reconnectPromise = recoverPresence();
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Reconnection attempt timed out after 10 seconds'));
        }, 10000); // 10 second timeout
        
        // Save timeout ID for cleanup
        setReconnectTimeoutId(timeoutId);
      });
      
      // Race between reconnection and timeout
      await Promise.race([reconnectPromise, timeoutPromise]);
      
      // If we reach here, reconnection was successful
      setReconnectAttempts(0);
      setErrorMessage(null);
      setConnectionQuality('good');
      setConnectionStatus({ state: TripConnectionState.Connected, lastConnected: new Date(), retryCount: reconnectAttempts });
      
    } catch (err) {
      console.error("Failed to reconnect:", err);
      setConnectionStatus({ state: TripConnectionState.Disconnected, lastConnected: new Date(), retryCount: reconnectAttempts + 1 });
      
      // Determine if we should try again automatically
      if (reconnectAttempts < 5) {
        const backoffDelay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
        setErrorMessage(`Reconnection failed. Retrying in ${Math.ceil(backoffDelay/1000)} seconds...`);
        
        // Schedule automatic retry with exponential backoff
        const timeoutId = setTimeout(() => {
          handleReconnect();
        }, backoffDelay);
        
        setReconnectTimeoutId(timeoutId);
      } else {
        setErrorMessage('Multiple reconnection attempts failed. Please try again manually.');
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  // Toggle cursor visibility with cleanup
  // Comprehensive cleanup function that can be reused
  const cleanupCursorElements = () => {
    ['.user-cursor', '[data-presence-tooltip]', '[data-presence-portal]'].forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch (err) {
          console.warn(`Error removing element with selector ${selector}:`, err);
        }
      });
    });
  };
  
  const toggleCursorVisibility = () => {
    // If turning off cursors, clean up existing cursor elements
    if (showCursors) {
      cleanupCursorElements();
    }
    setShowCursors(prev => !prev);
  };

  /**
   * Cursor Position Rendering System
   * 
   * Creates visual representations of other users' cursor positions:
   * - Renders cursor elements as React portals in document.body
   * - Provides user identification with tooltips
   * - Shows user status and activity information
   * - Implements smooth transitions for cursor movement
   * - Uses deterministic colors based on user IDs for consistent identification
   * - Includes error handling to prevent crashing if a cursor can't be rendered
   */
  const renderCursorPositions = () => {
    if (!showCursors) return null;
    
    try {
      return activeUsers
        .filter(user => user.cursor_position && user.status !== 'offline' && user.status !== 'away')
        .map(user => {
          try {
            const { x, y } = user.cursor_position || { x: 0, y: 0 };
        
            // Generate a deterministic color based on the user's ID
            const generateUserColor = (userId: string) => {
              // Simple hash function
              const hash = userId.split('').reduce((acc, char) => {
                return char.charCodeAt(0) + ((acc << 5) - acc);
              }, 0);
              
              const h = Math.abs(hash) % 360;
              return `hsl(${h}, 70%, 50%)`;
            };
            
            const userColor = generateUserColor(user.user_id);
            const statusClassName = user.status === 'editing' ? 'animate-pulse' : '';
            const tooltipClassName = `absolute left-5 top-0 px-2 py-1 rounded-md text-xs font-medium 
              whitespace-nowrap opacity-0 group-hover:opacity-100 hover:opacity-100 
              transition-opacity duration-200 z-50 pointer-events-none`;
            
            return createPortal(
              <div 
                key={user.user_id}
                className="absolute pointer-events-none z-50 transition-all duration-300 ease-out user-cursor group"
                data-presence-tooltip={`user-${user.user_id}`}
                data-presence-portal="true"
                style={{ 
                  left: `${x}px`, 
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative">
                  <MousePointerClick className={`h-4 w-4 ${statusClassName}`} style={{ color: userColor }} />
                  <div 
                    className={tooltipClassName}
                    style={{ backgroundColor: `${userColor}30`, color: userColor, border: `1px solid ${userColor}40` }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{user.name || user.email || "User"}</span>
                      {user.editing_item_id && (
                        <span className="ml-1 flex items-center text-[10px]">
                          <Edit className="h-2.5 w-2.5 mr-0.5" /> Editing
                        </span>
                      )}
                    </div>
                    {user.last_active && (
                      <span className="text-[10px] opacity-80">
                        Active {formatTimeAgo(user.last_active)}
                      </span>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            );
          } catch (error) {
            console.warn(`Error rendering cursor for user ${user.user_id}:`, error);
            return null;
          }
        }).filter(Boolean);
    } catch (error) {
      console.error("Error rendering cursor positions:", error);
      return null;
    }
  };

  // Get activity info for the user
  const getActivityInfo = (user: any) => {
    if (user.status === 'editing' && user.editing_item_id) {
      return `Editing an item`;
    }
    if (user.last_active) {
      return `Active ${formatTimeAgo(user.last_active)}`;
    }
    if (user.status === 'away') {
      return `Away for ${formatTimeAgo(user.last_active || new Date().toISOString())}`;
    }
    if (user.page_path) {
      return `Viewing ${user.page_path.split('/').pop()}`;
    }
    return 'Browsing the trip';
  };
  
  // Add transition effects for status changes
  const getStatusTransitionStyle = (status: string) => {
    const baseTransition = "transition-all duration-300 ease-in-out";
    
    switch(status) {
      case 'offline':
        return `${baseTransition} opacity-50`;
      default:
        return baseTransition;
    }
  };
  
  /**
   * Connection Quality Visualization
   * 
   * Provides a visual indicator of the current connection quality:
   * - Uses color-coded indicators (green/yellow/red)
   * - Includes tooltips explaining the connection state
   * - Updates dynamically based on connection quality state
   */
  const getConnectionQualityIndicator = () => {
    const indicators = {
      good: { color: 'bg-green-500', message: 'Connection is stable' },
      fair: { color: 'bg-yellow-500', message: 'Connection may experience minor delays' },
      poor: { color: 'bg-red-500', message: 'Connection is unstable or disconnected' }
    };

    const indicator = indicators[connectionQuality] || indicators.poor;
    const { color, message } = indicator;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-2 h-2 rounded-full ${color} mr-1 cursor-help`}></div>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-2 text-xs">
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    );
  };
  
  return (
    <div className="bg-background/75 backdrop-blur-sm p-2 rounded-lg shadow-sm">
      {/* Connection error indicator with improved messaging */}
      {(connectionStatus.state === TripConnectionState.Disconnected || presenceError) && (
        <Alert variant="destructive" className="mb-2 py-1 px-2 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span className="truncate max-w-[150px]">{errorMessage || 'Connection lost'}</span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-4 p-0 ml-1 text-xs" 
              onClick={handleReconnect}
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <RotateCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                'Reconnect'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Automatic reconnection status */}
      {isReconnecting && (
        <div className="text-xs flex items-center mb-1 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          <span className="animate-pulse">
            Reconnecting to presence service...
          </span>
        </div>
      )}
      
      {/* Connection status indicator */}
      <div className="flex items-center mb-1">
        {getConnectionQualityIndicator()}
        <div className="flex items-center">
          {connectionStatus.state === TripConnectionState.Connected ? (
            <Wifi className="h-3 w-3 text-green-500 mr-1" />
          ) : connectionStatus.state === TripConnectionState.Connecting ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className="text-xs font-medium">
            {connectionStatus.state === TripConnectionState.Connected ? 'Connected' : 
             connectionStatus.state === TripConnectionState.Connecting ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
        
        {reconnectAttempts > 0 && (
          <span className="text-xs ml-1 text-muted-foreground">
            (Attempt {reconnectAttempts})
          </span>
        )}
        
        {/* Show last update time */}
        <span className="text-xs ml-auto text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          {new Date(lastUpdateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {activeUsers.some(user => user.cursor_position) && (
        <div className="mb-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs px-2 py-0" 
            onClick={toggleCursorVisibility}
          >
            <MousePointer className="h-3 w-3 mr-1" />
            {showCursors ? 'Hide Cursors' : 'Show Cursors'}
          </Button>
        </div>
      )}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className={`${connectionStatus.state === TripConnectionState.Connected ? 'animate-none' : 'animate-pulse'}`}>
            <ActiveUsers maxAvatars={5} size="md" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs p-3">
          <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            {activeUsers.length > 0 
              ? `${activeUsers.length} active user${activeUsers.length > 1 ? 's' : ''}`
              : 'No active users'}
          </div>
            {connectionStatus.state === TripConnectionState.Connected && (
              <Badge variant="outline" className="text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                Live
              </Badge>
            )}
          </div>
          
          {/* User list with status */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {/* Editing users first */}
            {usersByStatus.editing.length > 0 && (
              <div>
                <p className="text-xs font-medium flex items-center text-blue-500">
                  <Edit className="h-3 w-3 mr-1" />
                  Currently Editing:
                </p>
                <ul className="mt-1">
                  {usersByStatus.editing.map((user) => (
                    <li key={user.user_id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(user.name || user.email || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name || user.email || "Unknown user"}</span>
                      </div>
                      {getStatusBadge('editing')}
                      {user.editing_item_id && (
                        <span className="text-xs italic ml-1 text-muted-foreground truncate max-w-[100px]">
                          Editing
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Online users */}
            {usersByStatus.online.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium flex items-center text-green-500">
                  <Activity className="h-3 w-3 mr-1" />
                  Online:
                </p>
                <ul className="mt-1">
                  {usersByStatus.online.map((user) => (
                    <li key={user.user_id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(user.name || user.email || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name || user.email || "Unknown user"}</span>
                      </div>
                      {getStatusBadge('online')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs ml-1 text-muted-foreground cursor-help">
                            <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center" className="p-2 text-xs">
                          <p>{getActivityInfo(user) || 'Viewing the trip'}</p>
        </TooltipContent>
      </Tooltip>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Away users */}
            {usersByStatus.away.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium flex items-center text-yellow-500">
                  <Coffee className="h-3 w-3 mr-1" />
                  Away:
                </p>
                <ul className="mt-1">
                  {usersByStatus.away.map((user) => (
                    <li key={user.user_id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(user.name || user.email || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name || user.email || "Unknown user"}</span>
                      </div>
                      {getStatusBadge('away')}
                      {user.last_active && (
                        <span className="text-xs italic ml-1 text-muted-foreground">
                          {formatTimeAgo(user.last_active)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeUsers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No one else is currently viewing this trip
              </p>
            )}
          </div>
          
          {/* Last updated timestamp */}
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
            Presence updates in real-time as users interact with the trip
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Render cursor positions */}
      {renderCursorPositions()}
    </div>
  );
}
