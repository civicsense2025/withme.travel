'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Check, X } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

// Types
import {
  FeedbackForm,
  Question,
  QuestionType,
  ResponseValue,
  SubmitResponsesSchema,
} from './types';

// Animation variants
const questionVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 40 : -40,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -40 : 40,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Create schema for the form
const createResponseSchema = (questions: Question[]) => {
  const schema: Record<string, any> = {};

  questions.forEach((question) => {
    const fieldName = `question_${question.id}`;

    let fieldSchema;
    switch (question.type) {
      case QuestionType.SHORT_TEXT:
      case QuestionType.LONG_TEXT:
        fieldSchema = z.string();
        break;
      case QuestionType.EMAIL:
        fieldSchema = z.string().email('Please enter a valid email address');
        break;
      case QuestionType.SINGLE_CHOICE:
        fieldSchema = z.string();
        break;
      case QuestionType.MULTIPLE_CHOICE:
        fieldSchema = z.array(z.string()).min(1, 'Please select at least one option');
        break;
      case QuestionType.YES_NO:
        fieldSchema = z.boolean();
        break;
      case QuestionType.RATING:
        fieldSchema = z.number().min(1);
        break;
      case QuestionType.NPS:
        fieldSchema = z.number().min(0).max(10);
        break;
      default:
        fieldSchema = z.any();
    }

    // Add required validation if needed
    if (question.isRequired) {
      if (fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(1, 'This field is required');
      } else if (fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.optional().refine((val) => val !== undefined, {
          message: 'This field is required',
        });
      }
    } else {
      // Make the field optional
      fieldSchema = fieldSchema.optional();
    }

    schema[fieldName] = fieldSchema;
  });

  return z.object(schema);
};

interface FeedbackFormRendererProps {
  form: FeedbackForm;
  questions: Question[];
  onSubmit: (responses: {
    formId: string;
    responses: { questionId: string; value: ResponseValue }[];
  }) => Promise<void>;
  onClose?: () => void;
}

export function FeedbackFormRenderer({
  form,
  questions,
  onSubmit,
  onClose,
}: FeedbackFormRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});

  // Sort questions by position
  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);

  // Initialize form with dynamic schema
  const responseSchema = createResponseSchema(sortedQuestions);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm({
    resolver: zodResolver(responseSchema),
  });

  // Get current question
  const currentQuestion = sortedQuestions[currentQuestionIndex];

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / sortedQuestions.length) * 100;

  const handleNext = async () => {
    // Validate current question
    const fieldName = `question_${currentQuestion.id}`;
    const fieldValue = getValues(fieldName);

    // Store response
    if (fieldValue !== undefined) {
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: fieldValue,
      }));
    }

    // If last question, submit form
    if (currentQuestionIndex === sortedQuestions.length - 1) {
      await handleFormSubmit();
      return;
    }

    // Move to next question
    setDirection(1);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Format responses for API
      const formattedResponses = Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      // Submit responses
      await onSubmit({
        formId: form.id,
        responses: formattedResponses,
      });

      // Show completion state
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const fieldName = `question_${question.id}`;
    const fieldError = errors[fieldName];

    switch (question.type) {
      case QuestionType.SHORT_TEXT:
        return (
          <div className="space-y-2">
            <Input
              id={fieldName}
              placeholder={question.placeholder || ''}
              maxLength={(question as any).maxCharacterCount}
              {...register(fieldName)}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.LONG_TEXT:
        return (
          <div className="space-y-2">
            <Textarea
              id={fieldName}
              placeholder={question.placeholder || ''}
              maxLength={(question as any).maxCharacterCount}
              className="min-h-[100px]"
              {...register(fieldName)}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.EMAIL:
        return (
          <div className="space-y-2">
            <Input
              id={fieldName}
              type="email"
              placeholder={question.placeholder || 'your@email.com'}
              {...register(fieldName)}
            />
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-4">
            <RadioGroup
              name={fieldName}
              value={getValues(fieldName)}
              onChange={(value: string) => setValue(fieldName, value)}
              defaultValue={getValues(fieldName)}
            >
              {(question as any).options?.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value || option.label}
                    id={`${fieldName}-${option.id}`}
                  />
                  <Label htmlFor={`${fieldName}-${option.id}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-4">
            {(question as any).options?.map((option: any) => {
              const currentValues = getValues(fieldName) || [];
              const value = option.value || option.label;
              const isChecked = currentValues.includes(value);
              
              return (
                <div key={option.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`${fieldName}-${option.id}`}
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue(fieldName, [...currentValues, value]);
                      } else {
                        setValue(
                          fieldName,
                          currentValues.filter((val: string) => val !== value)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${fieldName}-${option.id}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              );
            })}
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.YES_NO:
        return (
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={getValues(fieldName) === true ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue(fieldName, true)}
            >
              <Check className="mr-2 h-4 w-4" />
              Yes
            </Button>
            <Button
              type="button"
              variant={getValues(fieldName) === false ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue(fieldName, false)}
            >
              <X className="mr-2 h-4 w-4" />
              No
            </Button>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.RATING:
        const ratingScale = (question as any).ratingScale || 5;
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              {Array.from({ length: ratingScale }, (_, i) => i + 1).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={getValues(fieldName) === value ? 'default' : 'outline'}
                  size="sm"
                  className="h-10 w-10"
                  onClick={() => setValue(fieldName, value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      case QuestionType.NPS:
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              {Array.from({ length: 11 }, (_, i) => i).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={getValues(fieldName) === value ? 'default' : 'outline'}
                  size="sm"
                  className="h-10 w-10"
                  onClick={() => setValue(fieldName, value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>
            {fieldError && (
              <p className="text-sm text-destructive">{fieldError.message as string}</p>
            )}
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  const renderCompletionScreen = () => (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto rounded-full bg-primary/10 p-4 w-20 h-20 flex items-center justify-center">
        <Check className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Thank You!</h3>
        <p className="text-muted-foreground">
          {form.completionMessage || 'Your feedback has been submitted successfully.'}
        </p>
      </div>
      <Button onClick={onClose} className="mt-6">
        Close
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      {!isCompleted ? (
        <>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            {form.description && <CardDescription>{form.description}</CardDescription>}
            {form.showProgressBar && <Progress value={progress} className="h-1 mt-2" />}
          </CardHeader>
          <CardContent>
            <form id="feedback-form" onSubmit={handleSubmit(handleFormSubmit)}>
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  custom={direction}
                  variants={questionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium">{currentQuestion.title}</h3>
                  {currentQuestion.description && (
                    <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
                  )}
                  {renderQuestionInput(currentQuestion)}
                </motion.div>
              </AnimatePresence>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button type="button" onClick={handleNext} disabled={isSubmitting} size="sm">
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="mr-2">Submitting</span>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                </span>
              ) : currentQuestionIndex === sortedQuestions.length - 1 ? (
                'Submit'
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </>
      ) : (
        renderCompletionScreen()
      )}
    </Card>
  );
}
