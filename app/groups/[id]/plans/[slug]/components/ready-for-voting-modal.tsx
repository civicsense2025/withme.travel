'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, AlertCircle, Vote, ArrowRight } from 'lucide-react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider';
import { useIdeasPresenceContext } from '../context/ideas-presence-context';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadyForVotingModalProps {
  onClose: () => void;
  groupId: string;
  planSlug: string;
}

export function ReadyForVotingModal({ onClose, groupId, planSlug }: ReadyForVotingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeUsers } = useIdeasPresenceContext();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track which users have clicked "I'm ready"
  const [readyUsers, setReadyUsers] = useState<Record<string, boolean>>({
    [user?.id || 'current-user']: false,
  });

  // Simulate the other users being ready or not
  const handleToggleReady = async () => {
    setIsReady(!isReady);

    // Update the ready state for the current user
    setReadyUsers((prev) => ({
      ...prev,
      [user?.id || 'current-user']: !isReady,
    }));

    // In a real implementation, you would broadcast this to other users
    // through your real-time system (Supabase Realtime or similar)
  };

  const getTotalMembers = () => {
    return activeUsers.length || 1;
  };

  const getReadyCount = () => {
    return Object.values(readyUsers).filter((ready) => ready).length;
  };

  const getReadyPercentage = () => {
    const total = getTotalMembers();
    const ready = getReadyCount();
    return total > 0 ? Math.round((ready / total) * 100) : 0;
  };

  const proceedToVoting = async () => {
    setIsSubmitting(true);

    try {
      // In a real implementation, you would:
      // 1. Save the current state of the ideas board
      // 2. Create a voting session in your database
      // 3. Transition the group to the voting phase

      const supabase = getBrowserClient();

      // Example: Mark the group as in "voting" phase
      const { error } = await supabase
        .from('groups')
        .update({
          // last_activity: new Date().toISOString(), // Removed as not in type
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Moving to voting phase',
      });

      // Redirect to the voting view
      router.push(`/groups/${groupId}/plans/${planSlug}/vote`);
    } catch (error) {
      console.error('Error transitioning to voting phase:', error);
      toast({
        title: 'Error',
        description: 'Failed to transition to voting phase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${getReadyPercentage()}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Vote className="h-5 w-5 text-purple-500" />
              Ready to vote on ideas?
            </DialogTitle>
            <DialogDescription>
              When everyone is ready, you'll move to the voting phase to decide which ideas to
              include in your trip.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <motion.div
              className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{ width: `${getReadyPercentage()}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${getReadyPercentage()}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </motion.div>

            <motion.p
              className="text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-lg font-bold text-purple-600">{getReadyCount()}</span> of{' '}
              <span className="text-lg font-bold text-gray-700">{getTotalMembers()}</span> people
              are ready
            </motion.p>
          </div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Current user */}
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-lg font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'Y'}
                  </AvatarFallback>
                </Avatar>

                <AnimatePresence>
                  {readyUsers[user?.id || 'current-user'] && (
                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-sm font-medium mt-2">You</span>
            </motion.div>

            {/* Other users */}
            {activeUsers
              .filter((u) => u.id !== user?.id)
              .map((userData, index) => {
                // Simulate some users being ready
                const isUserReady = Math.random() > 0.5;
                return (
                  <motion.div
                    key={userData.id}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                        <AvatarImage src={userData.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg font-bold">
                          {userData.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isUserReady && (
                        <motion.div
                          className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-md"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 15,
                            delay: 0.6 + index * 0.1,
                          }}
                        >
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    <span className="text-sm font-medium mt-2">{userData.name}</span>
                  </motion.div>
                );
              })}
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant={isReady ? 'outline' : 'default'}
              size="lg"
              className={
                isReady
                  ? 'gap-2 border-2 border-green-500 text-green-700 hover:bg-green-50 transition-all duration-300'
                  : 'gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300'
              }
              onClick={handleToggleReady}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  I'm ready
                </>
              ) : (
                "I'm ready to vote"
              )}
            </Button>
          </motion.div>
        </div>

        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Cancel
          </Button>

          <Button
            disabled={isSubmitting || !isReady}
            onClick={proceedToVoting}
            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isSubmitting ? (
              'Processing...'
            ) : (
              <>
                Move to Voting
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
