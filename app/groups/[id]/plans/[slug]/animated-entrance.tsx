'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { trackPlanEvent } from '@/app/lib/group-plans/track-plan-event';

interface AnimatedEntranceProps {
  children: React.ReactNode;
}

export function AnimatedEntrance({ children }: AnimatedEntranceProps) {
  const [showContent, setShowContent] = useState(false);
  const params = useParams();

  // Extract IDs from URL params
  const groupId = params?.id as string;
  const planSlug = params?.slug as string;

  useEffect(() => {
    // Small delay before showing content for smoother animation
    const timer = setTimeout(() => {
      setShowContent(true);

      // Track animation complete
      if (groupId && planSlug) {
        trackPlanEvent({
          groupId,
          planId: planSlug,
          eventType: 'animation_complete',
          eventData: {
            type: 'entrance_animation',
            delay_ms: 100,
          },
        });
      }
    }, 100);

    // Track page visit
    if (groupId && planSlug) {
      trackPlanEvent({
        groupId,
        planId: planSlug,
        eventType: 'visit',
        eventData: {
          entry_type: 'animated',
        },
      });
    }

    return () => clearTimeout(timer);
  }, [groupId, planSlug]);

  // Staggered entrance variants for children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  // Overlay that fades out
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      {/* Entrance animation overlay */}
      <AnimatePresence>
        {!showContent && (
          <motion.div
            variants={overlayVariants}
            initial="visible"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-white dark:bg-gray-950 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-blue-600 dark:text-blue-400"
            >
              Ideas Board
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with staggered animation */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            {/* Wrap children to apply animations */}
            {React.Children.map(children, (child, index) => (
              <motion.div key={index} variants={itemVariants}>
                {child}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
