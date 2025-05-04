'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FeedbackFormRenderer } from '@/app/components/feedback/FeedbackForm';
import { MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { FeedbackType, FormStatus, QuestionType, type Question } from '@/app/components/feedback/types';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/components/ui/button';

// Define a simple feedback form and questions directly in this component for simplicity
const tripsFeedbackForm = {
  id: 'trips-feedback',
  title: 'Trip Planning Feedback',
  description: 'Help us improve your trip planning experience!',
  feedbackType: FeedbackType.FEATURE,
  status: FormStatus.ACTIVE,
  showProgressBar: true,
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  completionMessage: 'Thanks for your feedback! We\'ll use it to improve the trip planning experience.',
};

// Properly typed questions array
const tripsFeedbackQuestions: Question[] = [
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
  }
];

interface TripsFeedbackButtonProps extends ButtonProps {
  children?: ReactNode;
}

export function TripsFeedbackButton({ 
  children, 
  className, 
  variant = "outline", 
  size = "sm", 
  ...props 
}: TripsFeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  
  const handleSubmit = async (data: { formId: string; responses: { questionId: string; value: any }[] }) => {
    try {
      console.log('Feedback submitted:', data);
      
      // In a real implementation, you would send this data to your API
      // await fetch('/api/feedback/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // For demo purposes, just show a success toast
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Close dialog after a short delay to show the completion screen
      setTimeout(() => setOpen(false), 2000);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };
  
  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={cn("flex items-center", className)}
        {...props}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {children || "Give Feedback"}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{tripsFeedbackForm.title}</DialogTitle>
          </DialogHeader>
          
          <FeedbackFormRenderer
            form={tripsFeedbackForm}
            questions={tripsFeedbackQuestions}
            onSubmit={handleSubmit}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 