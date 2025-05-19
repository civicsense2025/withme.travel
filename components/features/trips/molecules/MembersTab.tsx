'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TRIP_ROLES, GROUP_MEMBER_ROLES, PERMISSION_STATUSES } from '@/utils/constants/status';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Mail,
  PlusCircle,
  Trash2,
  User,
  Check,
  X,
  UserPlus,
  Link2,
  Copy,
  MoreVertical,
  Smile,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Define all possible trip roles from the constants
type TripRole = typeof TRIP_ROLES[keyof typeof TRIP_ROLES];
type GroupMemberRole = typeof GROUP_MEMBER_ROLES[keyof typeof GROUP_MEMBER_ROLES];
type PermissionStatus = typeof PERMISSION_STATUSES[keyof typeof PERMISSION_STATUSES];

// Member profile as received from the server
export interface MemberProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

// Trip member as received from server-side rendering
export interface TripMemberFromSSR {
  id: string;
  trip_id: string;
  user_id: string;
  role: GroupMemberRole;
  joined_at: string;
  profiles: MemberProfile | null;
}

// Enhanced member with client-side additions
export interface EnhancedMember extends TripMemberFromSSR {
  flair?: string;
  isLoading?: boolean;
}

// Access request structure
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
  status?: PermissionStatus;
}

// API response types for type safety
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface InvitationResponse extends ApiResponse<{
  invitations: Array<{ email: string; status: string }>;
}> {}

interface AccessRequestResponse extends ApiResponse<{
  new_member?: Partial<TripMemberFromSSR>;
  user_profile?: MemberProfile;
}> {}

// Form state for new member invitation
interface NewMemberForm {
  name: string;
  email: string;
  role: TripRole;
}

// State for flair dialog
interface FlairDialogState {
  open: boolean;
  memberId: string | null;
}

// Main component props
interface MembersTabProps {
  tripId: string;
  canEdit?: boolean;
  userRole?: string | null;
  initialMembers?: TripMemberFromSSR[];
  currentUserId?: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely extracts initials from a name string
 */
function getInitials(name?: string | null): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part?.[0] || '')
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Checks if a user has admin or editor privileges
 */
function isAdminOrEditor(role?: string | null): boolean {
  if (!role) return false;
  const upperRole = role.toUpperCase();
  return [
    TRIP_ROLES.ADMIN.toUpperCase(), 
    TRIP_ROLES.EDITOR.toUpperCase()
  ].includes(upperRole);
}

