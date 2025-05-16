/**
 * @deprecated This component has been moved to components/ui/features/user-testing/molecules/QuestionRenderer.tsx
 * Please import from '@/components/ui/features/user-testing/molecules/QuestionRenderer' instead.
 * This file will be removed in a future update.
 */

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
import { SurveyField } from './SurveyContainer';
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

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component that renders different types of survey questions
 * Supports text, textarea, select, radio, checkbox, and rating questions
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

  // Select dropdown question
  const renderSelectQuestion = () => {
    return (
      <div className="space-y-4 w-full">
        <div>
          <Label className="font-medium text-base">
            {question.label}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
        <RadioGroup
          value={response as string}
          onValueChange={onChange}
          className="space-y-3"
          aria-required={question.required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        >
          {question.options?.map((option) => (
            <div 
              key={option} 
              className={cn(
                "flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors", 
                response === option && "border-primary bg-primary/5"
              )}
              onBlur={handleBlur}
            >
              <RadioGroupItem 
                value={option} 
                id={`question-${question.id}-${option}`} 
              />
              <Label 
                htmlFor={`question-${question.id}-${option}`}
                className="flex-grow cursor-pointer"
              >
                {option}
              </Label>
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
        {showValidation && isValid && response && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-500 text-sm mt-1 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> Response saved
          </motion.p>
        )}
      </div>
    );
  };

  // Radio button question
  const renderRadioQuestion = () => {
    return (
      <div className="space-y-3">
        <Label>{question.label}</Label>
        <RadioGroup
          value={(response as string) || ''}
          onValueChange={(value) => onChange(value)}
          className="flex flex-col space-y-2"
        >
          {question.options?.map((option) => (
            <div key={String(option)} className="flex items-center space-x-2">
              <RadioGroupItem value={String(option)} id={`${question.id}-${option}`} />
              <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                {String(option)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // Checkbox question (multiple selection)
  const renderCheckboxQuestion = () => {
    // Ensure response is an array
    const selectedValues = Array.isArray(response) ? response : [];
    
    // Toggle option in selected values
    const toggleOption = (option: string | number) => {
      const optionStr = String(option);
      if (selectedValues.includes(optionStr)) {
        onChange(selectedValues.filter(item => item !== optionStr));
      } else {
        onChange([...selectedValues, optionStr]);
      }
    };

    return (
      <div className="space-y-4 w-full">
        <div>
          <Label className="font-medium text-base">
            {question.label}
            {question.required && <span className="text-destructive ml-1">*</span>}
            <p className="text-muted-foreground text-sm font-normal mt-1">
              Select all that apply
            </p>
          </Label>
        </div>
        
        <div 
          className="space-y-3"
          onBlur={handleBlur}
          aria-required={question.required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        >
          {question.options?.map((option) => (
            <div 
              key={option}
              className={cn(
                "flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors",
                selectedValues.includes(option) && "border-primary bg-primary/5"
              )}
            >
              <Checkbox
                id={`question-${question.id}-${option}`}
                checked={selectedValues.includes(String(option))}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, String(option)]);
                  } else {
                    onChange(selectedValues.filter((item) => item !== String(option)));
                  }
                }}
              />
              <Label 
                htmlFor={`question-${question.id}-${option}`}
                className="flex-grow cursor-pointer"
              >
                {String(option)}
              </Label>
            </div>
          ))}
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
        {showValidation && isValid && selectedValues.length > 0 && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-500 text-sm mt-1 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> Selections saved
          </motion.p>
        )}
      </div>
    );
  };

  // Rating question (e.g., 1-5 or 0-10)
  const renderRatingQuestion = () => {
    return (
      <div className="space-y-3">
        <Label>{question.label}</Label>
        <div className="flex items-center justify-between gap-2">
          {question.options?.map((option) => (
            <button
              key={String(option)}
              type="button"
              className={`flex items-center justify-center h-10 w-10 rounded-full border
                ${Number(response) === option 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => onChange(Number(option))}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-between px-1 text-xs text-muted-foreground">
          <span>Not at all likely</span>
          <span>Very likely</span>
        </div>
      </div>
    );
  };

  // Boolean question
  const renderBooleanQuestion = () => {
    return (
      <div className="space-y-4 w-full">
        <div 
          className="flex flex-row items-center justify-between rounded-lg border p-4"
          onBlur={handleBlur}
        >
          <div className="space-y-0.5">
            <Label 
              htmlFor={`question-${question.id}`}
              className="font-medium text-base"
            >
              {question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
          <Switch
            id={`question-${question.id}`}
            checked={response as boolean || false}
            onCheckedChange={onChange}
            aria-required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
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
    <div className="space-y-4">
      {renderQuestionByType()}
    </div>
  );
}
