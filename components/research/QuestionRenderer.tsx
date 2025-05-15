/**
 * QuestionRenderer
 * 
 * A component that renders different types of survey questions based on question type,
 * with validation and error handling.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; 
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form, FormField } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField as FormFieldType } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  config?: Record<string, any>;
}

/**
 * Props for QuestionRenderer component
 */
export interface QuestionRendererProps {
  /** The form field to render */
  field: FormFieldType;
  /** Current value for the field */
  value: any;
  /** Change handler */
  onChange: (value: any) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Renders different question types based on field configuration
 */
export function QuestionRenderer({ field, value, onChange }: QuestionRendererProps) {
  const { id, label, type, options, required } = field;

  // Render different input types based on field type
  switch (type) {
    case 'text': {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </div>
      );
    }

    case 'textarea': {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </div>
      );
    }

    case 'select': {
      const selectOptions = Array.isArray(options) 
        ? options 
        : [];

      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <Select
            value={value || ''}
            onValueChange={onChange}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem 
                  key={option.value || option} 
                  value={option.value || option}
                >
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    case 'radio': {
      const radioOptions = Array.isArray(options) 
        ? options 
        : [];

      return (
        <div className="space-y-2">
          <Label>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
          >
            {radioOptions.map((option) => (
              <div key={option.value || option} className="flex items-center space-x-2">
                <RadioGroupItem
                  id={`${id}-${option.value || option}`}
                  value={option.value || option}
                />
                <Label htmlFor={`${id}-${option.value || option}`}>
                  {option.label || option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    case 'checkbox': {
      const checkboxOptions = Array.isArray(options) 
        ? options 
        : [];
      
      // Single checkbox
      if (checkboxOptions.length === 0) {
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={!!value}
              onCheckedChange={onChange}
            />
            <Label htmlFor={id}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
          </div>
        );
      }
      
      // Multiple checkboxes
      return (
        <div className="space-y-2">
          <Label>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <div className="space-y-2">
            {checkboxOptions.map((option) => {
              const optionValue = option.value || option;
              const optionLabel = option.label || option;
              const isChecked = Array.isArray(value) 
                ? value.includes(optionValue) 
                : false;

              return (
                <div key={optionValue} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${optionValue}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (!Array.isArray(value)) {
                        onChange(checked ? [optionValue] : []);
                      } else if (checked) {
                        onChange([...value, optionValue]);
                      } else {
                        onChange(value.filter((v: string) => v !== optionValue));
                      }
                    }}
                  />
                  <Label htmlFor={`${id}-${optionValue}`}>{optionLabel}</Label>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'rating': {
      const ratingMax = field.config?.max || 5;
      const ratingOptions = Array.from({ length: ratingMax }, (_, i) => i + 1);
      
      return (
        <div className="space-y-2">
          <Label>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <div className="flex space-x-2 justify-center">
            {ratingOptions.map((rating) => (
              <button
                key={rating}
                type="button"
                className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${value === rating 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                  }`}
                onClick={() => onChange(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Fallback for unknown types
    default: {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          <p className="text-sm text-muted-foreground">
            (Unknown field type: {type})
          </p>
        </div>
      );
    }
  }
}
