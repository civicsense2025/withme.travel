'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { FeedbackFormRenderer } from './FeedbackForm';
import { FeedbackForm, Question, FeedbackType, FormStatus, QuestionType } from './types';
import { Button } from '@/components/ui/button';

// Prebuilt form templates
const QUICK_FEEDBACK_FORM: FeedbackForm = {
  id: 'quick-feedback',
  title: 'Quick Feedback',
  description: 'Help us improve your experience with a quick feedback.',
  feedbackType: FeedbackType.IN_APP,
  status: FormStatus.ACTIVE,
  showProgressBar: true,
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  completionMessage: 'Thanks for your feedback! We appreciate your input.',
};

const QUICK_FEEDBACK_QUESTIONS: Question[] = [
  {
    id: 'rating',
    formId: 'quick-feedback',
    title: 'How would you rate your experience?',
    description: 'Please rate your overall experience with this feature',
    isRequired: true,
    type: QuestionType.RATING,
    position: 0,
    ratingScale: 5,
  },
  {
    id: 'feedback',
    formId: 'quick-feedback',
    title: 'What could we improve?',
    description: 'Please share any suggestions or issues you encountered',
    isRequired: false,
    type: QuestionType.LONG_TEXT,
    position: 1,
    placeholder: 'Share your thoughts here...',
    maxCharacterCount: 500,
  },
];

const EXIT_INTENT_FORM: FeedbackForm = {
  id: 'exit-intent',
  title: 'Before You Go...',
  description: 'We noticed you\'re leaving. Could you share some quick feedback?',
  feedbackType: FeedbackType.EXIT,
  status: FormStatus.ACTIVE,
  showProgressBar: true,
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const EXIT_INTENT_QUESTIONS: Question[] = [
  {
    id: 'exit-reason',
    formId: 'exit-intent',
    title: 'Why are you leaving?',
    description: 'This helps us understand how to improve',
    isRequired: true,
    type: QuestionType.SINGLE_CHOICE,
    position: 0,
    options: [
      { id: '1', label: 'I found what I needed' },
      { id: '2', label: 'I couldn\'t find what I was looking for' },
      { id: '3', label: 'The site was confusing' },
      { id: '4', label: 'I encountered an error' },
      { id: '5', label: 'Other reason' },
    ],
  },
  {
    id: 'exit-details',
    formId: 'exit-intent',
    title: 'Anything else you\'d like to share?',
    isRequired: false,
    type: QuestionType.LONG_TEXT,
    position: 1,
    placeholder: 'Tell us more (optional)',
  },
];

const FEATURE_FEEDBACK_FORM: FeedbackForm = {
  id: 'feature-feedback',
  title: 'Feature Feedback',
  description: 'Tell us what you think about this feature',
  feedbackType: FeedbackType.FEATURE,
  status: FormStatus.ACTIVE,
  showProgressBar: true,
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const FEATURE_FEEDBACK_QUESTIONS: Question[] = [
  {
    id: 'usefulness',
    formId: 'feature-feedback',
    title: 'How useful is this feature?',
    isRequired: true,
    type: QuestionType.RATING,
    position: 0,
    ratingScale: 5,
  },
  {
    id: 'ease-of-use',
    formId: 'feature-feedback',
    title: 'How easy was it to use?',
    isRequired: true,
    type: QuestionType.RATING,
    position: 1,
    ratingScale: 5,
  },
  {
    id: 'feature-suggestion',
    formId: 'feature-feedback',
    title: 'What could we improve about this feature?',
    isRequired: false,
    type: QuestionType.LONG_TEXT,
    position: 2,
    placeholder: 'Share your suggestions here...',
  },
];

const NPS_FEEDBACK_FORM: FeedbackForm = {
  id: 'nps-feedback',
  title: 'Would You Recommend Us?',
  description: 'We\'d love to know how likely you are to recommend withme.travel to a friend or colleague.',
  feedbackType: FeedbackType.COMPREHENSIVE,
  status: FormStatus.ACTIVE,
  showProgressBar: true,
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const NPS_FEEDBACK_QUESTIONS: Question[] = [
  {
    id: 'nps-score',
    formId: 'nps-feedback',
    title: 'How likely are you to recommend withme.travel to a friend or colleague?',
    isRequired: true,
    type: QuestionType.NPS,
    position: 0,
  },
  {
    id: 'nps-reason',
    formId: 'nps-feedback',
    title: 'What\'s the primary reason for your score?',
    isRequired: false,
    type: QuestionType.LONG_TEXT,
    position: 1,
    placeholder: 'Please explain your rating...',
  },
];

// Map of form types to their templates
const FORM_TEMPLATES = {
  'quick': {
    form: QUICK_FEEDBACK_FORM,
    questions: QUICK_FEEDBACK_QUESTIONS,
  },
  'exit': {
    form: EXIT_INTENT_FORM,
    questions: EXIT_INTENT_QUESTIONS,
  },
  'feature': {
    form: FEATURE_FEEDBACK_FORM,
    questions: FEATURE_FEEDBACK_QUESTIONS,
  },
  'nps': {
    form: NPS_FEEDBACK_FORM,
    questions: NPS_FEEDBACK_QUESTIONS,
  },
};

export type FeedbackFormType = 'quick' | 'exit' | 'feature' | 'nps';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formType?: FeedbackFormType;
  featureName?: string;
  customForm?: {
    form: FeedbackForm;
    questions: Question[];
  };
}

export function FeedbackDialog({
  open,
  onOpenChange,
  formType = 'quick',
  featureName,
  customForm,
}: FeedbackDialogProps) {
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use custom form if provided, otherwise use template
  const formTemplate = customForm || FORM_TEMPLATES[formType];
  
  // Make a copy of the form template to avoid mutating the original
  const form = {
    ...formTemplate.form,
    id: `${formTemplate.form.id}-${Date.now()}`, // Ensure unique ID
  };
  
  // For feature feedback, set the feature name
  if (formType === 'feature' && featureName) {
    form.title = `${featureName} Feedback`;
    form.description = `Tell us what you think about the ${featureName} feature`;
    form.targetFeature = featureName;
  }
  
  // Add current page to form metadata
  form.targetPage = pathname || undefined;
  
  const handleSubmit = async (data: { formId: string; responses: { questionId: string; value: any }[] }) => {
    try {
      setIsSubmitting(true);
      
      // Here you would normally submit to your API
      console.log('Submitting feedback:', {
        formId: form.id,
        formType: form.feedbackType,
        targetPage: pathname,
        targetFeature: form.targetFeature,
        responses: data.responses,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Wait a moment before closing dialog to show completion screen
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitting(false);
      
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{form.title}</DialogTitle>
        </DialogHeader>
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <FeedbackFormRenderer
          form={form}
          questions={formTemplate.questions}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Export a button that can be used to trigger feedback
export function FeedbackButton({
  formType = 'quick',
  featureName,
  children,
  className,
  variant = 'outline',
  size = 'sm',
}: {
  formType?: FeedbackFormType;
  featureName?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        {children || 'Give Feedback'}
      </Button>
      
      <FeedbackDialog
        open={open}
        onOpenChange={setOpen}
        formType={formType}
        featureName={featureName}
      />
    </>
  );
} 