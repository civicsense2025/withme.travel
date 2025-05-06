'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const COMMON_EMOJIS = [
  '✈️', '🏝️', '🌍', '🧳', '🏕️', '🏢', '🚗', '🚂', '🚢', '🚶‍♂️', 
  '👨‍👩‍👧‍👦', '👯‍♂️', '👫', '👨‍👩‍👧', '👬', '🧭', '🗺️', '🏔️', '🏖️', '🏞️',
  '🌄', '🌅', '🌇', '🌆', '🌃', '🌉', '🏙️', '🚶‍♀️', '🧗‍♂️', '🏊‍♀️',
  '🚴‍♂️', '⛷️', '🏄‍♀️', '🏂', '🧘‍♀️', '🎭', '🎪', '🎡', '🎢', '🏛️',
  '⛩️', '🕌', '⛪', '🕍', '🛕', '🏯', '🏰', '🗽', '🗿', '🌋'
];

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 text-lg"
          aria-label="Select emoji"
        >
          {value || <Smile className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-8 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-lg p-0"
              onClick={() => {
                onChange(emoji);
                setIsOpen(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 