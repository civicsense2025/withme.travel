/**
 * Member Management (Organism)
 *
 * A comprehensive component for managing members in a trip or group.
 * Handles displaying a list of members, inviting new members, and
 * performing actions like removing members or changing roles.
 *
 * @module manage/organisms
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MemberListItem, Member } from '../molecules/member-list-item';
import { MemberRole } from '../atoms/member-role-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Mail } from 'lucide-react';
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

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface MemberManagementProps {
  /** List of members to display */
  members: Member[];
  /** ID of the current user (to prevent actions on self) */
  currentUserId: string;
  /** Role of the current user, determines permissions */
  currentUserRole: MemberRole;
  /** ID of the entity (trip or group) */
  entityId: string;
  /** Type of entity */
  entityType: 'trip' | 'group';
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Callback when a member is removed */
  onRemoveMember?: (memberId: string) => Promise<void>;
  /** Callback when a member's role is changed */
  onChangeMemberRole?: (memberId: string, newRole: MemberRole) => Promise<void>;
  /** Callback when an invitation is resent */
  onResendInvite?: (memberId: string) => Promise<void>;
  /** Callback when a new member is invited */
  onInviteMember?: (email: string, role?: MemberRole) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if the current user has sufficient permissions
 */
function canManageMembers(currentUserRole: MemberRole): boolean {
  return ['owner', 'admin'].includes(currentUserRole);
}

/**
 * Check if the current user can change roles
 */
function canChangeRoles(currentUserRole: MemberRole): boolean {
  return currentUserRole === 'owner';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberManagement({
  members,
  currentUserId,
  currentUserRole,
  entityId,
  entityType,
  isLoading = false,
  onRemoveMember,
  onChangeMemberRole,
  onResendInvite,
  onInviteMember,
  className,
}: MemberManagementProps) {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Derived state
  const hasManagePermission = canManageMembers(currentUserRole);
  const hasRoleChangePermission = canChangeRoles(currentUserRole);

  // Filter members based on search query
  const filteredMembers = searchQuery
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : members;

  // Handle member actions
  const handleRemoveMember = async (member: Member) => {
    if (onRemoveMember) {
      await onRemoveMember(member.id);
    }
  };

  const handleChangeRole = async (member: Member, newRole: MemberRole) => {
    if (onChangeMemberRole) {
      await onChangeMemberRole(member.id, newRole);
    }
  };

  const handleResendInvite = async (member: Member) => {
    if (onResendInvite) {
      await onResendInvite(member.id);
    }
  };

  // Handle inviting a new member
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !onInviteMember) return;

    try {
      setIsInviting(true);
      await onInviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with search and invite */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {hasManagePermission && onInviteMember && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add someone to this {entityType}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  >
                    <option value="member">Member</option>
                    <option value="editor">Editor</option>
                    {hasRoleChangePermission && <option value="admin">Admin</option>}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="gap-1"
                >
                  {isInviting && <Mail className="h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Member list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading members...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'No members found' : 'No members yet'}
        </div>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4 divide-y">
            {filteredMembers.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                canManage={hasManagePermission}
                onRemove={onRemoveMember ? handleRemoveMember : undefined}
                onChangeRole={
                  hasRoleChangePermission && onChangeMemberRole ? handleChangeRole : undefined
                }
                onResendInvite={onResendInvite ? handleResendInvite : undefined}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
