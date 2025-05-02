'use client';
import { TRIP_ROLES, PERMISSION_STATUSES } from '@/utils/constants/status';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { TripRole } from '@/utils/constants/database';

import { useState, useEffect } from 'react';
import {
  Mail,
  PlusCircle,
  Trash2,
  User,
  Check,
  X,
  UserPlus,
  Link2,
  Link2Off,
  RefreshCw,
  Loader2,
  ChevronDown,
  Import,
  Copy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Exported MemberProfile
export interface MemberProfile {
  id: string;
  name: string | null; // Allow name to be null
  avatar_url: string | null;
}

// Exported TripMemberFromSSR
export interface TripMemberFromSSR {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole; // Use the lowercase TripRole type from constants
  joined_at: string;
  profiles: MemberProfile | null; // Profiles can be null if join fails
}

interface MembersTabProps {
  tripId: string;
  canEdit?: boolean;
  userRole?: string | null;
  initialMembers?: TripMemberFromSSR[]; // Add prop for server-side fetched members
}

interface AccessRequest {
  id: string;
  user_id: string;
  user: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  message?: string;
  created_at: string;
}

export function MembersTab({
  tripId,
  canEdit = false,
  userRole = null,
  initialMembers = [],
}: MembersTabProps) {
  const [members, setMembers] = useState<TripMemberFromSSR[]>(initialMembers);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: TRIP_ROLES.VIEWER as TripRole,
  });
  const { toast } = useToast();
  const isAdmin = [TRIP_ROLES.ADMIN.toUpperCase(), TRIP_ROLES.EDITOR.toUpperCase()].includes(
    userRole?.toUpperCase() ?? ''
  );

  const [inviteLink, setInviteLink] = useState('');

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
          } else if (requestsResponse.status !== 404) {
            const errData = await requestsResponse.json();
            toast({
              title: 'Error',
              description: 'Error fetching access requests: ' + errData.error,
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          console.error('Error fetching access requests:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to fetch access requests',
            variant: 'destructive',
          });
        }
      }
    }

    fetchAccessRequests();
  }, [tripId, isAdmin, toast]); // Added toast dependency

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.role) {
      toast({
        title: 'Missing fields',
        description: 'Please provide email and role.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Add email validation

    try {
      // Using the dedicated invite route
      const response = await fetch(API_ROUTES.TRIP_MEMBER_INVITE(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitations: [{ email: newMember.email, role: newMember.role }] }), // Send as array
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific errors from the API if available
        throw new Error(result.error || result.message || 'Failed to send invitation');
      }

      // Assuming API returns the created invitation(s) or a success message
      // We don't immediately add to the members list as it requires user acceptance
      toast({ title: 'Invitation Sent', description: `Invitation sent to ${newMember.email}.` });

      setIsAddMemberOpen(false);
      setNewMember({ name: '', email: '', role: TRIP_ROLES.VIEWER }); // Reset form
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Invitation Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberToRemoveId: string) => {
    if (memberToRemoveId === 'YOUR_USER_ID') {
      // Replace with actual check for current user
      toast({
        title: 'Action Denied',
        description: 'You cannot remove yourself.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${memberToRemoveId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      // Optimistic update
      setMembers((prev) => prev.filter((member) => member.user_id !== memberToRemoveId));
      toast({ title: 'Member Removed' });
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleAccessRequest = async (requestId: string, approve: boolean) => {
    try {
      const response = await fetch(`${API_ROUTES.PERMISSION_REQUESTS(tripId)}/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approve ? PERMISSION_STATUSES.APPROVED : PERMISSION_STATUSES.REJECTED,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update access request');
      }

      const updatedRequest = await response.json();

      // Update local state
      setAccessRequests((prev) => prev.filter((req) => req.id !== requestId));

      // Add to members list if approved
      if (approve && updatedRequest.new_member) {
        // Transform the new_member data to match TripMemberFromSSR structure
        const newMemberSSR: TripMemberFromSSR = {
          id: updatedRequest.new_member.id, // Assuming API returns the trip_members record id
          trip_id: tripId,
          user_id: updatedRequest.new_member.user_id,
          role: updatedRequest.new_member.role,
          joined_at: updatedRequest.new_member.joined_at || new Date().toISOString(),
          profiles: {
            id: updatedRequest.new_member.user_id, // Assuming profile ID is user ID
            name: updatedRequest.user_profile?.name || 'Unknown',
            avatar_url: updatedRequest.user_profile?.avatar_url || null,
          },
        };
        setMembers((prev) => [...prev, newMemberSSR]);
        toast({ title: 'Access Approved', description: `User added to the trip.` });
      } else {
        toast({ title: `Access ${approve ? 'Approved' : 'Rejected'}` });
      }
    } catch (error: any) {
      console.error('Error handling access request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process access request',
        variant: 'destructive',
      });
    }
  };

  // Function to copy invite link
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast({ title: 'Link Copied', description: 'Invite link copied to clipboard.' });
      })
      .catch((err) => {
        console.error('Failed to copy invite link: ', err);
        toast({
          title: 'Copy Failed',
          description: 'Could not copy link to clipboard.',
          variant: 'destructive',
        });
      });
  };

  // Card for Existing Members
  const MembersListCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Trip Members</CardTitle>
        <CardDescription>Manage who has access to this trip.</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <ul className="space-y-4">
            {members.map((member) => (
              <li key={member.user_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback>{getInitials(member.profiles?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.name ?? 'User Profile Not Found'}
                    </p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {member.role}
                    </Badge>
                  </div>
                </div>
                {canEdit && ( // Assuming 'canEdit' determines if the current user can remove others
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">No members yet.</p>
        )}
      </CardContent>
      {canEdit && (
        <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsAddMemberOpen(true)} className="flex-1">
            <UserPlus className="mr-2 h-4 w-4" /> Invite New Member
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  // Card for Access Requests
  const AccessRequestsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Access Requests</CardTitle>
        <CardDescription>Approve or deny requests to join this trip.</CardDescription>
      </CardHeader>
      <CardContent>
        {accessRequests.length > 0 ? (
          <ul className="space-y-4">
            {accessRequests.map((req) => (
              <li
                key={req.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border p-3 rounded-md"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar>
                    <AvatarImage src={req.user.avatar_url ?? undefined} />
                    <AvatarFallback>{getInitials(req.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{req.user.name}</p>
                    <p className="text-sm text-muted-foreground">{req.user.email}</p>
                    {req.message && <p className="text-xs italic mt-1">"{req.message}"</p>}
                  </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAccessRequest(req.id, false)}
                    className="text-destructive hover:bg-destructive/10 border-destructive/50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAccessRequest(req.id, true)}
                    className="text-green-600 hover:bg-green-600/10 border-green-600/50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-center py-4">
            No pending access requests.
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Invite Link Card
  const InviteLinkCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Share Invite Link</CardTitle>
        <CardDescription>
          Anyone with this link can view the trip (if public) or request access.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Input value={inviteLink} readOnly className="flex-1 bg-muted" />
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          aria-label="Copy invite link"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 py-4">
      {canEdit && <InviteLinkCard />}
      <MembersListCard />
      {isAdmin && <AccessRequestsCard />}

      {/* Dialog for Adding New Member */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>Enter the email address and assign a role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="col-span-3"
                placeholder="member@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value as TripRole })}
              >
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TRIP_ROLES).map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
