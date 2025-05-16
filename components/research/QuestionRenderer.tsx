/**
 * QuestionRenderer
 * 
 * A component that renders different types of survey questions based on question type,
 * with validation and error handling.
 */

'use client';

import React, { useState } from 'react';
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
  question: SurveyField;
  response?: string | number | boolean | Array<string | number>;
  onChange: (value: string | number | boolean | Array<string | number>) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component that renders different types of survey questions
 * Supports text, textarea, select, radio, checkbox, and rating questions
 */
export function QuestionRenderer({ question, response, onChange }: QuestionRendererProps) {
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
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  // Text input question
  const renderTextQuestion = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor={question.id}>{question.label}</Label>
        <Input
          id={question.id}
          value={(response as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here"
          className="w-full"
        />
      </div>
    );
  };

  // Textarea question
  const renderTextareaQuestion = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor={question.id}>{question.label}</Label>
        <Textarea
          id={question.id}
          value={(response as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here"
          className="w-full min-h-[100px]"
        />
      </div>
    );
  };

  // Select dropdown question
  const renderSelectQuestion = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor={question.id}>{question.label}</Label>
        <Select
          value={(response as string) || ''}
          onValueChange={(value) => onChange(value)}
        >
          <SelectTrigger id={question.id} className="w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option) => (
              <SelectItem key={String(option)} value={String(option)}>
                {String(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <div className="space-y-3">
        <Label>{question.label}</Label>
        <div className="flex flex-col space-y-2">
          {question.options?.map((option) => (
            <div key={String(option)} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option}`}
                checked={selectedValues.includes(String(option))}
                onCheckedChange={() => toggleOption(option)}
              />
              <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                {String(option)}
              </Label>
            </div>
          ))}
        </div>
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

  return (
    <div className="py-2">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </h3>
      </div>
      {renderQuestionByType()}
    </div>
  );
}
