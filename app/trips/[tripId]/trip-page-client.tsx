'use client'

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MembersTab, MemberProfile, TripMemberFromSSR } from "@/components/members-tab"
import { BudgetTab } from "@/components/budget-tab"
import { CollaborativeNotes } from "@/components/collaborative-notes"
import { API_ROUTES, PAGE_ROUTES, TRIP_ROLES, TripRole } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatError } from "@/lib/utils"
import { SplitwiseActionButton } from "@/components/SplitwiseActionButton"
import { SplitwiseGroup } from "@/lib/services/splitwise"
import { SplitwiseExpense } from "@/components/splitwise-expenses"
import { type DisplayItineraryItem } from './page'
import { ItineraryTab } from "@/components/itinerary-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// ... (Interface TripPageClientProps)
interface TripPageClientProps {
  tripId: string
  tripName: string
  destinationId: string | null
  initialMembers: TripMemberFromSSR[]
  initialItineraryItems: DisplayItineraryItem[]
  initialSplitwiseGroupId: number | null
  initialSplitwiseExpenses: SplitwiseExpense[]
  initialManualExpenses: ManualDbExpense[]
  initialLinkedGroupName: string | null
  userRole: TripRole | null
  canEdit: boolean
  isTripOver: boolean
}

export function TripPageClient({ 
  // ... (Props)
  tripId,
  tripName,
  destinationId,
  initialMembers,
  initialItineraryItems,
  initialSplitwiseGroupId,
  initialSplitwiseExpenses,
  initialManualExpenses,
  initialLinkedGroupName,
  userRole,
  canEdit,
  isTripOver,
}: TripPageClientProps) {
  // ... (Hooks: toast, router, pathname, searchParams)
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ... (State management)
  const currentTab = searchParams.get('tab') || 'itinerary';
  const [isLinked, setIsLinked] = useState<boolean | null>(initialSplitwiseGroupId !== null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [splitwiseGroupId, setSplitwiseGroupId] = useState<number | null>(initialSplitwiseGroupId);
  const [splitwiseGroups, setSplitwiseGroups] = useState<SplitwiseGroup[] | null>(null);
  const [splitwiseExpenses, setSplitwiseExpenses] = useState<SplitwiseExpense[]>(initialSplitwiseExpenses);
  const [linkedGroupName, setLinkedGroupName] = useState<string | null>(initialLinkedGroupName);
  const [splitwiseActionLoading, setSplitwiseActionLoading] = useState(false);
  const [splitwiseStatusLoading, setSplitwiseStatusLoading] = useState(true);
  const [splitwiseError, setSplitwiseError] = useState<string | null>(null);

  // Handle tab changes
  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Define tab content components
  const ItineraryTabContent = () => (
    <ItineraryTab 
      tripId={tripId} 
      initialItems={initialItineraryItems as any[]}
      canEdit={canEdit} 
    />
  );

  const BudgetTabContent = () => (
    <BudgetTab
      tripId={tripId}
      canEdit={canEdit}
      isTripOver={isTripOver}
      initialSplitwiseExpenses={splitwiseExpenses} 
      initialManualExpenses={initialManualExpenses}
      splitwiseGroupId={splitwiseGroupId}
    />
  );

  const NotesTabContent = () => (
    <CollaborativeNotes
      tripId={tripId}
      readOnly={!canEdit}
    />
  );

  const MembersTabContent = () => (
    <MembersTab
      tripId={tripId}
      canEdit={canEdit}
      userRole={userRole}
      initialMembers={initialMembers}
      initialSplitwiseGroupId={splitwiseGroupId} 
      isSplitwiseConnected={isConnected}
      linkedSplitwiseGroupIdFromParent={splitwiseGroupId}
    />
  );

  // Define tabs with content components
  const tabs: { value: string; label: string; content: JSX.Element }[] = [
    { value: "itinerary", label: "Itinerary", content: <ItineraryTabContent /> },
    { value: "budget", label: "Budget", content: <BudgetTabContent /> },
    { value: "notes", label: "Notes", content: <NotesTabContent /> },
    { value: "members", label: "Members", content: <MembersTabContent /> },
    // Add settings tab if component exists
    // ...(TripSettingsTab ? [{ value: "settings", label: "Settings", content: <SettingsTabContent /> }] : []), // Commented out
  ];

  // ... (Existing functions: checkSplitwiseStatus, useEffect, handleConnect, etc.)
  const checkSplitwiseStatus = async () => {
    setSplitwiseStatusLoading(true);
    setSplitwiseError(null);
    // Reset groups before checking
    setSplitwiseGroups(null);

    // If we know the trip is linked, we know the account is connected.
    if (splitwiseGroupId) {
      setIsLinked(true);
      setIsConnected(true);
      setSplitwiseStatusLoading(false);
      return;
    }
    
    // If trip is not linked, check connection status by trying to fetch groups.
    setIsLinked(false); // Explicitly set linked to false if no splitwiseGroupId
    try {
      // Use the constant for the API route
      const groupsResponse = await fetch(API_ROUTES.SPLITWISE_GROUPS);
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setSplitwiseGroups(groupsData.groups || []);
        setIsConnected(true);
      } else if (groupsResponse.status === 401) {
        // 401 specifically means the user needs to authenticate (connect account)
        setIsConnected(false);
        setSplitwiseGroups([]); // Ensure groups are empty
      } else {
        // Handle other errors during group fetch
        const groupsErrorData = await groupsResponse.json().catch(() => ({}));
        console.error("Splitwise Client: Error fetching groups:", groupsResponse.status, groupsErrorData);
        setIsConnected(null); // Status uncertain
        setSplitwiseError(groupsErrorData.error || "Failed to check Splitwise status.");
        setSplitwiseGroups([]);
      }
    } catch (groupFetchError: any) {
      // Handle network errors
      console.error("Splitwise Client: Network error fetching groups:", groupFetchError);
      setIsConnected(null); // Status uncertain
      setSplitwiseError("Network error checking Splitwise status.");
      setSplitwiseGroups([]);
    } finally {
      setSplitwiseStatusLoading(false);
    }
  };

  useEffect(() => {
    checkSplitwiseStatus();
    // Rerun checkSplitwiseStatus if splitwiseGroupId changes (e.g., after linking/unlinking)
  }, [splitwiseGroupId]); 

  const handleConnect = () => {
    window.location.href = API_ROUTES.SPLITWISE_AUTH(tripId);
  };

  const handleLinkGroup = async (groupIdToLink: string) => {
    if (!groupIdToLink) return;
    setSplitwiseActionLoading(true);
    setSplitwiseError(null);
    try {
      // Use constant for API route
      const response = await fetch(API_ROUTES.SPLITWISE_LINK, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, groupId: parseInt(groupIdToLink, 10) }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to link group: ${response.status}`);
      }
      const selectedGroup = splitwiseGroups?.find(g => g.id.toString() === groupIdToLink);
      const newGroupId = parseInt(groupIdToLink, 10);
      // Update state after successful link
      setSplitwiseGroupId(newGroupId); // This will trigger the useEffect to re-run checkSplitwiseStatus
      setLinkedGroupName(selectedGroup?.name || null);
      // No need to set isLinked/isConnected here, useEffect handles it
      setSplitwiseGroups(null); // Clear groups list after linking
      toast({ title: "Success", description: "Trip linked to Splitwise group." });
    } catch (error: any) {
      console.error("Error linking Splitwise group:", error);
      setSplitwiseError(error.message || "Failed to link group");
      toast({ title: "Error Linking Group", description: error.message, variant: "destructive" });
    } finally {
      setSplitwiseActionLoading(false);
    }
  };

  const handleUnlinkGroup = async () => {
    setSplitwiseActionLoading(true);
    setSplitwiseError(null);
    try {
      // Use constant for API route
      const response = await fetch(API_ROUTES.SPLITWISE_LINK, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to unlink group: ${response.status}`);
      }
      // Update state after successful unlink
      setSplitwiseGroupId(null); // This triggers useEffect
      setLinkedGroupName(null);
      setSplitwiseExpenses([]); // Clear expenses when unlinked
      // No need to set isLinked/isConnected here, useEffect handles it
      toast({ title: "Success", description: "Trip unlinked from Splitwise." });
      // checkSplitwiseStatus(); // No need to call directly, useEffect handles it
    } catch (error: any) {
      console.error("Error unlinking Splitwise group:", error);
      setSplitwiseError(error.message || "Failed to unlink group");
      toast({ title: "Error Unlinking Group", description: error.message, variant: "destructive" });
    } finally {
      setSplitwiseActionLoading(false);
    }
  };

  // --- NEW: Disconnect Handler --- 
  const handleDisconnect = async () => {
    // Optionally add a confirmation dialog here
    setSplitwiseActionLoading(true);
    setSplitwiseError(null);
    try {
      const response = await fetch("/api/splitwise/connection", { // Use the new API route
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to disconnect: ${response.status}`);
      }

      // Reset all Splitwise related state upon successful disconnect
      setSplitwiseGroupId(null);
      setLinkedGroupName(null);
      setSplitwiseExpenses([]);
      setIsLinked(false);
      setIsConnected(false); // Account is now disconnected
      setSplitwiseGroups(null);
      setSplitwiseError(null); // Clear any previous errors
      
      toast({ title: "Splitwise Disconnected", description: "Your account connection has been removed." });

      // Optionally redirect to connect flow? Or just let the UI update.
      // handleConnect(); 

    } catch (error: any) {
      console.error("Error disconnecting Splitwise account:", error);
      setSplitwiseError(error.message || "Failed to disconnect account");
      toast({ title: "Error Disconnecting", description: error.message, variant: "destructive" });
    } finally {
      setSplitwiseActionLoading(false);
    }
  };

  return (
    // Replace TripHeader with a simple div or fragment for now
    // <TripHeader tripName={tripName} tripId={tripId} canEdit={canEdit} onBack={() => router.back()}>
    <div className="container mx-auto py-4 md:py-6 pt-4 md:pt-6 pb-12 px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2 md:gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-lg md:text-2xl font-bold text-center flex-1 truncate text-lowercase">{tripName}</h1>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={PAGE_ROUTES.EDIT_TRIP(tripId)} passHref>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
          )}
          <SplitwiseActionButton
            tripId={tripId}
            isConnected={isConnected}
            isLinked={isLinked}
            isLoading={splitwiseActionLoading || splitwiseStatusLoading}
            groups={splitwiseGroups}
            linkedGroupName={linkedGroupName}
            error={splitwiseError}
            onConnect={handleConnect}
            onLink={handleLinkGroup}
            onUnlink={handleUnlinkGroup}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>
      
      {/* Use the Tabs component for navigation */}
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6"> 
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
    // </TripHeader>
  );
} 