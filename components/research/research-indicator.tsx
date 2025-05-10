'use client';

import React, { useState } from 'react';
import { useResearch } from '@/contexts/research-context';
import { Beaker, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';

export function ResearchIndicator() {
  const { isResearchSession, exitResearch, participantId } = useResearch();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isResearchSession) return null;
  
  // Extract the first 6 characters of participant ID for display
  const participantShortId = participantId 
    ? participantId.substring(0, 6) 
    : '';
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 max-w-xs"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Beaker className="h-4 w-4 mr-1.5" />
                <span className="font-semibold">Research Study</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm mb-3">
              <p className="mb-2">
                You're currently participating in a research study to help improve withme.travel.
              </p>
              <p className="text-xs text-primary-foreground/80">
                ID: {participantShortId}
              </p>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground"
                >
                  Exit Research Study
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium">Exit Research Study?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your feedback is valuable to us. If you exit now, your previous responses will still be saved, but you won't receive any more surveys.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.body.click()} // Close popover
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={exitResearch}
                    >
                      Confirm Exit
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-primary text-primary-foreground rounded-full shadow-lg p-2 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-1.5">
              <Beaker className="h-4 w-4" />
              <span className="text-xs font-medium pr-0.5">Research</span>
              <ChevronUp className="h-3 w-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 