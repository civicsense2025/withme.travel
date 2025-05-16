'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface SurveyCompletionProps {
  title: string;
  description: string;
  onClose?: () => void;
}

/**
 * Completion screen shown after survey submission
 * Includes an animated checkmark and thank you message
 */
export function SurveyCompletion({ title, description, onClose }: SurveyCompletionProps) {
  return (
    <motion.div 
      className="p-8 flex flex-col items-center text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-6 text-primary"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <CheckmarkIcon className="w-20 h-20" />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        {description}
      </p>
      
      {onClose && (
        <Button 
          onClick={onClose} 
          className="w-full max-w-xs"
          size="lg"
        >
          Close
        </Button>
      )}
    </motion.div>
  );
}

// Animated checkmark icon
function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M30 50 L45 65 L70 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
      </svg>
    </div>
  );
}
