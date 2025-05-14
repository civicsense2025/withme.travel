'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/app/lib/onboarding/hooks/use-onboarding';
import { useParams } from 'next/navigation';
import { trackPlanEvent, PLAN_EVENT_TYPES } from '@/app/lib/group-plans/track-plan-event';

interface WelcomeBannerProps {
  planName: string;
  onStartTour?: () => void;
}

const TOUR_ID = 'ideas-whiteboard-tour';

export function WelcomeBanner({ planName, onStartTour }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { hasCompletedTour, isLoading } = useOnboarding(TOUR_ID);
  const params = useParams();

  // Extract IDs from URL params
  const groupId = params?.id as string;
  const planSlug = params?.slug as string;

  // Track welcome banner view
  const trackBannerView = async () => {
    if (groupId && planSlug) {
      await trackPlanEvent({
        groupId,
        planId: planSlug,
        eventType: 'welcome_banner_view',
        eventData: { planName },
      });
    }
  };

  // Show banner only for users who haven't completed the tour
  useEffect(() => {
    if (!isLoading && !hasCompletedTour) {
      // Delay appearance slightly for a smoother entry experience
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Track banner view when it becomes visible
        trackBannerView();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasCompletedTour]);

  // Hide banner when clicked
  const handleClose = () => {
    setIsVisible(false);

    // Track banner close event
    if (groupId && planSlug) {
      trackPlanEvent({
        groupId,
        planId: planSlug,
        eventType: 'welcome_banner_close',
      });
    }
  };

  // Handle start tour button click
  const handleStartTour = () => {
    setIsVisible(false);

    // Track tour start from banner
    if (groupId && planSlug) {
      trackPlanEvent({
        groupId,
        planId: planSlug,
        eventType: PLAN_EVENT_TYPES.TOUR_START,
        eventData: { source: 'welcome_banner' },
      });
    }

    // Call the provided callback
    if (onStartTour) {
      onStartTour();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-4xl mx-auto mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg shadow-md overflow-hidden"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 rounded-full bg-blue-200/30 dark:bg-blue-600/10"
                initial={{
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                  y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: Math.random() * 10 + 10,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Welcome to the Ideas Board for "{planName}"!
              </h3>
              <p className="mt-1 text-blue-700 dark:text-blue-300 max-w-3xl">
                This is where your group can brainstorm trip ideas together in real-time. Add
                destinations, activities, dates, and budget expectations to get started!
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={handleStartTour}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Quick Tour
              </Button>
              <Button
                onClick={handleClose}
                size="icon"
                variant="ghost"
                className="text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
