'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SurveyContainer } from './SurveyContainer';
import { useResearch } from './ResearchProvider';

/**
 * Modal component that displays triggered surveys
 */
export function ResearchModal() {
  const { 
    activeSurvey, 
    isSurveyVisible, 
    closeSurvey, 
    session 
  } = useResearch();

  // Close modal with escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSurvey();
      }
    };

    if (isSurveyVisible) {
      window.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSurveyVisible, closeSurvey]);

  // Don't render anything if no survey or session
  if (!activeSurvey || !session) {
    return null;
  }

  return (
    <Dialog open={isSurveyVisible} onOpenChange={(open) => !open && closeSurvey()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-2xl font-semibold text-center">
            {/* Title will be provided by SurveyContainer */}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <SurveyContainer
            formId={activeSurvey.formId}
            milestone={activeSurvey.milestone}
            sessionId={session.id}
            sessionToken={session.session_token}
            mode="modal"
            onClose={closeSurvey}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
