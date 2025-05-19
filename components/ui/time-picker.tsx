/**
 * TimePicker (Molecule)
 * 
 * A basic time picker component with hours and minutes selection.
 */
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  hourPlaceholder?: string;
  minutePlaceholder?: string;
  format?: '12h' | '24h';
}

export function TimePicker({
  value = '',
  onChange,
  className,
  hourPlaceholder = 'HH',
  minutePlaceholder = 'MM',
  format = '24h',
}: TimePickerProps) {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Parse the initial value if provided
  useEffect(() => {
    if (value) {
      const [timeValue, periodValue] = value.split(' ');
      const [hourValue, minuteValue] = timeValue.split(':');
      
      setHour(hourValue);
      setMinute(minuteValue);
      
      if (periodValue) {
        setPeriod(periodValue as 'AM' | 'PM');
      }
    }
  }, [value]);

  // Update the value when hour or minute changes
  const updateValue = (h: string, m: string, p: 'AM' | 'PM') => {
    // Validate hour
    let hourNum = parseInt(h, 10);
    if (isNaN(hourNum)) hourNum = 0;
    
    if (format === '12h') {
      if (hourNum < 1) hourNum = 1;
      if (hourNum > 12) hourNum = 12;
    } else {
      if (hourNum < 0) hourNum = 0;
      if (hourNum > 23) hourNum = 23;
    }
    
    // Validate minute
    let minuteNum = parseInt(m, 10);
    if (isNaN(minuteNum)) minuteNum = 0;
    if (minuteNum < 0) minuteNum = 0;
    if (minuteNum > 59) minuteNum = 59;
    
    // Format hour and minute with leading zeros
    const formattedHour = hourNum.toString().padStart(2, '0');
    const formattedMinute = minuteNum.toString().padStart(2, '0');
    
    const formattedValue = format === '12h'
      ? `${formattedHour}:${formattedMinute} ${p}`
      : `${formattedHour}:${formattedMinute}`;
    
    onChange?.(formattedValue);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = e.target.value;
    setHour(h);
    updateValue(h, minute, period);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = e.target.value;
    setMinute(m);
    updateValue(hour, m, period);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = e.target.value as 'AM' | 'PM';
    setPeriod(p);
    updateValue(hour, minute, p);
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <input
        type="number"
        value={hour}
        onChange={handleHourChange}
        placeholder={hourPlaceholder}
        min={format === '12h' ? 1 : 0}
        max={format === '12h' ? 12 : 23}
        className="w-12 rounded-md border border-input px-2 py-1 text-center"
      />
      <span>:</span>
      <input
        type="number"
        value={minute}
        onChange={handleMinuteChange}
        placeholder={minutePlaceholder}
        min={0}
        max={59}
        className="w-12 rounded-md border border-input px-2 py-1 text-center"
      />
      
      {format === '12h' && (
        <select
          value={period}
          onChange={handlePeriodChange}
          className="rounded-md border border-input px-2 py-1"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      )}
    </div>
  );
} 