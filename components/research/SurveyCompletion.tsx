'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';

export interface SurveyCompletionProps {
  title: string;
  description: string;
  nextStepUrl?: string;
  nextStepLabel?: string;
}

/**
 * Completion screen shown after a survey is submitted
 */
export function SurveyCompletion({ 
  title, 
  description, 
  nextStepUrl = "/", 
  nextStepLabel = "Return to Home" 
}: SurveyCompletionProps) {
  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <motion.svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              initial="hidden"
              animate="visible"
            >
              <motion.circle
                cx="16"
                cy="16"
                r="15"
                stroke="#22c55e"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d="M10 17l4 4 8-8"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </motion.svg>
          </div>
        </div>
        <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-muted/20">
            <h3 className="text-lg font-medium mb-2">What happens next?</h3>
            <p className="text-sm text-muted-foreground">
              Your feedback will be reviewed by our team and will help shape the future of our product. 
              Thank you for taking the time to share your thoughts with us!
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href={nextStepUrl}>
          <Button variant="outline" size="lg" className="flex gap-2 items-center">
            <Home className="h-4 w-4" />
            {nextStepLabel}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
