'use client';

import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FeedbackType, FormStatus, QuestionType, type Question } from './types';
import { FeedbackFormRenderer } from './FeedbackForm';
import { MessageSquare, Lightbulb, Bug, HelpCircle } from 'lucide-react';

// Types for the feedback forms used throughout the site
export type FeedbackFormTemplate = {
  id: string;
  title: string;
  description: string;
  formType: FeedbackType;
  icon: React.ReactNode;
  questions: Question[];
  completionMessage: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonIcon?: React.ReactNode;
  buttonClassName?: string;
  placement?: 'inline' | 'floating';
};

// Generic feedback form template for use throughout the app
export const GENERAL_FEEDBACK_FORM: FeedbackFormTemplate = {
  id: 'general-feedback',
  title: 'Help Us Improve',
  description: 'We value your feedback to make withme.travel better!',
  formType: FeedbackType.IN_APP,
  icon: <MessageSquare className="h-5 w-5" />,
  buttonText: 'Feedback',
  buttonVariant: 'ghost',
  buttonSize: 'sm',
  completionMessage:
    'Thanks for your feedback! We appreciate your help in making our platform better.',
  questions: [
    {
      id: 'feedback-type',
      formId: 'general-feedback',
      title: 'What type of feedback do you have?',
      isRequired: true,
      type: QuestionType.SINGLE_CHOICE,
      position: 0,
      options: [
        { id: 'suggestion', label: 'Suggestion', value: 'suggestion' },
        { id: 'bug', label: 'Bug Report', value: 'bug' },
        { id: 'question', label: 'Question', value: 'question' },
        { id: 'other', label: 'Other', value: 'other' },
      ],
    },
    {
      id: 'feedback-message',
      formId: 'general-feedback',
      title: 'Tell us more',
      description: 'Please provide as much detail as possible',
      isRequired: true,
      type: QuestionType.LONG_TEXT,
      position: 1,
      placeholder: 'Your feedback helps us improve...',
    },
    {
      id: 'email',
      formId: 'general-feedback',
      title: 'Your email (optional)',
      description: "If you'd like us to follow up with you",
      isRequired: false,
      type: QuestionType.EMAIL,
      position: 2,
      placeholder: 'email@example.com',
    },
  ],
};

// Trips feedback form template focused on trip planning experience
export const TRIPS_FEEDBACK_FORM: FeedbackFormTemplate = {
  id: 'trips-feedback',
  title: 'Trip Planning Feedback',
  description: 'Help us improve your trip planning experience!',
  formType: FeedbackType.FEATURE,
  icon: <MessageSquare className="h-5 w-5" />,
  buttonText: 'Feedback',
  buttonVariant: 'ghost',
  buttonSize: 'sm',
  completionMessage:
    "Thanks for your feedback! We'll use it to improve the trip planning experience.",
  questions: [
    {
      id: 'satisfaction',
      formId: 'trips-feedback',
      title: 'How satisfied are you with the trip planning experience?',
      description: 'Rate your overall satisfaction with planning trips on our platform',
      isRequired: true,
      type: QuestionType.RATING,
      position: 0,
      ratingScale: 5,
    },
    {
      id: 'ease-of-use',
      formId: 'trips-feedback',
      title: 'How easy was it to create and manage your trips?',
      isRequired: true,
      type: QuestionType.RATING,
      position: 1,
      ratingScale: 5,
    },
    {
      id: 'missing-features',
      formId: 'trips-feedback',
      title: 'What features would you like to see added to trip planning?',
      isRequired: false,
      type: QuestionType.LONG_TEXT,
      position: 2,
      placeholder: 'Please share your suggestions here...',
    },
  ],
};

interface FeedbackFormWrapperProps extends ButtonProps {
  formTemplate: FeedbackFormTemplate;
  children?: React.ReactNode;
  placement?: 'inline' | 'floating';
  buttonClassName?: string;
}

export function FeedbackFormWrapper({
  formTemplate,
  children,
  className,
  placement = 'inline',
  buttonClassName,
  ...props
}: FeedbackFormWrapperProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const handleSubmit = async (data: {
    formId: string;
    responses: { questionId: string; value: any }[];
  }) => {
    try {
      // Send feedback data to API
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Show success toast
      toast({
        children: (
          <>
            <div className="font-bold">Feedback submitted</div>
            <div>Thank you for your feedback!</div>
          </>
        ),
      });

      // Close dialog after a short delay to show the completion screen
      setTimeout(() => setOpen(false), 2000);

      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting feedback:', error);

      toast({
        children: (
          <>
            <div className="font-bold">Error submitting feedback</div>
            <div>Please try again later.</div>
          </>
        ),
        variant: 'destructive',
      });

      return Promise.reject(error);
    }
  };

  const form = {
    id: formTemplate.id,
    title: formTemplate.title,
    description: formTemplate.description,
    feedbackType: formTemplate.formType,
    status: FormStatus.ACTIVE,
    showProgressBar: true,
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    completionMessage: formTemplate.completionMessage,
  };

  const buttonProps = {
    variant: formTemplate.buttonVariant || 'ghost',
    size: formTemplate.buttonSize || 'sm',
    ...props,
  } as ButtonProps;

  const buttonContent = children || (
    <>
      {formTemplate.buttonIcon || formTemplate.icon}
      {formTemplate.buttonText && <span className="ml-2">{formTemplate.buttonText}</span>}
    </>
  );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          'text-muted-foreground hover:text-foreground transition-colors',
          formTemplate.buttonClassName,
          buttonClassName,
          className
        )}
        {...buttonProps}
      >
        {buttonContent}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{form.title}</DialogTitle>
          </DialogHeader>

          <FeedbackFormRenderer
            form={form}
            questions={formTemplate.questions}
            onSubmit={handleSubmit}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
