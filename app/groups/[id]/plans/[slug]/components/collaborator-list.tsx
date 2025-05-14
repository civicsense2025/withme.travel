'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserPresenceInfo } from '../context/ideas-presence-context';
import { timeAgo } from '../utils/date-utils';
import { GitFork, Clock, Edit, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CollaboratorListProps {
  open: boolean;
  onClose: () => void;
  activeUsers: UserPresenceInfo[];
  currentUserId: string;
}

export function CollaboratorList({
  open,
  onClose,
  activeUsers,
  currentUserId,
}: CollaboratorListProps) {
  // Sort users by online status and name
  const sortedUsers = [...activeUsers].sort((a, b) => {
    // Current user always first
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;

    // Then sort by status (online first)
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;

    // Finally sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-[350px] sm:w-[450px] overflow-y-auto p-5" side="right">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            Collaborators
          </SheetTitle>
          <SheetDescription>See who's currently working on the whiteboard</SheetDescription>
        </SheetHeader>

        {sortedUsers.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GitFork className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No one else is here</h3>
            <p className="max-w-xs">
              You're the only one working on this board right now. Invite others to collaborate in
              real-time!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2 px-2">
              <span>
                {sortedUsers.length} collaborator{sortedUsers.length !== 1 ? 's' : ''}
              </span>
              <span>Status</span>
            </div>

            <div className="space-y-3">
              {sortedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <UserItem user={user} isCurrentUser={user.id === currentUserId} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Helper to get initials from name
function getInitials(name: string | undefined): string {
  if (name) {
    return name
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  return 'U';
}

function UserItem({ user, isCurrentUser }: { user: UserPresenceInfo; isCurrentUser: boolean }) {
  // Generate a consistent color for the user
  const getUserColor = () => {
    // List of gradient colors for user cards
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
    ];

    // Simple hash function for user ID
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = (hash << 5) - hash + user.id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    // Use the absolute value of hash to get a positive number
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const gradient = getUserColor();
  const isEditing = !!user.editing_idea_id;
  const isOnline = user.status === 'online';

  return (
    <motion.div
      className={`rounded-lg p-4 shadow-md border-2 overflow-hidden ${isCurrentUser ? 'border-blue-400' : 'border-gray-200'}`}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`relative rounded-full p-0.5 bg-gradient-to-r ${gradient}`}>
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />
              <AvatarFallback className="text-sm font-bold bg-white text-gray-800">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            )}
          </div>

          <div>
            <div className="font-medium flex items-center gap-1 text-base">
              {user.name || 'User'}
              {isCurrentUser && (
                <Badge variant="outline" className="ml-1 text-xs font-semibold">
                  You
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {user.lastSeen ? timeAgo(user.lastSeen) : 'Just now'}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          {isOnline ? (
            <Badge className="bg-gradient-to-r from-green-400 to-green-600">Online</Badge>
          ) : (
            <Badge variant="outline">Offline</Badge>
          )}
          {isEditing && (
            <div className="flex items-center gap-1 mt-1.5 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              <Edit className="h-3 w-3" /> Editing
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
