'use client';

/**
 * Calendar (Molecule)
 *
 * A fully functional, accessible calendar component with support for
 * date selection, range selection, and month/year navigation.
 *
 * @module ui/molecules
 */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// ============================================================================
// TYPES
// ============================================================================

export type CalendarMode = 'single' | 'multiple' | 'range';
export type DateRange = { from: Date; to?: Date };

export interface CalendarProps {
  /** Selected date (controlled) */
  value?: Date | Date[] | DateRange;
  /** Default selected date(s) (uncontrolled) */
  defaultValue?: Date | Date[] | DateRange;
  /** Callback when date changes */
  onChange?: (date: Date | Date[] | DateRange) => void;
  /** Alternative prop name for selected date */
  selected?: Date | Date[] | DateRange;
  /** Alternative callback name */
  onSelect?: (date: Date | Date[] | DateRange) => void;
  /** Calendar mode: single, multiple, or range */
  mode?: CalendarMode;
  /** Additional CSS classes */
  className?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Dates to disable */
  disabledDates?: Date[];
  /** Days of week to disable (0 = Sunday, 6 = Saturday) */
  disabledDaysOfWeek?: number[];
  /** Initial displayed month and year */
  initialFocus?: Date;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** First day of week (0 = Sunday, 6 = Saturday) */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Locale for formatting (default: browser) */
  locale?: string;
  /** Custom day rendering */
  renderDay?: (day: Date, isSelected: boolean, isDisabled: boolean) => React.ReactNode;
  /** Show outside days */
  showOutsideDays?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all days in a month
 */
function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

/**
 * Get days to display in calendar grid including prev/next month days
 */
function getCalendarDays(year: number, month: number, firstDayOfWeek: number = 0): Date[] {
  const days = getDaysInMonth(year, month);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  
  // Adjust for first day of week
  let firstDayOfMonthIndex = firstDay.getDay();
  if (firstDayOfWeek > 0) {
    firstDayOfMonthIndex = (firstDayOfMonthIndex + 7 - firstDayOfWeek) % 7;
  }
  
  // Add days from previous month
  const prevMonthDays: Date[] = [];
  if (firstDayOfMonthIndex > 0) {
    const prevMonth = new Date(year, month, 0);
    const daysFromPrevMonth = firstDayOfMonthIndex;
    
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const prevDay = new Date(prevMonth);
      prevDay.setDate(prevMonth.getDate() - i + 1);
      prevMonthDays.push(prevDay);
    }
  }
  
  // Add days from next month
  const nextMonthDays: Date[] = [];
  const lastDayOfMonthIndex = lastDay.getDay();
  const daysFromNextMonth = 7 - ((lastDayOfMonthIndex + 1 - firstDayOfWeek + 7) % 7);
  
  if (daysFromNextMonth < 7) {
    const nextMonth = new Date(year, month + 1, 1);
    
    for (let i = 0; i < daysFromNextMonth; i++) {
      const nextDay = new Date(nextMonth);
      nextDay.setDate(nextMonth.getDate() + i);
      nextMonthDays.push(nextDay);
    }
  }
  
  return [...prevMonthDays, ...days, ...nextMonthDays];
}

/**
 * Format date as YYYY-MM-DD for comparison
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if two dates are the same day
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return formatDateString(d1) === formatDateString(d2);
}

/**
 * Check if a date is in a range
 */
function isInRange(date: Date, range: DateRange): boolean {
  if (!range.from) return false;
  if (!range.to) return isSameDay(date, range.from);
  
  const timestamp = date.getTime();
  return timestamp >= range.from.getTime() && timestamp <= range.to.getTime();
}

/**
 * Check if a date is in an array
 */
function isInArray(date: Date, dates: Date[]): boolean {
  return dates.some(d => isSameDay(d, date));
}

// ============================================================================
// MAIN CALENDAR COMPONENT
// ============================================================================

