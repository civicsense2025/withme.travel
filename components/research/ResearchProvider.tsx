'use client';

import { ReactNode } from 'react';
import { ResearchProvider as ResearchContextProvider } from '@/app/context/ResearchContext';
import { MilestoneTracker } from './MilestoneTracker';
import { SurveyModal } from './SurveyModal';

interface ResearchProviderProps {
  children: ReactNode;
}

/**
 * Provider component that adds research functionality to the application
 * This component should be added to the root layout to ensure research tracking
 * is available throughout the application
 */
export function ResearchProvider({ children }: ResearchProviderProps) {
  return (
    <ResearchContextProvider>
      {children}
      
      {/* These components handle research tracking but don't render visible UI */}
      <MilestoneTracker />
      <SurveyModal />
    </ResearchContextProvider>
  );
} 