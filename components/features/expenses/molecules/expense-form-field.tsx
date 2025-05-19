/**
 * Expense Form Field (Molecule)
 *
 * A specialized form field component for expense forms with
 * validation and consistent styling.
 *
 * @module expenses/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AmountInput } from '../atoms/amount-input';
import { CurrencySelector } from '../atoms/currency-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ExpenseCategory } from '../atoms/expense-category-badge';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type FieldType = 'text' | 'amount' | 'date' | 'category' | 'currency';

export interface ExpenseFormFieldProps {
  /** Label for the field */
  label: string;
  /** Type of field to render */
  type: FieldType;
  /** Current value of the field */
  value: any;
  /** Callback for when value changes */
  onChange: (value: any) => void;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** ID for the field */
  id?: string;
}

// ============================================================================
// CATEGORY OPTIONS
// ============================================================================

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food', label: 'Food' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'activities', label: 'Activities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'flights', label: 'Flights' },
  { value: 'fees', label: 'Fees' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExpenseFormField({
  label,
  type,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  className,
  id,
}: ExpenseFormFieldProps) {
  // Create a unique ID for the field if not provided
  const fieldId = id || `expense-field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Render the appropriate field based on type
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
          />
        );
        
      case 'amount':
        return (
          <AmountInput
            value={value || 0}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
          />
        );
        
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  error && 'border-red-500 focus-visible:ring-red-500'
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>{placeholder || 'Select date'}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        
      case 'category':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
            >
              <SelectValue placeholder={placeholder || 'Select category'} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'currency':
        return (
          <CurrencySelector
            value={value || 'USD'}
            onChange={onChange}
            disabled={disabled}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
            placeholder={placeholder}
          />
        );
        
      default:
        return (
          <Input
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        className={cn(
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </Label>
      
      {renderField()}
      
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
} 