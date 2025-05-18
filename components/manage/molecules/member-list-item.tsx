/**
 * Member List Item (Molecule)
 *
 * Displays information about a member including their avatar, name,
 * role, status, and actions that can be performed on them.
 *
 * @module manage/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { MemberRoleBadge, MemberRole } from '../atoms/member-role-badge';
import { MemberStatusBadge, MemberStatus } from '../atoms/member-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserMinus, ShieldAlert, Mail, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt?: string;
  invitedBy?: string;
}

export interface MemberListItemProps {
  /** Member data to display */
  member: Member;
  /** Current user ID (to disable actions on own account) */
  currentUserId?: string;
  /** Whether the current user can manage this member */
  canManage?: boolean;
  /** Callback when remove is clicked */
  onRemove?: (member: Member) => void;
  /** Callback when change role is clicked */
  onChangeRole?: (member: Member, newRole: MemberRole) => void;
  /** Callback when resend invite is clicked */
  onResendInvite?: (member: Member) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * List of roles that a member can be changed to
 */
const AVAILABLE_ROLES: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberListItem({
  member,
  currentUserId,
  canManage = false,
  onRemove,
  onChangeRole,
  onResendInvite,
  className,
}: MemberListItemProps) {
  const isCurrentUser = currentUserId === member.id;
  const isActive = member.status === 'active';
  const isPending = member.status === 'pending' || member.status === 'invited';

  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Avatar className="h-9 w-9">
          <AvatarImage src={member.avatarUrl} alt={member.name} />
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>

        {/* User info */}
        <div>
          <div className="font-medium">{member.name}</div>
          {member.email && <div className="text-sm text-muted-foreground">{member.email}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Role badge */}
        <MemberRoleBadge role={member.role} />

        {/* Status badge */}
        {member.status !== 'active' && <MemberStatusBadge status={member.status} />}

        {/* Actions */}
        {canManage && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {/* Role change options */}
              {isActive && onChangeRole && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Change role</DropdownMenuLabel>
                  {AVAILABLE_ROLES.map((role) => (
                    <DropdownMenuItem
                      key={role.value}
                      onClick={() => onChangeRole(member, role.value)}
                      disabled={member.role === role.value}
                      className="flex items-center gap-2"
                    >
                      {member.role === role.value && <Check className="h-4 w-4" />}
                      <span>{role.label}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              <DropdownMenuSeparator />

              {/* Other actions based on status */}
              {isPending && onResendInvite && (
                <DropdownMenuItem
                  onClick={() => onResendInvite(member)}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Resend invitation</span>
                </DropdownMenuItem>
              )}

              {onRemove && (
                <DropdownMenuItem
                  onClick={() => onRemove(member)}
                  className="flex items-center gap-2 text-red-600"
                >
                  <UserMinus className="h-4 w-4" />
                  <span>{isActive ? 'Remove member' : 'Cancel invitation'}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
