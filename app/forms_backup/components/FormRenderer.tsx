'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Send,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Rating } from '@/components/ui/rating';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Types
import {
  Form,
  Question,
  Response,
  ResponseSession,
  QuestionType,
  ConditionalLogic,
} from '../FormTypes';

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
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -40 : 40,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Create a schema for the form data
const createFormResponseSchema = (questions: Question[]) => {
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
      case QuestionType.NUMBER:
        fieldSchema = z.number();
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
      case QuestionType.DATE:
        fieldSchema = z.date();
        break;
      case QuestionType.RATING:
        fieldSchema = z.number().min(1);
        break;
      default:
        fieldSchema = z.any();
    }

    // Add required validation if needed
    if (question.isRequired) {
      if (fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(1, 'This field is required');
      } else if (fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.min(0, 'This field is required');
      }
    } else {
      // Make the field optional
      fieldSchema = fieldSchema.optional();
    }

    schema[fieldName] = fieldSchema;
  });

  return z.object(schema);
};

interface FormRendererProps {
  form: Form;
  questions: Question[];
  sessionId?: string;
  onSubmit?: (responses: Record<string, any>, sessionId: string) => Promise<void>;
  onProgress?: (progress: number) => void;
}

export function FormRenderer({
  form,
  questions,
  sessionId,
  onSubmit,
  onProgress,
}: FormRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [localSessionId] = useState(sessionId || crypto.randomUUID());
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const [responses, setResponses] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Sort questions by position
  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);

  // Initialize form with dynamic schema
  const responseSchema = createFormResponseSchema(sortedQuestions);
  const formMethods = useForm<FieldValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {},
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    trigger,
    reset,
  } = formMethods;

  // Get current question
  const currentQuestion = sortedQuestions[currentQuestionIndex];

  // Reset question start time when question changes
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / sortedQuestions.length) * 100;

  // Update progress callback
  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  // Scroll to top when question changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [currentQuestionIndex]);

  // Check if the current question should be shown based on conditional logic
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;

    const { questionId, operator, value } = question.conditionalLogic;
    const dependencyValue = responses[`question_${questionId}`];

    if (dependencyValue === undefined) return true;

    switch (operator) {
      case 'equals':
        return dependencyValue === value;
      case 'not_equals':
        return dependencyValue !== value;
      case 'contains':
        return dependencyValue?.includes(value) || false;
      case 'not_contains':
        return !dependencyValue?.includes(value);
      case 'greater_than':
        return dependencyValue > value;
      case 'less_than':
        return dependencyValue < value;
      case 'starts_with':
        return dependencyValue?.startsWith(value) || false;
      case 'ends_with':
        return dependencyValue?.endsWith(value) || false;
      default:
        return true;
    }
  };

  // Get next question index, considering conditional logic
  const getNextQuestionIndex = (currentIndex: number) => {
    for (let i = currentIndex + 1; i < sortedQuestions.length; i++) {
      if (shouldShowQuestion(sortedQuestions[i])) {
        return i;
      }
    }

    // If no more questions, return -1
    return -1;
  };

  // Get previous question index, considering conditional logic
  const getPreviousQuestionIndex = (currentIndex: number) => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (shouldShowQuestion(sortedQuestions[i])) {
        return i;
      }
    }

    // If no previous questions, return current index
    return currentIndex;
  };

  // Move handleFormSubmit declaration before its first use
  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate entire form
      const formValues = getValues();

      // Calculate total time
      const endTime = new Date();
      const totalTime = (endTime.getTime() - startTime.getTime()) / 1000;

      // Prepare final response data
      const finalResponses = {
        ...responses,
        _totalTime: totalTime,
        _completedAt: new Date().toISOString(),
      };

      // Call onSubmit callback
      if (onSubmit) {
        await onSubmit(finalResponses, localSessionId);
      }

      // Show success message
      toast({
        title: 'Form Submitted',
        description: 'Thank you for completing this form!',
      });

      // Mark as completed
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting form:', error);

      toast({
        title: 'Submission Error',
        description: 'There was an error submitting your form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle next question or form submission
  const handleNext = useCallback(async () => {
    // Validate current question if required
    if (currentQuestion?.isRequired) {
      const fieldName = `question_${currentQuestion.id}`;
      const isValid = await trigger(fieldName);

      if (!isValid) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in this field before continuing.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Store response time
    const endTime = new Date();
    const responseTime = (endTime.getTime() - questionStartTime.getTime()) / 1000;

    // Get current values
    const formValues = getValues();
    const fieldName = `question_${currentQuestion.id}`;
    const response = formValues[fieldName];

    // Store response
    setResponses((prev) => ({
      ...prev,
      [fieldName]: response,
      [`${fieldName}_time`]: responseTime,
    }));

    // Move to next question
    const nextIndex = getNextQuestionIndex(currentQuestionIndex);

    if (nextIndex === -1) {
      // No more questions, submit form
      await handleFormSubmit();
    } else {
      setDirection(1);
      setCurrentQuestionIndex(nextIndex);
    }
  }, [
    currentQuestion,
    trigger,
    toast,
    questionStartTime,
    getValues,
    setResponses,
    getNextQuestionIndex,
    currentQuestionIndex,
    handleFormSubmit,
    setDirection,
    setCurrentQuestionIndex,
  ]);

  // Handle going to previous question
  const handlePrevious = () => {
    const prevIndex = getPreviousQuestionIndex(currentQuestionIndex);
    if (prevIndex >= 0) {
      setDirection(-1);
      setCurrentQuestionIndex(prevIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isCompleted) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, isCompleted, handleNext]);

  // Render input for current question
  const renderQuestionInput = (question: Question) => {
    const fieldName = `question_${question.id}`;
    const errorMessage = errors[fieldName]?.message as string;

    switch (question.type) {
      case QuestionType.SHORT_TEXT:
        return (
          <Input
            {...formMethods.register(fieldName)}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="w-full text-lg p-4 mt-4"
          />
        );

      case QuestionType.LONG_TEXT:
        return (
          <Textarea
            {...formMethods.register(fieldName)}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="w-full text-lg p-4 mt-4 min-h-[150px]"
          />
        );

      case QuestionType.EMAIL:
        return (
          <Input
            {...formMethods.register(fieldName)}
            type="email"
            placeholder={question.placeholder || 'Enter your email address...'}
            className="w-full text-lg p-4 mt-4"
          />
        );

      case QuestionType.NUMBER:
        return (
          <Input
            {...formMethods.register(fieldName, { valueAsNumber: true })}
            type="number"
            placeholder={question.placeholder || 'Enter a number...'}
            className="w-full text-lg p-4 mt-4"
          />
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <RadioGroup
            className="mt-6 space-y-3"
            onValueChange={(value) => setValue(fieldName, value)}
            value={formMethods.getValues(fieldName)}
          >
            {question.options?.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="flex-grow cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="mt-6 space-y-3">
            {question.options?.map((option) => {
              const currentValues = (formMethods.getValues(fieldName) as string[]) || [];
              return (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={option.id}
                    checked={currentValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValue(fieldName, [...currentValues, option.value]);
                      } else {
                        setValue(
                          fieldName,
                          currentValues.filter((v: string) => v !== option.value)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case QuestionType.YES_NO:
        return (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={formMethods.getValues(fieldName) === true ? 'default' : 'outline'}
              className="p-6 h-auto"
              onClick={() => setValue(fieldName, true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={formMethods.getValues(fieldName) === false ? 'default' : 'outline'}
              className="p-6 h-auto"
              onClick={() => setValue(fieldName, false)}
            >
              No
            </Button>
          </div>
        );

      case QuestionType.DATE:
        return (
          <div className="mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left p-4 h-auto text-lg"
                >
                  {formMethods.getValues(fieldName) ? (
                    formMethods.getValues(fieldName).toLocaleDateString()
                  ) : (
                    <span className="text-muted-foreground">
                      {question.placeholder || 'Select a date...'}
                    </span>
                  )}
                  <CalendarIcon className="ml-auto h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formMethods.getValues(fieldName)}
                  onSelect={(date) => setValue(fieldName, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case QuestionType.RATING:
        return (
          <div className="flex flex-col items-center space-y-2">
            <div className="text-center text-lg font-medium">{question.description || question.title}</div>
            <Rating
              value={formMethods.getValues(fieldName) || 0}
              onChange={(value) => setValue(fieldName, value)}
              max={question.ratingScale || 5}
              className="justify-center"
              size="lg"
              readOnly={false}
            />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
          </div>
        );

      case QuestionType.STATEMENT:
        return (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-lg">{question.description}</p>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  // Render completion screen
  const renderCompletionScreen = () => {
    return (
      <div className="text-center py-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
        <p className="text-muted-foreground mb-6">
          {form.completionMessage || 'Your response has been submitted successfully.'}
        </p>
      </div>
    );
  };

  return (
    <div className="md:container max-w-5xl mx-auto px-4 py-6">
      <div
        className="min-h-[460px] relative"
        style={{
          fontFamily: form.fontFamily || 'Inter',
        }}
      >
        {/* Progress bar */}
        {form.showProgressBar && !isCompleted && (
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>
                Question {currentQuestionIndex + 1} of {sortedQuestions.length}
              </span>
              <span>{Math.round(progress)}% completed</span>
            </div>
          </div>
        )}

        {/* Question content */}
        <div ref={contentRef} className="overflow-y-auto max-h-[calc(100vh-280px)] pb-20">
          {isCompleted ? (
            renderCompletionScreen()
          ) : (
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentQuestionIndex}
                custom={direction}
                variants={questionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">
                      {form.showQuestionNumbers && (
                        <span className="text-muted-foreground mr-2">
                          {currentQuestionIndex + 1}.
                        </span>
                      )}
                      {currentQuestion.title}
                    </CardTitle>
                    {currentQuestion.description && (
                      <CardDescription className="text-base mt-1">
                        {currentQuestion.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderQuestionInput(currentQuestion)}
                    {errors[`question_${currentQuestion.id}`] && (
                      <p className="text-destructive mt-2 text-sm">
                        {errors[`question_${currentQuestion.id}`]?.message as string}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Navigation buttons */}
        {!isCompleted && (
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button type="button" onClick={handleNext} disabled={isSubmitting} className="gap-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentQuestionIndex === sortedQuestions.length - 1 ? (
                <>
                  <Send className="h-4 w-4" />
                  Submit
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
