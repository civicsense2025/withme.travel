'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface SurveyWelcomeProps {
  title: string;
  description: string;
  onStart: () => void;
}

/**
 * Welcome screen for surveys with animated entrance
 */
export function SurveyWelcome({ title, description, onStart }: SurveyWelcomeProps) {
  return (
    <motion.div 
      className="p-8 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <span className="inline-block text-4xl">✨</span>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        {description}
      </p>
      
      <ul className="mb-8 text-left w-full max-w-md space-y-2">
        <li className="flex items-start">
          <span className="mr-2 text-primary">✓</span>
          <span>Your feedback will help us improve the experience for everyone</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-primary">✓</span>
          <span>This survey should take about 3-5 minutes to complete</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-primary">✓</span>
          <span>Your responses are anonymous and confidential</span>
        </li>
      </ul>
      
      <Button 
        onClick={onStart} 
        className="w-full max-w-xs"
        size="lg"
      >
        Start Survey
      </Button>
    </motion.div>
  );
}
