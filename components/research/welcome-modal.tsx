'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useResearch } from '@/contexts/research-context';
import { motion } from 'framer-motion';
import { CheckCheck, ArrowRight, HelpCircle, Shield, X } from 'lucide-react';

const steps = [
  {
    title: "Welcome to Our Research Study",
    icon: <HelpCircle className="h-8 w-8 text-primary" />,
    content: (
      <>
        <p className="mb-4">
          Thank you for agreeing to be part of our research study! Your feedback will help us improve withme.travel and make group travel planning better for everyone.
        </p>
        <p className="mb-4">
          During your session, we may occasionally ask you short questions about your experience. Your responses will be anonymous and incredibly valuable to our team.
        </p>
        <p>
          This won't interrupt your browsing for more than a moment at a time, and you can exit the study at any point if you wish.
        </p>
      </>
    )
  },
  {
    title: "How It Works",
    icon: <Shield className="h-8 w-8 text-primary" />,
    content: (
      <>
        <p className="mb-4">
          As you use withme.travel, a short feedback form may appear at certain points asking for your thoughts on specific features or experiences.
        </p>
        <p className="mb-4">
          These quick surveys typically take less than 30 seconds to complete and will help us understand what's working well and what could be improved.
        </p>
        <p>
          Your feedback remains anonymous and is only used to improve our product. You can dismiss a survey if you're busy, though we appreciate every response!
        </p>
      </>
    )
  },
  {
    title: "Ready to Begin?",
    icon: <CheckCheck className="h-8 w-8 text-primary" />,
    content: (
      <>
        <p className="mb-4">
          You're all set to begin your session. Just click "Start" below and continue using withme.travel as you normally would.
        </p>
        <p className="mb-4">
          Remember, your participation is voluntary, and you can exit the research study at any time by clicking the small "Research" badge in the corner of your screen.
        </p>
        <p>
          Thank you for helping us make withme.travel the best group travel planning platform!
        </p>
      </>
    )
  }
];

export function WelcomeModal() {
  const { showWelcomeModal, completeWelcome, exitResearch } = useResearch();
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === steps.length - 1;
  
  // Move to next step or complete if on last step
  const handleNext = () => {
    if (isLastStep) {
      completeWelcome();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Exit research study
  const handleExit = () => {
    exitResearch();
  };
  
  // Go back to previous step
  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  if (!showWelcomeModal) return null;
  
  const currentStepData = steps[currentStep];
  
  return (
    <Dialog open={showWelcomeModal} onOpenChange={completeWelcome}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mr-2"
            >
              {currentStepData.icon}
            </motion.div>
            <motion.span
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.title}
            </motion.span>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="py-4"
        >
          <div className="prose prose-sm max-w-none">
            {currentStepData.content}
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 w-2 rounded-full ${idx === currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </motion.div>
        
        <DialogFooter className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button
              type="button" 
              variant="ghost" 
              onClick={handleExit}
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="mr-1 h-4 w-4" />
              Exit Study
            </Button>
            
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                size="sm"
              >
                Back
              </Button>
            )}
          </div>
          
          <Button onClick={handleNext} size="lg">
            {isLastStep ? 'Start' : 'Next'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 