'use client';

import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Users,
  Share2,
  Trash2,
  Globe2,
  MapPin,
  CalendarIcon,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TRIP_ROLES } from '@/utils/constants/status';
import { AuthContextType } from '@/components/auth-provider';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Trip } from '@/types/trip';
import { Database } from '@/types/supabase';
import { PlaylistEmbed } from '@/components/trips/PlaylistEmbed';
import { FIELDS } from "@/utils/constants/database";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | undefined;
}

interface Member {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | undefined;
  role: string;
}

interface PageProps {}

interface LoadingProps {
  isLoading: boolean;
}

export default function ManageTripPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params?.tripId;
  const { user, isLoading: authLoading } = useAuth() as AuthContextType;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editedTrip, setEditedTrip] = useState<Partial<Trip>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [playlistUrl, setPlaylistUrl] = useState<string | null | undefined>(undefined);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(API_ROUTES.AUTH_CHECK);
      const data = await response.json();

      if (!data.user) {
        router.push('/auth/signin');
        return;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/signin');
    } finally {
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
    if (!user || !tripId) return;

    async function fetchTripData() {
      try {
        setIsLoading(true);

        // Fetch trip details
        const tripResponse = await fetch(API_ROUTES.TRIP_DETAILS(tripId));
        if (!tripResponse.ok) {
          if (tripResponse.status === 403) {
            toast({
              title: 'Access denied',
              description: "You don't have permission to manage this trip",
              variant: 'destructive',
            });
            router.push(PAGE_ROUTES.TRIP_DETAILS(tripId));
            return;
          }
          throw new Error('Failed to fetch trip');
        }
        const tripData = await tripResponse.json();
        const fetchedTrip = tripData.trip as Trip;
        setTrip(fetchedTrip);
        setEditedTrip({
          name: fetchedTrip.name,
          description: fetchedTrip.description,
          is_public: fetchedTrip.is_public,
          cover_image_url: fetchedTrip.cover_image_url,
          // Add other editable fields here if needed
        }); // Only initialize editable fields
        setPlaylistUrl(fetchedTrip.playlist_url); // Set playlist URL state

        // Fetch members
        const membersResponse = await fetch(API_ROUTES.TRIP_MEMBERS(tripId));
        if (!membersResponse.ok) throw new Error('Failed to fetch members');
        const membersData = await membersResponse.json();
        setMembers(membersData.members);

        // Check user role
        const currentMember = membersData.members.find((m: Member) => m.email === user?.email);
        setIsAdmin(
          currentMember?.role === TRIP_ROLES.ADMIN || currentMember?.role === TRIP_ROLES.EDITOR
        );

        // --- Add these logs ---
        console.log('User Email:', user?.email);
        console.log('All Members:', membersData.members);
        console.log('Current Member Found:', currentMember);
        console.log('Current Member Role:', currentMember?.role);
        console.log('Comparing against ADMIN:', TRIP_ROLES.ADMIN); // Should log 'admin'
        console.log('Comparing against EDITOR:', TRIP_ROLES.EDITOR); // Should log 'editor'
        // --- End of logs ---

        if (fetchedTrip.start_date) {
          setStartDate(new Date(fetchedTrip.start_date));
        }
        if (fetchedTrip.end_date) {
          setEndDate(new Date(fetchedTrip.end_date));
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load trip data',
          variant: 'destructive',
        });
        router.push(PAGE_ROUTES.TRIP_DETAILS(tripId));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTripData();
  }, [user, tripId, toast, router]);

  const handleSave = async () => {
    if (!trip || !tripId) return;

    setIsSaving(true);
    try {
      // Construct payload with only changed fields
      const updatePayload: Partial<Database['public']['Tables']['trips']['Update']> = {};

      if (editedTrip.name !== trip.name) {
        updatePayload.name = editedTrip.name;
      }
      if (editedTrip.description !== trip.description) {
        updatePayload.description = editedTrip.description;
      }
      if (editedTrip.is_public !== trip.is_public) {
        updatePayload.is_public = editedTrip.is_public;
      }
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : null;
      if (formattedStartDate !== trip.start_date) {
        updatePayload.start_date = formattedStartDate;
      }
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : null;
      if (formattedEndDate !== trip.end_date) {
        updatePayload.end_date = formattedEndDate;
      }
      // Add playlist_url check
      if (playlistUrl !== trip.playlist_url) {
        // Handle empty string case: set to null if empty
        updatePayload.playlist_url = playlistUrl?.trim() ? playlistUrl.trim() : null;
      }

      // Check if any changes were actually made
      if (Object.keys(updatePayload).length === 0) {
        toast({ title: 'No changes', description: 'No modifications detected.' });
        setIsSaving(false);
        return;
      }

      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update trip:', errorData);
        throw new Error(errorData.error || 'Failed to update trip');
      }

      const updatedTripData = await response.json();
      const updatedTrip = updatedTripData.trip as Trip;
      // Update local state after successful save
      setTrip(updatedTrip);
      setEditedTrip({
        name: updatedTrip.name,
        description: updatedTrip.description,
        is_public: updatedTrip.is_public,
        cover_image_url: updatedTrip.cover_image_url,
      });
      setPlaylistUrl(updatedTrip.playlist_url);
      if (updatedTrip.start_date) setStartDate(new Date(updatedTrip.start_date));
      if (updatedTrip.end_date) setEndDate(new Date(updatedTrip.end_date));

      toast({
        title: 'Changes saved',
        description: 'Trip details have been updated',
      });
    } catch (error: any) {
      console.error('Error saving trip:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !trip || !tripId) return;
    if (!isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only trip admins can delete a trip.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete trip');
      }

      toast({ title: 'Trip Deleted', description: `Successfully deleted trip: ${trip.name}` });
      router.push(PAGE_ROUTES.TRIPS);
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      toast({
        title: 'Error Deleting Trip',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInvite = async () => {
    if (!tripId || !inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_ROUTES.TRIP_MEMBER_INVITE(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      toast({
        title: 'Invitation sent',
        description: `Invitation email sent to ${inviteEmail}`,
      });
      setInviteEmail('');

      // Refresh members list
      const membersResponse = await fetch(API_ROUTES.TRIP_MEMBERS(tripId));
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  // Helper function to handle input changes for editedTrip state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTrip((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to handle switch changes
  const handleSwitchChange = (checked: boolean, name: keyof Trip) => {
    setEditedTrip((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePlaylistUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistUrl(e.target.value);
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
    avatar_url: undefined, // Cannot reliably get avatar from user object here
  };

  const LoadingState = ({ isLoading }: LoadingProps) => {
    if (isLoading) {
      return (
        <div className="container max-w-5xl py-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <LoadingState isLoading={isLoading} />;
  }

  if (!trip) {
    return (
      <div className="container max-w-5xl py-6">
        <div className="flex items-center mb-6">
          {tripId && (
            <Link href={`/trips/${tripId}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                back to trip
              </Button>
            </Link>
          )}
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Trip Not Found</h2>
          <p className="text-muted-foreground mt-2">
            This trip doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-4" onClick={() => router.push('/trips')}>
            View All Trips
          </Button>
        </div>
      </div>
    );
  }

  // Replace the destinations property access with destination_name
  // Handle destination name access carefully
  const destinationName = trip.destination_name || 'Unknown Destination';

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trip
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
              <Settings className="mr-2 h-5 w-5" /> General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editedTrip.name || ''}
                  onChange={handleInputChange}
                  disabled={!isAdmin}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                        disabled={!isAdmin}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                        disabled={!isAdmin}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => (startDate ? date < startDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  name="is_public"
                  checked={editedTrip.is_public || false}
                  onCheckedChange={(checked) => handleSwitchChange(checked, 'is_public')}
                  disabled={!isAdmin}
                />
                <Label htmlFor="is_public">Make Trip Public</Label>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={handleSave} disabled={isSaving} className="mt-6">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            )}
          </section>

          <Separator />

          {/* Member Management */}
          {isAdmin && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5" /> Member Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Members List */}
                <div className="md:col-span-2">
                  <ScrollArea className="h-[300px] pr-4 border rounded-md">
                    <div className="p-4 space-y-4">
                      {members.length > 0 ? (
                        members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar_url || undefined} />
                                <AvatarFallback>
                                  {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name || member.email}</p>
                                <Badge variant="secondary" className="capitalize">
                                  {member.role}
                                </Badge>
                              </div>
                            </div>
                            {/* Add remove/role change options here if needed */}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No members yet.</p>
                      )}
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
                        <Input
                          placeholder="Enter email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          type="email"
                          aria-label="Invite member by email"
                        />
                        <Button onClick={handleInvite}>Invite</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {isAdmin && <Separator />}

          {/* Playlist Card - Added */}
          <Card>
            <CardHeader>
              <CardTitle>Playlist</CardTitle>
              <CardDescription>Embed a Spotify or Tidal playlist for your trip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playlistUrl">Playlist URL</Label>
                <Input
                  id="playlistUrl"
                  name="playlistUrl"
                  type="url"
                  placeholder="https://open.spotify.com/playlist/... or https://tidal.com/browse/playlist/..."
                  value={playlistUrl ?? ''}
                  onChange={handlePlaylistUrlChange}
                  disabled={!isAdmin || isSaving}
                />
              </div>
              <div className="pt-2">
                {playlistUrl && <PlaylistEmbed url={playlistUrl} width="100%" height={150} />}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isAdmin && (
            <section>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
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
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Delete Trip'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
