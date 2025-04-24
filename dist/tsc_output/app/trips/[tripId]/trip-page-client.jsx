'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { MembersTab } from "@/components/members-tab";
import { BudgetTab } from "@/components/budget-tab";
import { CollaborativeNotes } from "@/components/collaborative-notes";
import { API_ROUTES, PAGE_ROUTES } from "@/utils/constants";
import { ItineraryDisplay } from "@/components/itinerary/itinerary-display";
import { ItineraryBuilder } from "@/components/itinerary/itinerary-builder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SplitwiseActionButton } from "@/components/SplitwiseActionButton";
import { TripTabsWrapper } from "@/app/trips/components/TripTabsWrapper";
export function TripPageClient({ 
// ... (Props)
tripId, tripName, destinationId, initialMembers, initialItineraryItems, initialSplitwiseGroupId, initialSplitwiseExpenses, initialManualExpenses, initialLinkedGroupName, userRole, canEdit, isTripOver, }) {
    // ... (Hooks: toast, router, pathname, searchParams)
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // ... (State management)
    const currentTab = searchParams.get('tab') || 'itinerary';
    const [itineraryItems, setItineraryItems] = useState(initialItineraryItems);
    const [isLinked, setIsLinked] = useState(initialSplitwiseGroupId !== null);
    const [isConnected, setIsConnected] = useState(null);
    const [splitwiseGroupId, setSplitwiseGroupId] = useState(initialSplitwiseGroupId);
    const [splitwiseGroups, setSplitwiseGroups] = useState(null);
    const [splitwiseExpenses, setSplitwiseExpenses] = useState(initialSplitwiseExpenses);
    const [linkedGroupName, setLinkedGroupName] = useState(initialLinkedGroupName);
    const [splitwiseActionLoading, setSplitwiseActionLoading] = useState(false);
    const [splitwiseStatusLoading, setSplitwiseStatusLoading] = useState(true);
    const [splitwiseError, setSplitwiseError] = useState(null);
    // Define tab content components
    const ItineraryTabContent = () => (canEdit ? (<ItineraryBuilder tripId={tripId} destinationId={destinationId}/>) : (<ItineraryDisplay initialItems={itineraryItems} tripId={tripId} canEdit={canEdit}/>));
    const BudgetTabContent = () => (<BudgetTab tripId={tripId} canEdit={canEdit} isTripOver={isTripOver} initialSplitwiseExpenses={splitwiseExpenses} initialManualExpenses={initialManualExpenses} splitwiseGroupId={splitwiseGroupId}/>);
    const NotesTabContent = () => (<CollaborativeNotes tripId={tripId} readOnly={!canEdit}/>);
    const MembersTabContent = () => (<MembersTab tripId={tripId} canEdit={canEdit} userRole={userRole} initialMembers={initialMembers} initialSplitwiseGroupId={splitwiseGroupId} isSplitwiseConnected={isConnected} linkedSplitwiseGroupIdFromParent={splitwiseGroupId}/>);
    // Define tabs with content components
    const tabs = [
        { value: "itinerary", label: "Itinerary", content: <ItineraryTabContent /> },
        { value: "budget", label: "Budget", content: <BudgetTabContent /> },
        { value: "notes", label: "Notes", content: <NotesTabContent /> },
        { value: "members", label: "Members", content: <MembersTabContent /> },
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
            }
            else if (groupsResponse.status === 401) {
                // 401 specifically means the user needs to authenticate (connect account)
                setIsConnected(false);
                setSplitwiseGroups([]); // Ensure groups are empty
            }
            else {
                // Handle other errors during group fetch
                const groupsErrorData = await groupsResponse.json().catch(() => ({}));
                console.error("Splitwise Client: Error fetching groups:", groupsResponse.status, groupsErrorData);
                setIsConnected(null); // Status uncertain
                setSplitwiseError(groupsErrorData.error || "Failed to check Splitwise status.");
                setSplitwiseGroups([]);
            }
        }
        catch (groupFetchError) {
            // Handle network errors
            console.error("Splitwise Client: Network error fetching groups:", groupFetchError);
            setIsConnected(null); // Status uncertain
            setSplitwiseError("Network error checking Splitwise status.");
            setSplitwiseGroups([]);
        }
        finally {
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
    const handleLinkGroup = async (groupIdToLink) => {
        if (!groupIdToLink)
            return;
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
            const selectedGroup = splitwiseGroups === null || splitwiseGroups === void 0 ? void 0 : splitwiseGroups.find(g => g.id.toString() === groupIdToLink);
            const newGroupId = parseInt(groupIdToLink, 10);
            // Update state after successful link
            setSplitwiseGroupId(newGroupId); // This will trigger the useEffect to re-run checkSplitwiseStatus
            setLinkedGroupName((selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.name) || null);
            // No need to set isLinked/isConnected here, useEffect handles it
            setSplitwiseGroups(null); // Clear groups list after linking
            toast({ title: "Success", description: "Trip linked to Splitwise group." });
        }
        catch (error) {
            console.error("Error linking Splitwise group:", error);
            setSplitwiseError(error.message || "Failed to link group");
            toast({ title: "Error Linking Group", description: error.message, variant: "destructive" });
        }
        finally {
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
        }
        catch (error) {
            console.error("Error unlinking Splitwise group:", error);
            setSplitwiseError(error.message || "Failed to unlink group");
            toast({ title: "Error Unlinking Group", description: error.message, variant: "destructive" });
        }
        finally {
            setSplitwiseActionLoading(false);
        }
    };
    // --- NEW: Disconnect Handler --- 
    const handleDisconnect = async () => {
        // Optionally add a confirmation dialog here
        setSplitwiseActionLoading(true);
        setSplitwiseError(null);
        try {
            const response = await fetch("/api/splitwise/connection", {
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
        }
        catch (error) {
            console.error("Error disconnecting Splitwise account:", error);
            setSplitwiseError(error.message || "Failed to disconnect account");
            toast({ title: "Error Disconnecting", description: error.message, variant: "destructive" });
        }
        finally {
            setSplitwiseActionLoading(false);
        }
    };
    return (<div className="container mx-auto py-4 md:py-6 pt-4 md:pt-6 pb-12 px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2 md:gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4"/>
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-lg md:text-2xl font-bold text-center flex-1 truncate text-lowercase">{tripName}</h1>
        <div className="flex items-center gap-2">
          {canEdit && (<Link href={PAGE_ROUTES.EDIT_TRIP(tripId)} passHref>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1"/>
                Edit
              </Button>
            </Link>)}
          <SplitwiseActionButton tripId={tripId} isConnected={isConnected} isLinked={isLinked} isLoading={splitwiseActionLoading || splitwiseStatusLoading} groups={splitwiseGroups} linkedGroupName={linkedGroupName} error={splitwiseError} onConnect={handleConnect} onLink={handleLinkGroup} onUnlink={handleUnlinkGroup} onDisconnect={handleDisconnect}/>
        </div>
      </div>
      
      {/* Replace direct Tabs implementation with TripTabsWrapper */}
      <TripTabsWrapper tabs={tabs} defaultValue="itinerary" className="w-full"/>
    </div>);
}
