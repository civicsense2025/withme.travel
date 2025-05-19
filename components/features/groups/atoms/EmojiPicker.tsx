/**
 * EmojiPicker Atom
 *
 * Allows users to pick an emoji for group features.
 * @module components/features/groups/atoms/EmojiPicker
 */

'use client';

import React from 'react';
import { useState } from 'react';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';

/**
 * EmojiPicker component props
 */
export interface EmojiPickerProps {
  /** Optional callback when emoji is selected */
  onSelect?: (emoji: string) => void;
  /** Currently selected emoji */
  value?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * EmojiPicker atom for group features (placeholder)
 */
export function EmojiPicker({ onSelect, value, className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="h-10 w-10 text-lg rounded-full border border-input bg-background flex items-center justify-center"
        aria-label="Select emoji"
        onClick={() => setIsOpen((open) => !open)}
      >
        {value || '😀'}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-background rounded-xl shadow-lg border p-2">
          <FrimousseEmojiPicker.Root
            onEmojiSelect={(emoji: any) => {
              onSelect?.(emoji.emoji);
              setIsOpen(false);
            }}
            locale="en"
            columns={8}
            style={{ width: 320 }}
          >
            <FrimousseEmojiPicker.Search autoFocus />
            <FrimousseEmojiPicker.Viewport style={{ maxHeight: 300 }}>
              <FrimousseEmojiPicker.List />
            </FrimousseEmojiPicker.Viewport>
          </FrimousseEmojiPicker.Root>
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
