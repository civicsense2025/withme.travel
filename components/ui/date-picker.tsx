'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DatePickerProps {
  date: DateRange;
  setDate: (date: DateRange) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DatePicker({
  date,
  setDate,
  disabled = false,
  placeholder = 'Pick a date range',
}: DatePickerProps) {
  const formattedDate = React.useMemo(() => {
    if (!date?.from && !date?.to) return null;
    if (date?.from && date?.to) {
      return `${format(date.from, 'MMM d')} - ${format(date.to, 'MMM d, yyyy')}`;
    }
    if (date?.from) {
      return format(date.from, 'MMM d, yyyy');
    }
    return null;
  }, [date]);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setDate({
      from: range?.from ?? null,
      to: range?.to ?? null,
    });
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
          mode="range"
          selected={date && date.from ? { from: date.from, to: date.to ?? undefined } : undefined}
          onSelect={handleSelect}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
