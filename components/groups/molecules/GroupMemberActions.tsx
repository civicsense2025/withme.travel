/**
 * GroupMemberActions
 * 
 * Dropdown menu for actions that can be performed on a group member
 * 
 * @module groups/molecules
 */

'use client';

import React from 'react';
import { Shield, Star, UserMinus, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button, ButtonProps } from '@/components/ui/button';
import { GroupMemberRole } from '../atoms';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupMemberActionsProps {
  /** The member's current role */
  role: GroupMemberRole;
  /** The member's ID */
  memberId: string;
  /** Whether the member has the 'invited' status */
  isInvited?: boolean;
  /** Callback for promoting a member */
  onPromote?: (memberId: string) => void;
  /** Callback for demoting a member */
  onDemote?: (memberId: string) => void;
  /** Callback for removing a member */
  onRemove?: (memberId: string) => void;
  /** Callback for resending an invitation */
  onResendInvite?: (memberId: string) => void;
  /** Custom dropdown trigger button */
  triggerButton?: React.ReactNode;
  /** Props passed to the default trigger button */
  triggerButtonProps?: ButtonProps;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMemberActions({
  role,
  memberId,
  isInvited = false,
  onPromote,
  onDemote,
  onRemove,
  onResendInvite,
  triggerButton,
  triggerButtonProps,
}: GroupMemberActionsProps) {
  // Default trigger button with customizable props
  const defaultTrigger = (
    <Button variant="ghost" size="icon" {...triggerButtonProps}>
      <span className="sr-only">Open member actions menu</span>
      <svg 
        width="15" 
        height="15" 
        viewBox="0 0 15 15" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
      </svg>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerButton || defaultTrigger}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {/* Role management */}
        {role !== 'owner' && (
          <>
            {role !== 'admin' && onPromote && (
              <DropdownMenuItem onClick={() => onPromote(memberId)}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Make Admin</span>
              </DropdownMenuItem>
            )}
            
            {role === 'admin' && onDemote && (
              <DropdownMenuItem onClick={() => onDemote(memberId)}>
                <Shield className="mr-2 h-4 w-4 opacity-50" />
                <span>Remove Admin</span>
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Invite resend */}
        {isInvited && onResendInvite && (
          <DropdownMenuItem onClick={() => onResendInvite(memberId)}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Resend Invite</span>
          </DropdownMenuItem>
        )}

        {/* Remove option */}
        {onRemove && (
          <>
            {(onPromote || onDemote || onResendInvite) && <DropdownMenuSeparator />}
            <DropdownMenuItem 
              onClick={() => onRemove(memberId)}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              <span>Remove</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 