/**
 * GroupMembersConnected Component (Organism)
 * 
 * A connected version of the group members UI that fetches and manages
 * group member data from the API.
 *
 * @module groups/organisms
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGroupMembers } from '@/lib/features/groups/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/DropdownMenu';
import { Search, UserPlus, MoreVertical, UserMinus, Shield, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupMembersConnectedProps {
  /** ID of the group */
  groupId: string;
  /** Whether the current user is an admin */
  isAdmin?: boolean;
  /** Current user ID */
  currentUserId?: string;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMembersConnected({
  groupId,
  isAdmin = false,
  currentUserId = '',
  className = '',
}: GroupMembersConnectedProps) {
  const { members, loading, error, fetchMembers, inviteMember, removeMember, updateMemberRole } = useGroupMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  // Fetch members on mount
  useEffect(() => {
    if (groupId) {
      fetchMembers(groupId).catch(err => {
        console.error('Error fetching members:', err);
      });
    }
  }, [groupId, fetchMembers]);

  // Filtered members based on search
  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleInviteMember = useCallback(async () => {
    if (!inviteEmail.trim()) {
      toast({
        children: (
          <>
            <div className="font-bold">Email required</div>
            <div>Please enter an email address to invite</div>
          </>
        ),
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      const result = await inviteMember(groupId, inviteEmail, inviteRole);
      if (result.success) {
        toast({
          children: (
            <>
              <div className="font-bold">Invitation sent</div>
              <div>Invitation sent to {inviteEmail}</div>
            </>
          ),
          variant: "default"
        });
        setInviteDialogOpen(false);
        setInviteEmail('');
        // Refresh members list
        fetchMembers(groupId);
      } else {
        toast({
          children: (
            <>
              <div className="font-bold">Failed to send invitation</div>
              <div>{result.error || "An error occurred"}</div>
            </>
          ),
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error inviting member:', err);
      toast({
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>An unexpected error occurred</div>
          </>
        ),
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  }, [groupId, inviteEmail, inviteRole, inviteMember, toast, fetchMembers]);

  const handleRemoveMember = useCallback(async (memberId: string, memberName: string = 'this member') => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      return;
    }

    try {
      const result = await removeMember(groupId, memberId);
      if (result.success) {
        toast({
            children: (
            <>
              <div className="font-bold">Member removed</div>
              <div>{memberName} has been removed from the group</div>
            </>
          ),
          variant: "default"
        });
        // Refresh members list
        fetchMembers(groupId);
      } else {
        toast({
          children: (
            <>
              <div className="font-bold">Failed to remove member</div>
              <div>{result.error || "An error occurred"}</div>
            </>
          ),
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error removing member:', err);
      toast({
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>An unexpected error occurred</div>
          </>
        ),
        variant: "destructive"
      }); 
    }
  }, [groupId, removeMember, toast, fetchMembers]);

  const handleUpdateRole = useCallback(async (memberId: string, role: string, memberName: string = 'this member') => {
    try {
      const result = await updateMemberRole(groupId, memberId, role);
      if (result.success) {
        toast({
          children: (
            <>
              <div className="font-bold">Role updated</div>
              <div>{memberName}'s role has been updated to {role}</div>
            </>
          ),
          variant: "default"
        });
        // Refresh members list
        fetchMembers(groupId);
      } else {
        toast({
          children: (
            <>
              <div className="font-bold">Failed to update role</div>
              <div>{result.error || "An error occurred"}</div>
            </>
          ),
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>An unexpected error occurred</div>
          </>
        ),
        variant: "destructive"
      });
    }
  }, [groupId, updateMemberRole, toast, fetchMembers]);

  // Error state
  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  // Loading state
  if (loading && members.length === 0) {
    return <div className="p-4 text-muted-foreground">Loading members...</div>;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Group Members</h3>
        {isAdmin && (
          <Button onClick={() => setInviteDialogOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Invite
          </Button>
        )}
      </div>

      {/* Search input */}
      <div className="mb-4 relative">
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Members list */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-2">
          {filteredMembers.map(member => (
            <Card key={member.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  {member.avatarUrl ? (
                    <AvatarImage src={member.avatarUrl} alt={member.name || 'Member'} />
                  ) : null}
                  <AvatarFallback>
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name || 'Unnamed Member'}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
                <div className="ml-2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  {member.role}
                </div>
              </div>

              {/* Actions for admins */}
              {isAdmin && member.user_id !== currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleUpdateRole(member.id, 'admin', member.name)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUpdateRole(member.id, 'member', member.name)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {searchQuery ? 'No members match your search' : 'No members yet'}
        </div>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a new member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 