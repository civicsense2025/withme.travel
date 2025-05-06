import React from 'react';
import { X, Keyboard as KeyboardIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * KeyboardShortcutsBar displays the keyboard shortcuts for the ideas board.
 * Usage: <KeyboardShortcutsBar onHide={...} />
 */
const shortcutStyles: Record<string, string> = {
  D: 'bg-blue-200 text-blue-800',
  A: 'bg-green-200 text-green-800',
  B: 'bg-orange-200 text-orange-800',
  T: 'bg-yellow-200 text-yellow-800',
  O: 'bg-purple-200 text-purple-800',
};

interface KeyboardShortcutsBarProps {
  onHide: () => void;
}

const KeyboardShortcutsBar: React.FC<KeyboardShortcutsBarProps> = ({ onHide }) => (
  <div className="fixed left-1/2 -translate-x-1/2" style={{ bottom: '10vh', zIndex: 50 }}>
    <div className="flex flex-col items-center bg-white/90 rounded-lg shadow-lg px-4 py-2 border min-w-[340px] relative">
      {/* Hide button */}
      <button
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label="Hide keyboard shortcuts"
        onClick={onHide}
        tabIndex={0}
      >
        <X className="h-4 w-4" />
      </button>
      {/* First row: primary shortcuts */}
      <div className="flex gap-4 mb-1 justify-center">
        <div className="flex flex-col items-center">
          <kbd className={`kbd px-2 py-1 rounded ${shortcutStyles.D}`} aria-label="Destination">D</kbd>
          <span className="text-xs mt-1 text-blue-800 font-medium">Destination</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd className={`kbd px-2 py-1 rounded ${shortcutStyles.A}`} aria-label="Activity">A</kbd>
          <span className="text-xs mt-1 text-green-800 font-medium">Activity</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd className={`kbd px-2 py-1 rounded ${shortcutStyles.B}`} aria-label="Budget">B</kbd>
          <span className="text-xs mt-1 text-orange-800 font-medium">Budget</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd className={`kbd px-2 py-1 rounded ${shortcutStyles.T}`} aria-label="Date">T</kbd>
          <span className="text-xs mt-1 text-yellow-800 font-medium">Date</span>
        </div>
        <div className="flex flex-col items-center">
          <kbd className={`kbd px-2 py-1 rounded font-sans font-medium ${shortcutStyles.O}`} aria-label="Other" title="Other">O</kbd>
          <span className="text-xs mt-1 text-purple-800 font-medium font-sans">Other</span>
        </div>
      </div>
      {/* Second row: secondary shortcuts */}
      <div className="flex gap-3 justify-center text-xs text-gray-500 mt-1 flex-wrap">
        <span className="flex items-center gap-1">
          <kbd className="kbd px-2 py-1 rounded bg-gray-100 text-gray-700" aria-label="Help">/</kbd> Help
        </span>
        <span className="flex items-center gap-1">
          <kbd className="kbd px-2 py-1 rounded bg-gray-100 text-gray-700" aria-label="Close">Esc</kbd> Close
        </span>
        <span className="flex items-center gap-1">
          <kbd className="kbd px-1 py-1 rounded bg-gray-100 text-gray-700">Ctrl</kbd>
          <span>+</span>
          <kbd className="kbd px-1 py-1 rounded bg-gray-100 text-gray-700">Shift</kbd>
          <span>+</span>
          <kbd className="kbd px-2 py-1 rounded bg-gray-100 text-gray-700">Enter</kbd>
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
            className="bg-white/90 border rounded-full shadow-lg p-2 hover:bg-gray-100 focus:outline-none"
            aria-label="Show keyboard shortcuts"
            onClick={onClick}
          >
            <KeyboardIcon className="h-5 w-5 text-gray-700" />
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