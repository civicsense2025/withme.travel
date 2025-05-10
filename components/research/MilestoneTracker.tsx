'use client';

import { useEffect } from 'react';
import { useResearch } from '@/app/context/ResearchContext';
import { MilestoneType } from '@/types/research';
import { usePathname } from 'next/navigation';

/**
 * Component that tracks user milestones and fires research events when reached.
 * This should be placed near the root of the application layout to track all user actions.
 */
export function MilestoneTracker() {
  const { 
    isResearchSession, 
    trackMilestone, 
    checkMilestone, 
    hasCompletedMilestone 
  } = useResearch();
  const pathname = usePathname();
  
  // Track onboarding completion
  useEffect(() => {
    if (!isResearchSession) return;
    
    // Check if onboarding is complete based on URL patterns
    const isOnboardingComplete = async () => {
      // Skip if already tracked
      const alreadyCompleted = await hasCompletedMilestone(MilestoneType.COMPLETE_ONBOARDING);
      if (alreadyCompleted) return;
      
      // Detect onboarding completion based on your app's flow
      // This is just an example - update based on your actual onboarding flow
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/trips')) {
        trackMilestone(MilestoneType.COMPLETE_ONBOARDING, {
          pathname,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    isOnboardingComplete();
  }, [isResearchSession, pathname, hasCompletedMilestone, trackMilestone]);
  
  // Track trip from template creation
  useEffect(() => {
    if (!isResearchSession) return;
    
    // Check pathname for template use patterns
    if (pathname.includes('/trips/new') && pathname.includes('template=')) {
      hasCompletedMilestone(MilestoneType.TRIP_FROM_TEMPLATE_CREATED).then(completed => {
        if (!completed) {
          trackMilestone(MilestoneType.TRIP_FROM_TEMPLATE_CREATED, {
            pathname,
            timestamp: new Date().toISOString()
          });
        }
      });
    }
  }, [isResearchSession, pathname, hasCompletedMilestone, trackMilestone]);
  
  // Check itinerary milestones periodically
  useEffect(() => {
    if (!isResearchSession) return;
    
    // Only check on trip-related pages
    if (!pathname.includes('/trips/')) return;
    
    // Check for itinerary milestones
    const checkItineraryMilestone = async () => {
      const result = await checkMilestone(MilestoneType.ITINERARY_MILESTONE_3_ITEMS);
      
      // If milestone was reached, it will automatically trigger the survey if needed
      console.log('Itinerary milestone check:', result);
    };
    
    // Run once on mount for this page
    checkItineraryMilestone();
    
    // Then check every minute while on the page
    const intervalId = setInterval(checkItineraryMilestone, 60000);
    return () => clearInterval(intervalId);
  }, [isResearchSession, pathname, checkMilestone]);
  
  // This component doesn't render anything visible
  return null;
} 