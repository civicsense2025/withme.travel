/**
 * GroupMemberList
 * 
 * A list of group members with filtering, roles, and actions.
 * 
 * @module groups/molecules
 */

'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  GroupMemberRole,
  GroupMemberStatus,
} from '../atoms';
import { 
  GroupMemberItem,
  GroupMemberActions,
  GroupMemberSearch,
} from '.';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupMember {
  /** Member's unique ID */
  id: string;
  /** Member's display name */
  name: string;
  /** Member's email address */
  email: string;
  /** Optional avatar URL */
  avatarUrl?: string;
  /** Member's role in the group */
  role: GroupMemberRole;
  /** Current membership status */
  status: GroupMemberStatus;
  /** When the member joined */
  joinedAt?: string;
  /** When the member was last active */
  lastActive?: string;
}

export interface GroupMemberListProps {
  /** Array of group members */
  members: GroupMember[];
  /** ID of the current user */
  currentUserId?: string;
  /** Whether the current user is an admin */
  isCurrentUserAdmin?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when invite button is clicked */
  onInvite?: () => void;
  /** Callback when a member is promoted */
  onPromote?: (memberId: string) => void;
  /** Callback when a member is demoted */
  onDemote?: (memberId: string) => void;
  /** Callback when a member is removed */
  onRemove?: (memberId: string) => void;
  /** Callback when an invite is resent */
  onResendInvite?: (memberId: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMemberList({
  members,
  currentUserId,
  isCurrentUserAdmin = false,
  className,
  onInvite,
  onPromote,
  onDemote,
  onRemove,
  onResendInvite,
}: GroupMemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  
  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  });

  // Get counts by status
  const statusCounts = {
    active: members.filter(m => m.status === 'active').length,
    invited: members.filter(m => m.status === 'invited').length,
    left: members.filter(m => m.status === 'left').length,
    removed: members.filter(m => m.status === 'removed').length,
  };

  const handleRemoveClick = (member: GroupMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const confirmRemove = () => {
    if (memberToRemove && onRemove) {
      onRemove(memberToRemove.id);
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with invite button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Members</h3>
          <p className="text-sm text-muted-foreground">
            {statusCounts.active} active · {statusCounts.invited} invited
          </p>
        </div>
        
        {isCurrentUserAdmin && onInvite && (
          <Button size="sm" onClick={onInvite}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite
          </Button>
        )}
      </div>
      
      {/* Search input */}
      <GroupMemberSearch 
        value={searchQuery}
        onChange={setSearchQuery}
      />
      
      {/* Members list */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <p className="text-center py-4 text-sm text-muted-foreground">
            No members match your search
          </p>
        ) : (
          filteredMembers.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const canModify = isCurrentUserAdmin && !isCurrentUser && member.role !== 'owner';
            
            return (
              <GroupMemberItem
                key={member.id}
                id={member.id}
                name={member.name}
                email={member.email}
                avatarUrl={member.avatarUrl}
                role={member.role}
                status={member.status}
                joinedAt={member.joinedAt}
                isCurrentUser={isCurrentUser}
                actions={
                  canModify ? (
                    <GroupMemberActions 
                      role={member.role}
                      memberId={member.id}
                      isInvited={member.status === 'invited'}
                      onPromote={onPromote}
                      onDemote={onDemote}
                      onRemove={() => handleRemoveClick(member)}
                      onResendInvite={onResendInvite}
                    />
                  ) : null
                }
              />
            );
          })
        )}
      </div>

      {/* Remove confirmation dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from this group?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 