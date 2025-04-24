"use client";
import { useState, useEffect } from "react";
import { Mail, Trash2, Check, X, UserPlus, Link2, ChevronDown, Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TRIP_ROLES, PERMISSION_STATUSES, API_ROUTES, PAGE_ROUTES } from "@/utils/constants";
import { SplitwiseImportDialog } from './splitwise-import-dialog';
import { getInitials } from "@/lib/utils";
import { RoleFixButton } from "./role-fix-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export function MembersTab({ tripId, canEdit = false, userRole = null, initialMembers = [], initialSplitwiseGroupId = null, isSplitwiseConnected = null, linkedSplitwiseGroupIdFromParent = null }) {
    var _a;
    // Use initialMembers passed from server-side props
    const [members, setMembers] = useState(initialMembers);
    const [accessRequests, setAccessRequests] = useState([]);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        role: TRIP_ROLES.VIEWER,
    });
    const { toast } = useToast();
    // Revert to using ADMIN and EDITOR as defined in constants.ts
    const isAdmin = [
        TRIP_ROLES.ADMIN.toUpperCase(), // Use ADMIN
        TRIP_ROLES.EDITOR.toUpperCase() // Use EDITOR
    ].includes((_a = userRole === null || userRole === void 0 ? void 0 : userRole.toUpperCase()) !== null && _a !== void 0 ? _a : '');
    // Splitwise State
    const [isSplitwiseAccountConnected, setIsSplitwiseAccountConnected] = useState(false); // Check if user has credentials stored
    const [linkedSplitwiseGroupId, setLinkedSplitwiseGroupId] = useState(initialSplitwiseGroupId); // Store the ID of the linked group for THIS trip
    const [availableSplitwiseGroups, setAvailableSplitwiseGroups] = useState([]);
    const [selectedSplitwiseGroupId, setSelectedSplitwiseGroupId] = useState(""); // For the Select dropdown
    const [isFetchingGroups, setIsFetchingGroups] = useState(false);
    const [groupFetchError, setGroupFetchError] = useState(null);
    const [isLinkingGroup, setIsLinkingGroup] = useState(false);
    const [inviteLink, setInviteLink] = useState(""); // State for invite link
    // Effect to generate invite link client-side
    useEffect(() => {
        // Ensure this runs only in the browser
        if (typeof window !== 'undefined') {
            setInviteLink(`${window.location.origin}${PAGE_ROUTES.TRIP_INVITE(tripId)}`);
        }
    }, [tripId]); // Re-run if tripId changes
    // Remove useEffect for fetching members, keep for access requests
    useEffect(() => {
        async function fetchAccessRequests() {
            // Fetch access requests if user is admin
            if (isAdmin) {
                try {
                    const requestsResponse = await fetch(API_ROUTES.PERMISSION_REQUESTS(tripId));
                    if (requestsResponse.ok) {
                        const requestsData = await requestsResponse.json();
                        setAccessRequests(requestsData.requests || []);
                    }
                    else if (requestsResponse.status !== 404) {
                        const errData = await requestsResponse.json();
                        toast({ title: "Error", description: "Error fetching access requests: " + errData.error, variant: "destructive" });
                    }
                }
                catch (error) {
                    console.error("Error fetching access requests:", error);
                    toast({ title: "Error", description: error.message || "Failed to fetch access requests", variant: "destructive" });
                }
            }
        }
        fetchAccessRequests();
    }, [tripId, isAdmin]); // Dependency array updated
    // --- Splitwise Group Fetching Logic ---
    const fetchSplitwiseGroups = async () => {
        setIsFetchingGroups(true);
        setGroupFetchError(null);
        try {
            const response = await fetch(API_ROUTES.SPLITWISE_GROUPS);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) { // 401 likely means account not connected
                    setIsSplitwiseAccountConnected(false);
                    setGroupFetchError(null); // Not really an error in this context
                    setAvailableSplitwiseGroups([]);
                }
                else {
                    throw new Error(errorData.error || `Failed to fetch groups: ${response.status}`);
                }
            }
            else {
                const data = await response.json();
                setIsSplitwiseAccountConnected(true); // Successful fetch means account is connected
                setAvailableSplitwiseGroups(data.groups || []);
                // Pre-select if only one group exists? Maybe not, let user confirm.
            }
        }
        catch (error) {
            console.error("Error fetching Splitwise groups:", error);
            setGroupFetchError(error.message || "An unexpected error occurred.");
            setIsSplitwiseAccountConnected(false); // Assume connection failed if error occurs
            setAvailableSplitwiseGroups([]);
        }
        finally {
            setIsFetchingGroups(false);
        }
    };
    // Fetch groups initially if the account might be connected but no group is linked yet
    // Also fetch if the initial group ID is cleared (unlinked)
    useEffect(() => {
        // Fetch only if we haven't confirmed the account connection status *and* no group is linked initially
        // Or if the linked group ID becomes null (e.g., after unlinking)
        if (!linkedSplitwiseGroupId) {
            // We need a reliable way to know if the *account* is connected without fetching groups.
            // Let's assume for now we always try to fetch groups if no trip group is linked.
            // A better approach might be a dedicated API endpoint `/api/splitwise/status`
            fetchSplitwiseGroups();
        }
        else {
            // If a group is linked initially, assume the account is connected
            setIsSplitwiseAccountConnected(true);
        }
    }, [linkedSplitwiseGroupId]); // Re-run if the linked group changes
    // --- Splitwise Group Linking Logic ---
    const handleLinkGroup = async () => {
        if (!selectedSplitwiseGroupId) {
            toast({ title: "No group selected", description: "Please select a Splitwise group to link." });
            return;
        }
        setIsLinkingGroup(true);
        try {
            const response = await fetch(API_ROUTES.SPLITWISE_GROUPS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, groupId: parseInt(selectedSplitwiseGroupId, 10) }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to link group: ${response.status}`);
            }
            const data = await response.json();
            setLinkedSplitwiseGroupId(parseInt(selectedSplitwiseGroupId, 10)); // Update state with newly linked group
            setAvailableSplitwiseGroups([]); // Clear available groups as linking is done
            setSelectedSplitwiseGroupId(""); // Reset selection
            toast({ title: "Success", description: data.message || "Trip linked to Splitwise group." });
            // TODO: Maybe trigger a refresh of budget tab data if needed
        }
        catch (error) {
            console.error("Error linking Splitwise group:", error);
            toast({ title: "Error Linking Group", description: error.message, variant: "destructive" });
        }
        finally {
            setIsLinkingGroup(false);
        }
    };
    // --- Splitwise Group Unlinking Logic (Optional but good practice) ---
    const handleUnlinkGroup = async () => {
        // Optional: Add confirmation dialog
        setIsLinkingGroup(true); // Reuse loading state
        try {
            // We need an API endpoint to handle unlinking (setting splitwise_group_id to null)
            // Example: PATCH /api/trips/{tripId} with { splitwise_group_id: null }
            // OR a dedicated endpoint: DELETE /api/splitwise/groups?tripId={tripId}
            // Simulating call to a hypothetical unlink endpoint
            const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ splitwise_group_id: null }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to unlink group: ${response.status}`);
            }
            setLinkedSplitwiseGroupId(null); // Clear linked group ID
            toast({ title: "Splitwise Unlinked", description: "This trip is no longer linked to a Splitwise group." });
            // Refetch available groups now that it's unlinked
            fetchSplitwiseGroups();
        }
        catch (error) {
            console.error("Error unlinking Splitwise group:", error);
            toast({ title: "Error Unlinking Group", description: error.message, variant: "destructive" });
        }
        finally {
            setIsLinkingGroup(false);
        }
    };
    const handleAddMember = async () => {
        if (!newMember.email) {
            toast({
                title: "Email required",
                description: "Please enter an email address",
                variant: "destructive",
            });
            return;
        }
        try {
            // Call the POST API (which finds/creates profile, doesn't add to trip directly)
            const response = await fetch(API_ROUTES.TRIP_MEMBERS(tripId), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: newMember.email,
                    role: newMember.role, // Send role for potential future use/invite logic
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to add member");
            }
            // const data = await response.json() // We don't need the response data here
            // Don't update members list directly as POST doesn't return the trip_member record
            // setMembers([...members, data.member as TripMemberFromSSR]) 
            setIsAddMemberOpen(false);
            // Reset form
            setNewMember({
                name: "",
                email: "",
                role: TRIP_ROLES.VIEWER,
            });
            toast({
                title: "Member invited",
                description: "Invitation process initiated for the user.",
            });
            // Consider refreshing the list or page if immediate feedback is needed
            // For now, rely on user refreshing or subsequent navigation
            // Or, uncomment below to force a reload:
            // window.location.reload(); 
        }
        catch (error) {
            console.error("Error adding member:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to invite member",
                variant: "destructive",
            });
        }
    };
    const handleRemoveMember = async (memberToRemoveId) => {
        try {
            // Use the correct member ID passed as argument
            const response = await fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${memberToRemoveId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to remove member");
            }
            // Update members list optimistically
            setMembers(members.filter((member) => member.id !== memberToRemoveId));
            toast({
                title: "Member removed",
                description: "Member has been removed from the trip",
            });
        }
        catch (error) {
            console.error("Error removing member:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to remove member",
                variant: "destructive",
            });
        }
    };
    const handleAccessRequest = async (requestId, approve) => {
        try {
            const response = await fetch(`${API_ROUTES.PERMISSION_REQUESTS(tripId)}/${requestId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: approve ? PERMISSION_STATUSES.APPROVED : PERMISSION_STATUSES.REJECTED,
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to process request");
            }
            // Update access requests list
            setAccessRequests(accessRequests.filter((req) => req.id !== requestId));
            // If approved, refresh members list - refetch or add locally?
            // Refetching might be simpler to ensure data consistency
            if (approve) {
                // Fetch members again after approval
                try {
                    const membersResponse = await fetch(API_ROUTES.TRIP_MEMBERS(tripId));
                    if (membersResponse.ok) {
                        const membersData = await membersResponse.json();
                        // Assume API returns data in TripMemberFromSSR format or similar
                        setMembers(membersData.members || []); // Replace with new list
                    }
                    else {
                        toast({ title: "Error", description: "Could not refresh members list after approval.", variant: "destructive" });
                    }
                }
                catch (e) {
                    toast({ title: "Error", description: "Failed to refresh members list.", variant: "destructive" });
                }
            }
            toast({
                title: approve ? "Request approved" : "Request denied",
                description: approve ? "User now has edit access" : "Access request was denied",
            });
        }
        catch (error) {
            console.error("Error processing access request:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to process request",
                variant: "destructive",
            });
        }
    };
    const refreshAfterRoleFix = () => {
        // Reload the page to ensure all permissions are updated
        window.location.reload();
    };
    // Adapt rendering logic to use the new members state structure (TripMemberFromSSR)
    // Check if members exist and map over them
    const memberCards = members && members.length > 0 ? (members.map((member) => {
        var _a, _b, _c;
        // Add safe defaults for potentially null profile data
        const memberName = ((_a = member.profiles) === null || _a === void 0 ? void 0 : _a.name) || "Invited User";
        const memberRole = ((_b = member.role) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || TRIP_ROLES.VIEWER.toLowerCase();
        const memberInitials = getInitials(memberName);
        return (<Card key={member.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={((_c = member.profiles) === null || _c === void 0 ? void 0 : _c.avatar_url) || undefined}/>
              <AvatarFallback>{memberInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{memberName}</p>
              <p className="text-sm text-muted-foreground capitalize">{memberRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">{memberRole}</Badge>
            {/* Check canEdit and if the member is not an admin */}
            {canEdit && ![TRIP_ROLES.ADMIN.toLowerCase()].includes(memberRole) && (<Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)} // Pass the correct member ID
             className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4"/>
                <span className="sr-only">Remove member</span>
              </Button>)}
          </div>
        </Card>);
    })) : (<p className="text-muted-foreground text-center py-4">No members found for this trip.</p>);
    return (<div className="space-y-6 py-4">
      {/* Pending Access Requests Card - Only for Admin/Editor */}
      {isAdmin && accessRequests.length > 0 && (<Card>
          <CardHeader>
            <CardTitle>Waiting List</CardTitle>
            <CardDescription>Folks asking to jump into the planning fun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessRequests.map((request) => (<Card key={request.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.user.avatar_url || undefined}/>
                    <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.user.name}</p>
                    <p className="text-sm text-muted-foreground">{request.user.email}</p>
                    {request.message && <p className="text-xs italic text-muted-foreground pt-1">"{request.message}"</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleAccessRequest(request.id, false)} className="text-destructive hover:bg-destructive/10">
                    <X className="h-4 w-4"/>
                    <span className="sr-only">Deny</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleAccessRequest(request.id, true)} className="text-success hover:bg-success/10">
                    <Check className="h-4 w-4"/>
                    <span className="sr-only">Approve</span>
                  </Button>
                </div>
              </Card>))}
          </CardContent>
        </Card>)}

      {/* Main Members Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          {/* Keep title and description together */}
          <div className="flex-grow">
            <CardTitle className="text-2xl font-bold">Meet Your Crew</CardTitle>
            {/* Adjust padding here for mobile alignment */}
            <CardDescription className="mt-2 text-muted-foreground max-w-lg px-0 sm:px-0">
              See who is joining the adventure and manage your travel pals.
            </CardDescription>
          </div>
          {/* Ensure button is block or flex-col item on mobile */}
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:flex-shrink-0">
            {canEdit && (<DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="default" className="bg-travel-purple hover:bg-purple-400 text-purple-900">
                      <UserPlus className="mr-2 h-4 w-4"/> Add Member <ChevronDown className="ml-2 h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem onSelect={() => setIsAddMemberOpen(true)}>
                       <Mail className="mr-2 h-4 w-4"/> Invite by Email
                   </DropdownMenuItem>
                   <DropdownMenuItem onSelect={() => { /* Logic to copy invite link */ navigator.clipboard.writeText(inviteLink); toast({ title: 'Link Copied!' }); }}>
                       <Link2 className="mr-2 h-4 w-4"/> Copy Invite Link
                   </DropdownMenuItem>
                    {isSplitwiseAccountConnected && (<DropdownMenuItem onSelect={() => setIsImportModalOpen(true)}>
                            <Import className="mr-2 h-4 w-4"/> Import from Splitwise
                        </DropdownMenuItem>)}
                 </DropdownMenuContent>
              </DropdownMenu>)}
            {/* Add other CTAs related to members if needed */}
           </div>
        </CardHeader>
        <CardContent>
          {/* Member List */}
          {memberCards}
          
          {/* Fix Permission Button */}
          {members.length > 0 && (<div className="mt-6 flex justify-center">
              <RoleFixButton tripId={tripId} onRoleFixed={refreshAfterRoleFix}/>
            </div>)}
        </CardContent>
      </Card>

      {/* Splitwise Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Splitwise Integration</CardTitle>
          <CardDescription>Manage your Splitwise connections and import groups.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={inviteLink} readOnly className="flex-1" placeholder="Generating link..."/>
            <Button variant="outline" size="icon" onClick={() => {
            if (!inviteLink)
                return;
            navigator.clipboard.writeText(inviteLink);
            toast({ title: "Copied!", description: "Invite link copied to clipboard." });
        }} disabled={!inviteLink}>
              <span className="sr-only">Copy</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite a Friend via Email</DialogTitle>
            <DialogDescription>
              Pop in their email and choose their role. They'll get a magic link to join!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" value={newMember.email} onChange={(e) => setNewMember(Object.assign(Object.assign({}, newMember), { email: e.target.value }))} className="col-span-3" placeholder="friend@example.com" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember(Object.assign(Object.assign({}, newMember), { role: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TRIP_ROLES.VIEWER}>Viewer</SelectItem>
                  <SelectItem value={TRIP_ROLES.CONTRIBUTOR}>Contributor</SelectItem>
                  <SelectItem value={TRIP_ROLES.EDITOR}>Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} className="bg-travel-purple rounded-full hover:bg-travel-purple-dark">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Splitwise Import Dialog */}
      <SplitwiseImportDialog isOpen={isImportModalOpen} onOpenChange={setIsImportModalOpen} tripId={tripId} isLinked={linkedSplitwiseGroupIdFromParent !== null}/>
    </div>);
}