export function Calendar({
  value,
  defaultValue,
  onChange,
  selected,
  onSelect,
  mode = 'single',
  className,
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  initialFocus,
  showWeekNumbers = false,
  firstDayOfWeek = 0,
  locale = 'default',
  renderDay,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // State for the currently viewed month/year
  const [viewDate, setViewDate] = useState(() => {
    if (initialFocus) return initialFocus;
    
    // Use the first selected date or current date
    if (mode === 'single') {
      const selectedDate = value || selected || defaultValue;
      return selectedDate instanceof Date ? selectedDate : new Date();
    } else if (mode === 'multiple') {
      const selectedDates = value || selected || defaultValue || [];
      return Array.isArray(selectedDates) && selectedDates.length > 0
        ? selectedDates[0]
        : new Date();
    } else if (mode === 'range') {
      const selectedRange = value || selected || defaultValue || { from: new Date() };
      return 'from' in selectedRange ? selectedRange.from : new Date();
    }
    
    return new Date();
  });
  
  // Internal state for selection (uncontrolled mode)
  const [internalValue, setInternalValue] = useState<Date | Date[] | DateRange>(() => {
    if (defaultValue) return defaultValue;
    if (mode === 'single') return new Date();
    if (mode === 'multiple') return [];
    return { from: new Date() };
  });
  
  // Use provided value or internal state
  const selectedValue = value !== undefined ? value : selected !== undefined ? selected : internalValue;
  
  // Days to display in the calendar
  const calendarDays = getCalendarDays(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    firstDayOfWeek
  );
  
  // Week day names based on locale
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(2023, 0, ((i + firstDayOfWeek) % 7) + 1);
    return day.toLocaleDateString(locale, { weekday: 'short' });
  });
  
  // Handler for date selection
  const handleDateSelect = (date: Date) => {
    let newValue: Date | Date[] | DateRange;
    
    if (mode === 'single') {
      newValue = date;
    } else if (mode === 'multiple') {
      const currentDates = (Array.isArray(selectedValue) ? selectedValue : []) as Date[];
      const dateIndex = currentDates.findIndex(d => isSameDay(d, date));
      
      if (dateIndex >= 0) {
        // Remove date if already selected
        newValue = [...currentDates.slice(0, dateIndex), ...currentDates.slice(dateIndex + 1)];
      } else {
        // Add date if not selected
        newValue = [...currentDates, date];
      }
    } else if (mode === 'range') {
      const range = (selectedValue || { from: undefined }) as DateRange;
      
      if (!range.from) {
        newValue = { from: date };
      } else if (!range.to && date > range.from) {
        newValue = { from: range.from, to: date };
      } else {
        newValue = { from: date, to: undefined };
      }
    } else {
      return; // Unknown mode
    }
    
    // Update internal state if uncontrolled
    if (value === undefined && selected === undefined) {
      setInternalValue(newValue);
    }
    
    // Call change handlers
    if (onChange) onChange(newValue);
    if (onSelect) onSelect(newValue);
  };
  
  // Check if a date is selected
  const isDateSelected = (date: Date): boolean => {
    if (mode === 'single') {
      return selectedValue instanceof Date && isSameDay(date, selectedValue);
    } else if (mode === 'multiple') {
      return Array.isArray(selectedValue) && isInArray(date, selectedValue);
    } else if (mode === 'range') {
      const range = selectedValue as DateRange;
      if (!range || !range.from) return false;
      
      if (range.to) {
        return isInRange(date, range);
      }
      return isSameDay(date, range.from);
    }
    return false;
  };
  
  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    // Check min/max date
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    // Check disabled dates
    if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) return true;
    
    // Check disabled days of week
    if (disabledDaysOfWeek.includes(date.getDay())) return true;
    
    return false;
  };
  
  // Go to previous month
  const goToPreviousMonth = () => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  // Go to next month
  const goToNextMonth = () => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Go to previous year
  const goToPreviousYear = () => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  };
  
  // Go to next year
  const goToNextYear = () => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  };
  
  // Go to current month
  const goToToday = () => {
    setViewDate(new Date());
  };
  
  return (
    <div 
      className={cn('w-full max-w-sm rounded border bg-background p-3', className)} 
      role="application" 
      aria-label="Calendar"
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={goToPreviousYear}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-sm font-medium" aria-live="polite">
          {viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={goToNextYear}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
        {weekDays.map((day, i) => (
          <div key={i} className="py-1 text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const isSelected = isDateSelected(day);
          const isDisabled = isDateDisabled(day);
          const isOutsideDay = !isCurrentMonth;
          
          if (isOutsideDay && !showOutsideDays) {
            return <div key={i} />;
          }
          
          return (
            <button
              key={i}
              type="button"
              className={cn(
                'h-8 w-8 rounded-md p-0 text-center text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50',
                isToday && 'bg-muted font-semibold',
                isSelected && !isDisabled && 'bg-primary text-primary-foreground',
                isDisabled && 'pointer-events-none opacity-50',
                !isSelected && !isDisabled && !isToday && 'hover:bg-muted',
                mode === 'range' && (selectedValue as DateRange)?.from && (selectedValue as DateRange)?.to && 
                  isInRange(day, selectedValue as DateRange) && !isSelected && 'bg-muted/50'
              )}
              disabled={isDisabled}
              onClick={() => !isDisabled && handleDateSelect(day)}
              aria-label={day.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
              aria-selected={isSelected}
              aria-disabled={isDisabled}
              tabIndex={isCurrentMonth ? 0 : -1}
            >
              {renderDay ? (
                renderDay(day, isSelected, isDisabled)
              ) : (
                day.getDate()
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-xs"
        >
          Today
        </Button>
      </div>
    </div>
  );
}