/**
 * Currency Selector (Atom)
 *
 * A dropdown selector for choosing different currencies with symbols 
 * and proper formatting.
 *
 * @module expenses/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface CurrencySelectorProps {
  /** Currently selected currency */
  value: string;
  /** Callback for when currency changes */
  onChange: (value: string) => void;
  /** List of available currencies */
  currencies?: Currency[];
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

// ============================================================================
// DEFAULT CURRENCIES
// ============================================================================

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CurrencySelector({
  value,
  onChange,
  currencies = DEFAULT_CURRENCIES,
  disabled = false,
  className,
  placeholder = 'Select currency',
}: CurrencySelectorProps) {
  // Find the currently selected currency object
  const selectedCurrency = currencies.find((c) => c.code === value);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger 
        className={cn(
          'w-[120px]',
          className
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selectedCurrency ? (
            <span className="flex items-center">
              <span className="mr-1">{selectedCurrency.symbol}</span>
              <span>{selectedCurrency.code}</span>
            </span>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <span className="flex items-center">
              <span className="mr-2">{currency.symbol}</span>
              <span className="font-medium">{currency.code}</span>
              <span className="text-muted-foreground ml-2 text-xs">
                {currency.name}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 