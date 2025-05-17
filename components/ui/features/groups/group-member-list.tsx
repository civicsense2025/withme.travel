'use client';

import React, { useState } from 'react';
import { Search, MoreHorizontal, UserPlus, Mail, Star, Shield, UserMinus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/atoms/Avatar';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/molecules/DropdownMenu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/molecules/Dialog';
import { cn } from '@/lib/utils';

export type GroupMemberRole = 'admin' | 'member';
export type GroupMemberStatus = 'active' | 'invited' | 'left' | 'removed';

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt?: string;
  lastActive?: string;
}

export interface GroupMemberListProps {
  members: GroupMember[];
  currentUserId?: string;
  isCurrentUserAdmin?: boolean;
  className?: string;
  onInvite?: () => void;
  onPromote?: (memberId: string) => void;
  onDemote?: (memberId: string) => void;
  onRemove?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
}

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

  // Status badge styles
  const statusStyles = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    invited: 'bg-amber-100 text-amber-800 border-amber-200',
    left: 'bg-slate-100 text-slate-800 border-slate-200',
    removed: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  // Role badge styles
  const roleStyles = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    member: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const handleRemoveClick = (member: GroupMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const confirmRemove = () => {
    if (memberToRemove) {
      onRemove?.(memberToRemove.id);
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    
    // Simple implementation - in a real app, use a proper date library like date-fns
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
        
        {isCurrentUserAdmin && (
          <Button size="sm" onClick={onInvite}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite
          </Button>
        )}
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Members list */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <p className="text-center py-4 text-sm text-muted-foreground">
            No members match your search
          </p>
        ) : (
          filteredMembers.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const canModify = isCurrentUserAdmin && !isCurrentUser;
            
            return (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">
                        {member.name}
                        {isCurrentUser && <span className="ml-1.5 text-xs text-muted-foreground">(You)</span>}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge variant="outline" className={cn('text-xs border', roleStyles[member.role])}>
                        {member.role === 'admin' ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : null}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                      
                      <Badge variant="outline" className={cn('text-xs border', statusStyles[member.status])}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                      
                      {member.status === 'active' && member.lastActive && (
                        <span className="text-xs text-muted-foreground">
                          Active {formatTimeAgo(member.lastActive)}
                        </span>
                      )}
                      
                      {member.status === 'invited' && (
                        <span className="text-xs text-muted-foreground">
                          Invited {formatTimeAgo(member.joinedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions dropdown */}
                {canModify && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.status === 'invited' && (
                        <DropdownMenuItem onClick={() => onResendInvite?.(member.id)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend invite
                        </DropdownMenuItem>
                      )}
                      
                      {member.status === 'active' && member.role !== 'admin' && (
                        <DropdownMenuItem onClick={() => onPromote?.(member.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          Make admin
                        </DropdownMenuItem>
                      )}
                      
                      {member.status === 'active' && member.role === 'admin' && (
                        <DropdownMenuItem onClick={() => onDemote?.(member.id)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove admin
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => handleRemoveClick(member)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove from group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Remove confirmation dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from this group? 
              They will lose access to all group content and plans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="accent" className="bg-red-500 text-white hover:bg-red-600" onClick={confirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GroupMemberList; 