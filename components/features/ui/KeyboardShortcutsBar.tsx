import React from 'react';
import { X, Keyboard as KeyboardIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * KeyboardShortcutsBar displays the keyboard shortcuts for the ideas board.
 * Usage: <KeyboardShortcutsBar onHide={...} />
 */
const shortcutStyles: Record<string, string> = {
  D: 'bg-accent text-accent-foreground',
  A: 'bg-accent text-accent-foreground',
  B: 'bg-accent text-accent-foreground',
  T: 'bg-accent text-accent-foreground',
  O: 'bg-accent text-accent-foreground',
};

interface KeyboardShortcutsBarProps {
  onHide: () => void;
}

const KeyboardShortcutsBar: React.FC<KeyboardShortcutsBarProps> = ({ onHide }) => (
  <div className="fixed left-1/2 -translate-x-1/2" style={{ bottom: '10vh', zIndex: 50 }}>
    <div className="flex flex-col items-center bg-background/95 rounded-2xl shadow-lg border border-border px-6 py-3 min-w-[340px] relative">
      {/* Hide button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Hide keyboard shortcuts"
        onClick={onHide}
        tabIndex={0}
      >
        <X className="h-4 w-4" />
      </button>
      {/* First row: primary shortcuts */}
      <div className="flex gap-4 mb-1 justify-center">
        <div className="flex flex-col items-center">
          <kbd
            className={`kbd px-3 py-2 rounded-xl text-base font-semibold ${shortcutStyles.D}`}
            aria-label="Destination"
          >
            D
          </kbd>
          <span className="text-xs mt-1 text-muted-foreground font-medium">Destination</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd
            className={`kbd px-3 py-2 rounded-xl text-base font-semibold ${shortcutStyles.A}`}
            aria-label="Activity"
          >
            A
          </kbd>
          <span className="text-xs mt-1 text-muted-foreground font-medium">Activity</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd
            className={`kbd px-3 py-2 rounded-xl text-base font-semibold ${shortcutStyles.B}`}
            aria-label="Budget"
          >
            B
          </kbd>
          <span className="text-xs mt-1 text-muted-foreground font-medium">Budget</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd
            className={`kbd px-3 py-2 rounded-xl text-base font-semibold ${shortcutStyles.T}`}
            aria-label="Date"
          >
            T
          </kbd>
          <span className="text-xs mt-1 text-muted-foreground font-medium">Date</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd
            className={`kbd px-3 py-2 rounded-xl text-base font-semibold ${shortcutStyles.O}`}
            aria-label="Other"
            title="Other"
          >
            O
          </kbd>
          <span className="text-xs mt-1 text-muted-foreground font-medium font-sans">Other</span>
        </div>
      </div>
      {/* Second row: secondary shortcuts */}
      <div className="flex gap-3 justify-center text-xs text-muted-foreground mt-1 flex-wrap">
        <span className="flex items-center gap-1">
          <kbd className="kbd px-2 py-1 rounded bg-muted text-foreground text-base font-medium">
            /
          </kbd>{' '}
          Help
        </span>
        <span className="flex items-center gap-1">
          <kbd className="kbd px-2 py-1 rounded bg-muted text-foreground text-base font-medium">
            Esc
          </kbd>{' '}
          Close
        </span>
        <span className="flex items-center gap-1">
          <kbd className="kbd px-2 py-1 rounded bg-muted text-foreground text-base font-medium">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="kbd px-2 py-1 rounded bg-muted text-foreground text-base font-medium">
            Shift
          </kbd>
          <span>+</span>
          <kbd className="kbd px-2 py-1 rounded bg-muted text-foreground text-base font-medium">
            Enter
          </kbd>
          <span>Start Voting (Owner)</span>
        </span>
      </div>
    </div>
  </div>
);

export const KeyboardShortcutsShowButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="bg-background border rounded-full shadow-lg p-2 hover:bg-muted focus:outline-none"
            aria-label="Show keyboard shortcuts"
            onClick={onClick}
          >
            <KeyboardIcon className="h-5 w-5 text-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          Show keyboard shortcuts
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export default KeyboardShortcutsBar;
