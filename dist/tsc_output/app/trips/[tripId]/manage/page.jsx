"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Users, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { API_ROUTES, PAGE_ROUTES, TRIP_ROLES } from "@/utils/constants";
export default function ManageTripPage(props) {
    const { tripId } = props.params;
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [trip, setTrip] = useState(null);
    const [members, setMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editedTrip, setEditedTrip] = useState({});
    const [inviteEmail, setInviteEmail] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch(API_ROUTES.AUTH_CHECK);
            const data = await response.json();
            if (!data.user) {
                router.push('/auth/signin');
                return;
            }
        }
        catch (error) {
            console.error('Error checking auth:', error);
            router.push('/auth/signin');
        }
        finally {
            setIsLoading(false);
        }
    }, [router]);
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin');
        }
    }, [authLoading, user, router]);
    // Fetch trip data and check permissions
    useEffect(() => {
        if (!user)
            return;
        async function fetchTripData() {
            try {
                setIsLoading(true);
                // Fetch trip details
                const tripResponse = await fetch(API_ROUTES.TRIP_DETAILS(tripId));
                if (!tripResponse.ok) {
                    if (tripResponse.status === 403) {
                        toast({
                            title: "Access denied",
                            description: "You don't have permission to manage this trip",
                            variant: "destructive",
                        });
                        router.push(PAGE_ROUTES.TRIP_DETAILS(tripId));
                        return;
                    }
                    throw new Error("Failed to fetch trip");
                }
                const tripData = await tripResponse.json();
                const fetchedTrip = tripData.trip;
                setTrip(fetchedTrip);
                setEditedTrip(fetchedTrip);
                // Fetch members
                const membersResponse = await fetch(API_ROUTES.TRIP_MEMBERS(tripId));
                if (!membersResponse.ok)
                    throw new Error("Failed to fetch members");
                const membersData = await membersResponse.json();
                setMembers(membersData.members);
                // Check user role
                const currentMember = membersData.members.find((m) => m.email === (user === null || user === void 0 ? void 0 : user.email));
                setIsAdmin((currentMember === null || currentMember === void 0 ? void 0 : currentMember.role) === TRIP_ROLES.ADMIN || (currentMember === null || currentMember === void 0 ? void 0 : currentMember.role) === TRIP_ROLES.EDITOR);
                // --- Add these logs ---
                console.log("User Email:", user === null || user === void 0 ? void 0 : user.email);
                console.log("All Members:", membersData.members);
                console.log("Current Member Found:", currentMember);
                console.log("Current Member Role:", currentMember === null || currentMember === void 0 ? void 0 : currentMember.role);
                console.log("Comparing against ADMIN:", TRIP_ROLES.ADMIN); // Should log 'admin'
                console.log("Comparing against EDITOR:", TRIP_ROLES.EDITOR); // Should log 'editor'
                // --- End of logs ---
                if (fetchedTrip.start_date) {
                    setStartDate(new Date(fetchedTrip.start_date));
                }
                if (fetchedTrip.end_date) {
                    setEndDate(new Date(fetchedTrip.end_date));
                }
            }
            catch (error) {
                console.error("Error fetching trip data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load trip data",
                    variant: "destructive",
                });
                router.push(PAGE_ROUTES.TRIP_DETAILS(tripId));
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchTripData();
    }, [user, tripId, toast, router]);
    const handleSave = async () => {
        if (!trip)
            return;
        setIsSaving(true);
        try {
            const updatePayload = {};
            if (editedTrip.name !== undefined) {
                updatePayload.name = editedTrip.name;
            }
            if (editedTrip.is_public !== undefined) {
                updatePayload.is_public = editedTrip.is_public;
            }
            updatePayload.start_date = startDate ? startDate.toISOString() : null;
            updatePayload.end_date = endDate ? endDate.toISOString() : null;
            Object.keys(updatePayload).forEach((key) => updatePayload[key] === undefined && delete updatePayload[key]);
            const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });
            if (!response.ok)
                throw new Error("Failed to update trip");
            const updatedTripData = await response.json();
            const updatedTrip = updatedTripData.trip;
            setTrip(updatedTrip);
            setEditedTrip(updatedTrip);
            toast({
                title: "Changes saved",
                description: "Trip details have been updated",
            });
        }
        catch (error) {
            console.error("Error saving trip:", error);
            toast({
                title: "Error",
                description: "Failed to save changes",
                variant: "destructive",
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!user)
            return;
        try {
            const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete trip");
            }
            router.push(PAGE_ROUTES.TRIPS);
        }
        catch (error) {
            console.error('Error deleting trip:', error);
        }
    };
    const handleInvite = async () => {
        if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return;
        }
        try {
            const response = await fetch(API_ROUTES.TRIP_MEMBER_INVITE(tripId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });
            if (!response.ok)
                throw new Error("Failed to send invitation");
            toast({
                title: "Invitation sent",
                description: `Invitation email sent to ${inviteEmail}`,
            });
            setInviteEmail("");
            // Refresh members list
            const membersResponse = await fetch(API_ROUTES.TRIP_MEMBERS(tripId));
            if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                setMembers(membersData.members);
            }
        }
        catch (error) {
            console.error("Error inviting member:", error);
            toast({
                title: "Error",
                description: "Failed to send invitation",
                variant: "destructive",
            });
        }
    };
    // Helper function to handle input changes for editedTrip state
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTrip(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    // Helper function to handle switch changes
    const handleSwitchChange = (checked, name) => {
        setEditedTrip(prev => (Object.assign(Object.assign({}, prev), { [name]: checked })));
    };
    if (authLoading || !user) {
        // Return loading indicator or null while auth state is resolving
        // Consider a more robust loading state
        return <div className="container py-8 text-center">Loading user...</div>;
    }
    // Construct currentUser without accessing user_metadata
    const currentUser = {
        id: user.id,
        name: null, // Cannot reliably get name from user object here
        email: user.email || '',
        avatar_url: undefined // Cannot reliably get avatar from user object here
    };
    const LoadingState = ({ isLoading }) => {
        if (isLoading) {
            return (<div className="container max-w-5xl py-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
        </div>);
        }
        return null;
    };
    const DragHandle = ({ attributes, listeners, ref }) => (<div ref={ref} {...attributes} {...listeners}>
      // ... existing code ...
    </div>);
    if (isLoading) {
        return (<LoadingState isLoading={isLoading}/>);
    }
    if (!trip) {
        return (<div className="container max-w-5xl py-6">
        <div className="flex items-center mb-6">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4"/>
              back to trip
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Trip Not Found</h2>
          <p className="text-muted-foreground mt-2">This trip doesn't exist or you don't have access to it.</p>
          <Button className="mt-4" onClick={() => router.push("/trips")}>
            View All Trips
          </Button>
        </div>
      </div>);
    }
    // Handle destination name access carefully
    // Assuming destinations is an array and we want the first one's name
    const destinationName = trip.destinations && trip.destinations.length > 0 && trip.destinations[0].destination
        ? trip.destinations[0].destination.name
        : "Unknown Destination";
    return (<div className="container py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Trip
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Manage Trip: {trip.name}</CardTitle>
          <CardDescription>Edit details, manage members, and configure settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* General Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5"/> General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Trip Name</Label>
                <Input id="name" name="name" value={editedTrip.name || ''} onChange={handleInputChange} disabled={!isAdmin}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")} disabled={!isAdmin}>
                                  <CalendarIcon className="mr-2 h-4 w-4"/>
                                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus/>
                          </PopoverContent>
                      </Popover>
                  </div>
                  <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")} disabled={!isAdmin}>
                                  <CalendarIcon className="mr-2 h-4 w-4"/>
                                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} initialFocus/>
                          </PopoverContent>
                      </Popover>
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                  <Switch id="is_public" name="is_public" checked={editedTrip.is_public || false} onCheckedChange={(checked) => handleSwitchChange(checked, 'is_public')} disabled={!isAdmin}/>
                  <Label htmlFor="is_public">Make Trip Public</Label>
              </div>
            </div>
            {isAdmin && (<Button onClick={handleSave} disabled={isSaving} className="mt-6">
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Changes"}
              </Button>)}
          </section>

          <Separator />

          {/* Member Management */}
          {isAdmin && (<section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5"/> Member Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Members List */}
                <div className="md:col-span-2">
                  <ScrollArea className="h-[300px] pr-4 border rounded-md">
                    <div className="p-4 space-y-4">
                      {members.length > 0 ? (members.map((member) => {
                var _a, _b;
                return (<div key={member.id} className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar_url || undefined}/>
                                <AvatarFallback>{((_a = member.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) || ((_b = member.email) === null || _b === void 0 ? void 0 : _b.charAt(0)) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name || member.email}</p>
                                <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                              </div>
                            </div>
                            {/* Add remove/role change options here if needed */}
                          </div>);
            })) : (<p className="text-muted-foreground text-center py-8">No members yet.</p>)}
                    </div>
                  </ScrollArea>
                </div>

                {/* Right Column: Invite & Splitwise */}
                <div className="space-y-6">
                  {/* Invite Members Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Invite Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input placeholder="Enter email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" aria-label="Invite member by email"/>
                        <Button onClick={handleInvite}>Invite</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Splitwise Integration - Refocused for Inviting Members */}
                  <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-primary-foreground">
                    <CardHeader>
                      <CardTitle className="text-lg">Invite from Splitwise</CardTitle>
                      <CardDescription className="text-blue-100">
                        {(trip === null || trip === void 0 ? void 0 : trip.splitwise_group_id)
                ? "Quickly invite members from your linked Splitwise group."
                : "Connect to Splitwise to invite members from your groups."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start gap-3">
                      {(trip === null || trip === void 0 ? void 0 : trip.splitwise_group_id) ? (<>  
                          <p className="text-sm">Invite members from your linked Splitwise group to this trip.</p>
                          {/* TODO: Implement Splitwise group selection & member invite flow */}
                          <Button variant="secondary" onClick={() => toast({ title: "Coming Soon!", description: "Inviting from Splitwise group feature is under development." })}>
                             Invite from Splitwise Group
                          </Button>
                        </>) : (<>
                          <p className="text-sm">Connect your Splitwise account first, then link this trip to invite members directly from your existing groups.</p>
                          <Button asChild variant="secondary">
                              {/* Link initiates the OAuth flow */}
                              <a href={API_ROUTES.SPLITWISE_AUTH(tripId)}>Connect to Splitwise</a>
                              <a href={API_ROUTES.SPLITWISE_AUTH(params.id)}>Connect to Splitwise</a>
                          </Button>
                        </>)}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>)}
          
          {isAdmin && <Separator />} 

          {/* Danger Zone */}
          {isAdmin && (<section>
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="destructive" size="sm">
                     <Trash2 className="h-4 w-4 mr-2"/>
                     Delete Trip
                   </Button>
                 </DialogTrigger>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Delete Trip</DialogTitle>
                     <DialogDescription>
                       Are you sure you want to delete this trip? This action cannot be undone.
                     </DialogDescription>
                   </DialogHeader>
                   <DialogFooter>
                     <Button variant="outline" onClick={() => { }}>Cancel</Button>
                     <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                       {isDeleting ? "Deleting..." : "Delete Trip"}
                     </Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
             </section>)}
        </CardContent>
      </Card>
    </div>);
}
