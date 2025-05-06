import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface IdeasBoardHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdeasBoardHelpDialog({ open, onOpenChange }: IdeasBoardHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Welcome to the Ideas Board!
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            Your group's space to brainstorm destinations, activities, dates, and more for your trip.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2 text-sm">
          {/* Section 1: Columns as emoji chips */}
          <section>
            <h3 className="font-semibold text-sm mb-1">How it Works: Columns</h3>
            <p className="text-muted-foreground text-xs mb-2">Use columns to organize different types of ideas:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium">
                <span className="mr-1 text-base">📍</span>
                <strong>Destination:</strong>&nbsp;Places to go?
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-xs font-medium">
                <span className="mr-1 text-base">📅</span>
                <strong>Date:</strong>&nbsp;When to travel?
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-800 rounded-full text-xs font-medium">
                <span className="mr-1 text-base">🏄‍♂️</span>
                <strong>Activity:</strong>&nbsp;Things to do?
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs font-medium">
                <span className="mr-1 text-base">💰</span>
                <strong>Budget:</strong>&nbsp;How much?
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-xs font-medium">
                <span className="mr-1 text-base">💭</span>
                <strong>Other:</strong>&nbsp;Anything else!
              </span>
            </div>
          </section>
          {/* Section 2: Voting */}
          <section>
            <h3 className="font-semibold text-sm mb-1">Voting Time! <span role="img" aria-label="ballot">🗳️</span></h3>
            <p className="text-muted-foreground text-xs">
              Ready to decide? The <strong>Trip Owner</strong> can start a vote. Everyone picks their top choices, and the most popular ideas rise to the top!
            </p>
          </section>
          {/* Section 3: Next Steps */}
          <section>
            <h3 className="font-semibold text-sm mb-1">What's Next?</h3>
            <p className="text-muted-foreground text-xs">
              After voting, easily turn the winning ideas into a draft trip plan. You can always refine it later.
            </p>
          </section>
          {/* Section 4: Shortcuts */}
          <section>
            <h3 className="font-semibold text-sm mb-1">Keyboard Shortcuts</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <span><kbd className="px-1 py-0.5 rounded bg-blue-100 text-blue-800 font-mono mr-1">D</kbd> Add Destination</span>
              <span><kbd className="px-1 py-0.5 rounded bg-green-100 text-green-800 font-mono mr-1">A</kbd> Add Activity</span>
              <span><kbd className="px-1 py-0.5 rounded bg-orange-100 text-orange-800 font-mono mr-1">B</kbd> Add Budget</span>
              <span><kbd className="px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 font-mono mr-1">T</kbd> Add Date</span>
              <span><kbd className="px-1 py-0.5 rounded bg-purple-100 text-purple-800 font-mono mr-1">O</kbd> Add Other</span>
              <span><kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-700 font-mono mr-1">/</kbd> Open Help</span>
              <span><kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-700 font-mono mr-1">Esc</kbd> Close</span>
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} size="sm" className="text-xs px-3 py-1.5" autoFocus>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 