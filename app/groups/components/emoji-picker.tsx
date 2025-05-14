'use client';

import { useState } from 'react';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="h-10 w-10 text-lg rounded-full border border-input bg-background flex items-center justify-center"
        aria-label="Select emoji"
        onClick={() => setIsOpen((open) => !open)}
      >
        {value || '🙂'}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-background rounded-xl shadow-lg border p-2">
          <FrimousseEmojiPicker.Root
            onEmojiSelect={(emoji: any) => {
              onChange(emoji.emoji);
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
