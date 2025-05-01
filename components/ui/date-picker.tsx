'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DatePicker({
  date,
  setDate,
  disabled = false,
  placeholder = 'Pick a date',
}: DatePickerProps) {
  // Format date safely with error handling
  const formattedDate = React.useMemo(() => {
    if (!date) return null;
    try {
      return format(date, 'PPP');
    } catch (error) {
      console.error('Invalid date format:', error);
      return null;
    }
  }, [date]);

  // Custom handler to adapt the Calendar's type to our expected types
  const handleSelect = (day: Date | undefined) => {
    setDate(day || null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !formattedDate && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate ? formattedDate : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleSelect}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
