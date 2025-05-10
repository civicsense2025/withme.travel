'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Beaker } from 'lucide-react';
import { useResearch } from '@/contexts/research-context';

export function ResearchBadge() {
  const { isResearchSession, endSession, trackEvent } = useResearch();
  
  // Don't render anything if not in a research session
  if (!isResearchSession) {
    return null;
  }
  
  const handleEndSession = () => {
    // Track the event before ending session
    trackEvent('research_session_ended_by_user');
    
    // End the research session
    endSession();
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background border rounded-lg shadow-md p-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Beaker className="h-3 w-3" />
        <span>Research Mode</span>
      </Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleEndSession}
        className="text-xs"
      >
        End Session
      </Button>
    </div>
  );
} 