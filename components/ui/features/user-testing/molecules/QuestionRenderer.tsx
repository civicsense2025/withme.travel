/**
 * QuestionRenderer
 * 
 * A component that renders different types of survey questions based on question type,
 * with validation and error handling.
 */

'use client';

import React, { useState, useId } from 'react';
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
import { CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'boolean';

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
  question: SurveyField;
  response?: string | number | boolean | Array<string | number>;
  onChange: (value: string | number | boolean | Array<string | number>) => void;
  error?: string;
}

/**
 * Survey field definition for questions
 */
export interface SurveyField {
  id: string;
  milestone: string;
  label: string;
  type: string;
  options?: Array<string | number | any>;
  required: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component that renders different types of survey questions
 * Supports text, textarea, select, radio, checkbox, rating, and boolean questions
 */
export function QuestionRenderer({ question, response, onChange, error }: QuestionRendererProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [touched, setTouched] = useState(false);
  
  // Mark question as touched on blur
  const handleBlur = () => {
    setTouched(true);
  };
  
  // Determine if we should show validation states
  const showValidation = touched || !!response;
  const isValid = question.required ? !!response : true;
  
  // Helper to add validation styles to form elements
  const getValidationStyles = () => {
    if (!showValidation) return '';
    if (error) return 'border-destructive focus-visible:ring-destructive';
    if (isValid && response) return 'border-green-500 focus-visible:ring-green-500';
    return '';
  };

  // Handle rendering different question types
  const renderQuestionByType = () => {
    switch (question.type) {
      case 'text':
        return renderTextQuestion();
      case 'textarea':
        return renderTextareaQuestion();
      case 'select':
        return renderSelectQuestion();
      case 'radio':
        return renderRadioQuestion();
      case 'checkbox':
        return renderCheckboxQuestion();
      case 'rating':
        return renderRatingQuestion();
      case 'boolean':
        return renderBooleanQuestion();
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  // Text input question
  const renderTextQuestion = () => {
    return (
      <div className="space-y-2 w-full">
        <Label 
          htmlFor={`question-${question.id}`}
          className="font-medium text-base"
        >
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={`question-${question.id}`}
            type="text"
            value={response as string || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Type your answer here"
            className={cn(getValidationStyles())}
            aria-required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {showValidation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {error ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : isValid && response ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  // Textarea question
  const renderTextareaQuestion = () => {
    return (
      <div className="space-y-2 w-full">
        <Label 
          htmlFor={`question-${question.id}`}
          className="font-medium text-base"
        >
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="relative">
          <Textarea
            id={`question-${question.id}`}
            value={response as string || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Type your answer here"
            className={cn(getValidationStyles(), "min-h-32")}
            aria-required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {showValidation && isValid && response && (
            <div className="absolute right-3 top-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  // Select question
  const renderSelectQuestion = () => {
    const selectOptions = Array.isArray(question.options)
      ? question.options.map(opt => 
          typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
        )
      : [];

    return (
      <div className="space-y-2 w-full">
        <Label 
          htmlFor={`question-${question.id}`}
          className="font-medium text-base"
        >
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={(response as string) || ''}
          onValueChange={(value) => onChange(value)}
        >
          <SelectTrigger 
            id={`question-${question.id}`}
            className={cn(getValidationStyles())}
            onBlur={handleBlur}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  // Radio question
  const renderRadioQuestion = () => {
    const radioOptions = Array.isArray(question.options)
      ? question.options.map(opt => 
          typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
        )
      : [];

    return (
      <div className="space-y-4 w-full">
        <div className="font-medium text-base">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <RadioGroup
          value={(response as string) || ''}
          onValueChange={(value) => onChange(value)}
          onBlur={handleBlur}
          className="space-y-2"
        >
          {radioOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value.toString()} id={`option-${question.id}-${option.value}`} />
              <Label htmlFor={`option-${question.id}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  // Checkbox question
  const renderCheckboxQuestion = () => {
    const checkboxOptions = Array.isArray(question.options)
      ? question.options.map(opt => 
          typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
        )
      : [];
    
    // Function to toggle checkbox selection
    const toggleOption = (option: string | number) => {
      const currentSelections = Array.isArray(response) ? [...response] : [];
      const optionString = option.toString();
      
      if (currentSelections.includes(optionString)) {
        // Remove if already selected
        onChange(currentSelections.filter(item => item !== optionString));
      } else {
        // Add if not selected
        onChange([...currentSelections, optionString]);
      }
    };

    return (
      <div className="space-y-4 w-full">
        <div className="font-medium text-base">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <div className="space-y-2" onBlur={handleBlur}>
          {checkboxOptions.map((option) => {
            const isChecked = Array.isArray(response) && response.includes(option.value.toString());
            
            return (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${question.id}-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleOption(option.value)}
                />
                <Label htmlFor={`option-${question.id}-${option.value}`}>{option.label}</Label>
              </div>
            );
          })}
        </div>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  // Rating question
  const renderRatingQuestion = () => {
    // Default min and max if not specified
    const min = 1;
    const max = 5;
    
    return (
      <div className="space-y-6 w-full">
        <div className="font-medium text-base">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <div className="space-y-3" onBlur={handleBlur}>
          <Slider
            defaultValue={[response as number || min]}
            min={min}
            max={max}
            step={1}
            onValueChange={(values) => onChange(values[0])}
            className={cn(
              "cursor-pointer",
              error ? "border-destructive" : ""
            )}
          />
          <div className="flex justify-between px-1">
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(value => (
              <div key={value} className="flex flex-col items-center space-y-1">
                <span className={cn(
                  "inline-block w-6 h-6 rounded-full text-center text-sm leading-6",
                  response === value 
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                  {value}
                </span>
                <span className="text-xs">{value === min ? "Lowest" : value === max ? "Highest" : ""}</span>
              </div>
            ))}
          </div>
        </div>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  // Boolean question (Yes/No)
  const renderBooleanQuestion = () => {
    return (
      <div className="space-y-4 w-full">
        <div className="font-medium text-base">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <div className="flex items-center space-x-4" onBlur={handleBlur}>
          <div className="flex items-center space-x-2">
            <Switch
              id={`question-${question.id}-yes`}
              checked={response === true}
              onCheckedChange={() => onChange(true)}
            />
            <Label htmlFor={`question-${question.id}-yes`}>Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={`question-${question.id}-no`}
              checked={response === false}
              onCheckedChange={() => onChange(false)}
            />
            <Label htmlFor={`question-${question.id}-no`}>No</Label>
          </div>
        </div>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-destructive text-sm mt-1 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 py-2">
      {renderQuestionByType()}
    </div>
  );
} 