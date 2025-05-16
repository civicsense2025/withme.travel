'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FirstLikeTourProps {
  onClose: () => void;
}

export function FirstLikeTour({ onClose }: FirstLikeTourProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleDismiss = () => {
    onClose();
  };

  const handleViewSaved = () => {
    router.push('/saved');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <AnimatePresence>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-24 text-center"
          >
            <div className="relative bg-travel-purple text-white p-4 rounded-lg shadow-lg max-w-[300px]">
              <ArrowUp className="absolute -top-7 right-8 h-7 w-7 text-travel-purple transform rotate-15" />
              <p className="font-medium">You've saved your first item!</p>
              <p className="text-sm mt-1 mb-2">
                Click on your profile to access all your saved items anytime
              </p>
              <motion.div
                className="absolute -right-2 -top-2 h-10 w-10 rounded-full border-4 border-travel-purple"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md text-center"
          >
            <Bookmark className="h-12 w-12 mx-auto text-travel-purple mb-3" />
            <h2 className="text-xl font-bold mb-2">Item Saved!</h2>
            <p className="text-muted-foreground mb-4">
              View all your saved destinations, itineraries, and attractions in one place. Find them
              anytime by clicking your profile icon.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleDismiss}>
                Dismiss
              </Button>
              <Button onClick={handleViewSaved}>View Saved Items</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
