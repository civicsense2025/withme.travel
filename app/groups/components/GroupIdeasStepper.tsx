'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, SquarePen, MapPin, Calendar, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupIdeaStepperProps {
  currentStep?: number;
  className?: string;
}

// Custom Vote icon since it's not in Lucide
function VoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12l2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 012 2v12H5V7z" />
      <path d="M22 19H2" />
    </svg>
  );
}

const steps = [
  {
    number: 1,
    title: 'Brainstorm Ideas',
    description: 'Add places, dates, activities & budget ideas',
    icon: Lightbulb,
    color: 'bg-violet-100 text-violet-600',
    iconColor: 'text-violet-600',
  },
  {
    number: 2,
    title: 'Vote & Discuss',
    description: 'Collaborate to find the perfect plan',
    icon: VoteIcon,
    color: 'bg-indigo-100 text-indigo-600',
    iconColor: 'text-indigo-600',
  },
  {
    number: 3,
    title: 'Create Trip',
    description: 'Turn your ideas into a real itinerary',
    icon: MapPin,
    color: 'bg-emerald-100 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
];

export function GroupIdeasStepper({ currentStep = 1, className }: GroupIdeaStepperProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <motion.div
              className={cn(
                'flex flex-col items-center justify-center relative',
                currentStep >= step.number ? 'opacity-100' : 'opacity-60'
              )}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{
                scale: currentStep === step.number ? 1.05 : 1,
                opacity: currentStep >= step.number ? 1 : 0.6,
              }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  step.color,
                  currentStep === step.number && 'ring-4 ring-opacity-30',
                  currentStep === step.number && step.number === 1 && 'ring-violet-300',
                  currentStep === step.number && step.number === 2 && 'ring-indigo-300',
                  currentStep === step.number && step.number === 3 && 'ring-emerald-300'
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>

              {/* Step label below the circle */}
              <div className="text-center mt-2">
                <p
                  className={cn(
                    'font-medium text-xs',
                    currentStep >= step.number ? 'text-gray-800' : 'text-gray-500'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 max-w-[100px] mx-auto">{step.description}</p>
              </div>
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-1 h-px bg-gray-200 max-w-[80px] relative">
                {currentStep > step.number && (
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
