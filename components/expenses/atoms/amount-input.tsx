/**
 * Amount Input (Atom)
 *
 * A specialized input field for entering currency amounts with proper formatting
 * and validation.
 *
 * @module expenses/atoms
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface AmountInputProps {
  /** Current value of the input */
  value: number | string;
  /** Callback for when the value changes */
  onChange: (value: number) => void;
  /** Currency symbol to display */
  currency?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Error message to display */
  error?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a number as a currency string without the currency symbol
 */
const formatAmount = (value: number): string => {
  return value.toFixed(2);
};

/**
 * Parse a string into a number, handling commas and other formatting
 */
const parseAmount = (value: string): number => {
  // Remove currency symbol, commas, and other non-numeric characters (except period)
  const cleanedValue = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AmountInput({
  value,
  onChange,
  currency = '$',
  placeholder = '0.00',
  disabled = false,
  className,
  error,
}: AmountInputProps) {
  // Convert the value to a string for input display
  const [inputValue, setInputValue] = useState<string>(
    typeof value === 'number' ? formatAmount(value) : value.toString()
  );

  // Update the input value when the external value changes
  useEffect(() => {
    if (typeof value === 'number') {
      setInputValue(formatAmount(value));
    } else if (typeof value === 'string' && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Handle changes to the input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only call onChange with a valid number
    if (newValue !== '') {
      const numericValue = parseAmount(newValue);
      onChange(numericValue);
    } else {
      onChange(0);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="absolute left-3 text-gray-500 pointer-events-none">
          {currency}
        </div>
        <Input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-6', // Make space for currency symbol
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 