/**
 * Validates an email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MembersTab({
  tripId,
  canEdit = false,
  userRole = null,
  initialMembers = [],
  currentUserId = null,
}: MembersTabProps) {
  const { toast } = useToast();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Core state
  const [members, setMembers] = useState<EnhancedMember[]>(initialMembers);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    accessRequests: false,
    members: false,
  });
  
  // UI state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: '',
    email: '',
    role: TRIP_ROLES.VIEWER as TripRole,
  });
  const [flairDialog, setFlairDialog] = useState<FlairDialogState>({
    open: false,
    memberId: null,
  });
  const [flairInput, setFlairInput] = useState('');
  
  // Derived state
  const isAdmin = useMemo(() => isAdminOrEditor(userRole), [userRole]);
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  /**
   * Fetches access requests for the trip
   */
  const fetchAccessRequests = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoading(prev => ({ ...prev, accessRequests: true }));
    
    try {
      const response = await fetch(API_ROUTES.TRIP_ACCESS_REQUEST(tripId));
      
      if (!response.ok) {
        if (response.status !== 404) { // 404 is expected when no requests exist
          const errData = await response.json();
          throw new Error(errData?.error || 'Failed to fetch access requests');
        }
        return; // No requests, just return
      }
      
      const data = await response.json();
      setAccessRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to fetch access requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, accessRequests: false }));
    }
  }, [tripId, isAdmin, toast]);
  
  // Effect to generate invite link client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}${PAGE_ROUTES.TRIP_INVITE(tripId)}`);
    }
  }, [tripId]);
  
  // Fetch access requests on component mount
  useEffect(() => {
    fetchAccessRequests();
  }, [fetchAccessRequests]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles inviting a new member to the trip
   */
  const handleAddMember = async () => {
    // Form validation
    if (!newMember.email) {
      toast({
        title: 'Missing email',
        description: 'Please provide an email address.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isValidEmail(newMember.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please provide a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newMember.role) {
      toast({
        title: 'Missing role',
        description: 'Please select a role for the new member.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Send invitation
      const response = await fetch(API_ROUTES.TRIP_MEMBER_INVITE(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invitations: [{ 
            email: newMember.email, 
            role: newMember.role 
          }] 
        }),
      });
      
      const result = await response.json() as InvitationResponse;
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to send invitation');
      }
      
      toast({ 
        title: 'Invitation Sent', 
        description: `Invitation sent to ${newMember.email}.` 
      });
      
      // Reset form
      setIsAddMemberOpen(false);
      setNewMember({ 
        name: '', 
        email: '', 
        role: TRIP_ROLES.VIEWER as TripRole 
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Invitation Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Handles removing a member from the trip
   */
  const handleRemoveMember = async (memberToRemoveId: string) => {
    // Safety check - don't remove self
    if (memberToRemoveId === currentUserId) {
      toast({
        title: 'Action Denied',
        description: 'You cannot remove yourself.',
        variant: 'destructive',
      });
      return;
    }
    
    // Set loading state for this member
    setMembers(prev => 
      prev.map(m => m.user_id === memberToRemoveId 
        ? { ...m, isLoading: true } 
        : m
      )
    );
    
    try {
      const response = await fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${memberToRemoveId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }
      
      // Update members list (remove the member)
      setMembers(prev => prev.filter(member => member.user_id !== memberToRemoveId));
      
      toast({ title: 'Member Removed' });
    } catch (error) {
      console.error('Error removing member:', error);
      
      // Reset loading state on error
      setMembers(prev => 
        prev.map(m => m.user_id === memberToRemoveId 
          ? { ...m, isLoading: false } 
          : m
        )
      );
      
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Handles approving or rejecting an access request
   */
  const handleAccessRequest = async (requestId: string, approve: boolean) => {
    // Set loading state for this request
    setAccessRequests(prev => 
      prev.map(req => req.id === requestId 
        ? { ...req, status: 'processing' as PermissionStatus } 
        : req
      )
    );
    
    try {
      const response = await fetch(`${API_ROUTES.TRIP_ACCESS_REQUEST(tripId)}/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approve ? PERMISSION_STATUSES.ACCEPTED : PERMISSION_STATUSES.REJECTED,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update access request');
      }
      
      const updatedRequest = await response.json() as AccessRequestResponse;
      
      // Remove from access requests list
      setAccessRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Add to members list if approved
      if (approve && updatedRequest.data?.new_member) {
        const { new_member, user_profile } = updatedRequest.data;
        
        // Only add if we have sufficient data
        if (new_member.user_id) {
          const newMemberSSR: TripMemberFromSSR = {
            id: new_member.id || `temp-${Date.now()}`,
            trip_id: tripId,
            user_id: new_member.user_id,
            role: (new_member.role as GroupMemberRole) || TRIP_ROLES.VIEWER as GroupMemberRole,
            joined_at: new_member.joined_at || new Date().toISOString(),
            profiles: user_profile || {
              id: new_member.user_id,
              name: 'Unknown',
              avatar_url: null,
            },
          };
          
          setMembers(prev => [...prev, newMemberSSR]);
          toast({ 
            title: 'Access Approved', 
            description: `User added to the trip.` 
          });
        }
      } else {
        toast({ 
          title: `Access ${approve ? 'Approved' : 'Rejected'}` 
        });
      }
    } catch (error) {
      console.error('Error handling access request:', error);
      
      // Reset status on error
      setAccessRequests(prev => 
        prev.map(req => req.id === requestId 
          ? { ...req, status: undefined } 
          : req
        )
      );
      
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to process access request',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Copies the invite link to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast({ 
          title: 'Link Copied', 
          description: 'Invite link copied to clipboard.' 
        });
      })
      .catch(err => {
        console.error('Failed to copy invite link: ', err);
        toast({
          title: 'Copy Failed',
          description: 'Could not copy link to clipboard.',
          variant: 'destructive',
        });
      });
  };
  
  /**
   * Handles changing a member's flair
   */
  const handleChangeFlair = (memberId: string, newFlair: string) => {
    if (!memberId) return;
    
    setMembers(prev => 
      prev.map(m => m.user_id === memberId 
        ? { ...m, flair: newFlair } 
        : m
      )
    );
    
    setFlairDialog({ open: false, memberId: null });
    setFlairInput('');
    
    toast({ 
      title: 'Flair Updated', 
      description: 'Member flair updated!' 
    });
  };
  
  /**
   * Handles making a member a co-planner (admin)
   */
  const handleMakeCoPlanner = async (memberId: string) => {
    if (!memberId) return;
    
    // Set loading state for this member
    setMembers(prev => 
      prev.map(m => m.user_id === memberId 
        ? { ...m, isLoading: true } 
        : m
      )
    );
    
    try {
      // TODO: Replace with actual API call
      // Simulating API call for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMembers(prev =>
        prev.map(m => m.user_id === memberId 
          ? { ...m, role: GROUP_MEMBER_ROLES.ADMIN, isLoading: false } 
          : m
        )
      );
      
      toast({ 
        title: 'Role Updated', 
        description: 'Member is now a Co-Planner.' 
      });
    } catch (error) {
      console.error('Error updating role:', error);
      
      // Reset loading state on error
      setMembers(prev => 
        prev.map(m => m.user_id === memberId 
          ? { ...m, isLoading: false } 
          : m
        )
      );
      
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to update role',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Handles transferring ownership of the trip
   */
  const handleTransferOwnership = async (memberId: string) => {
    if (!memberId) return;
    
    // Set loading state for this member
    setMembers(prev => 
      prev.map(m => m.user_id === memberId 
        ? { ...m, isLoading: true } 
        : m
      )
    );
    
    try {
      // TODO: Replace with actual API call
      // Simulating API call for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find current owner and new owner
      const currentOwner = members.find(m => m.role === GROUP_MEMBER_ROLES.ADMIN);
      
      if (!currentOwner) {
        throw new Error('Could not identify current owner');
      }
      
      // Update roles
      setMembers(prev => 
        prev.map(m => {
          if (m.user_id === memberId) {
            return { ...m, role: GROUP_MEMBER_ROLES.ADMIN, isLoading: false };
          } else if (m.user_id === currentOwner.user_id) {
            return { ...m, role: GROUP_MEMBER_ROLES.ADMIN };
          }
          return m;
        })
      );
      
      toast({
        title: 'Ownership Transferred',
        description: 'Ownership transferred. Please refresh.',
      });
      
      // Force refresh after a brief delay
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      
      // Reset loading state on error
      setMembers(prev => 
        prev.map(m => m.user_id === memberId 
          ? { ...m, isLoading: false } 
          : m
        )
      );
      
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to transfer ownership',
        variant: 'destructive',
      });
    }
  };
  
  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================
  
  /**
   * Card for Existing Members
   */
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
              <li key={member.user_id} className="flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.profiles?.avatar_url ?? undefined} alt={member.profiles?.name || 'Member'} />
                    <AvatarFallback>{getInitials(member.profiles?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {member.profiles?.name ?? 'User Profile Not Found'}
                      {member.flair && <span className="ml-1 text-lg">{member.flair}</span>}
                    </p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {member.role}
                    </Badge>
                  </div>
                </div>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={!!member.isLoading}
                      >
                        {member.isLoading ? (
                          <span className="h-4 w-4 animate-spin">⟳</span>
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== GROUP_MEMBER_ROLES.ADMIN && (
                        <DropdownMenuItem onClick={() => handleRemoveMember(member.user_id)}>
                          Remove from group
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setFlairDialog({ open: true, memberId: member.user_id })}
                      >
                        Change flair
                      </DropdownMenuItem>
                      {member.role !== GROUP_MEMBER_ROLES.ADMIN &&
                        member.role !== GROUP_MEMBER_ROLES.MEMBER && (
                          <DropdownMenuItem onClick={() => handleMakeCoPlanner(member.user_id)}>
                            Make Co-Planner
                          </DropdownMenuItem>
                        )}
                      {member.role !== GROUP_MEMBER_ROLES.ADMIN && (
                        <DropdownMenuItem onClick={() => handleTransferOwnership(member.user_id)}>
                          Transfer Ownership
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
  
  /**
   * Card for Access Requests
   */
  const AccessRequestsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Access Requests</CardTitle>
        <CardDescription>Approve or deny requests to join this trip.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading.accessRequests ? (
          <div className="flex justify-center py-4">
            <span className="animate-spin text-2xl">⟳</span>
          </div>
        ) : accessRequests.length > 0 ? (
          <ul className="space-y-4">
            {accessRequests.map((req) => (
              <li
                key={req.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border p-3 rounded-md"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar>
                    <AvatarImage src={req.user.avatar_url ?? undefined} alt={req.user.name} />
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
                    disabled={req.status === 'pending'}
                  >
                    {req.status === 'pending' ? (
                      <span className="h-4 w-4 animate-spin">⟳</span>
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAccessRequest(req.id, true)}
                    className="text-green-600 hover:bg-green-600/10 border-green-600/50"
                    disabled={req.status === 'pending'}
                  >
                    {req.status === 'pending' ? (
                      <span className="h-4 w-4 animate-spin">⟳</span>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
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
  
  /**
   * Card for Invite Link
   */
  const InviteLinkCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Share Invite Link</CardTitle>
        <CardDescription>
          Anyone with this link can view the trip (if public) or request access.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Input 
          value={inviteLink} 
          readOnly 
          className="flex-1 bg-muted" 
          aria-label="Trip invite link"
        />
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
  
  /**
   * Dialog for changing member flair
   */
  const FlairDialog = () => (
    <Dialog
      open={flairDialog.open}
      onOpenChange={(open) =>
        setFlairDialog({ open, memberId: open ? flairDialog.memberId : null })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Flair</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Input
            placeholder="Enter emoji (e.g. 🌟)"
            value={flairInput}
            onChange={(e) => setFlairInput(e.target.value)}
            maxLength={2}
            className="text-2xl text-center w-24"
          />
          <Button
            onClick={() =>
              flairDialog.memberId && handleChangeFlair(flairDialog.memberId, flairInput)
            }
          >
            Update Flair
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setFlairDialog({ open: false, memberId: null })}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  /**
   * Dialog for adding a new member
   */
  const AddMemberDialog = () => (
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
              onValueChange={(value) =>
                setNewMember({ ...newMember, role: value as TripRole })
              }
            >
              <SelectTrigger id="role" className="col-span-3">
                <SelectValue>Select role</SelectValue>
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
  );
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6 py-4">
      {canEdit && <InviteLinkCard />}
      <MembersListCard />
      {isAdmin && <AccessRequestsCard />}
      
      {/* Dialogs */}
      <FlairDialog />
      <AddMemberDialog />
    </div>
  );
}