'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type SectionProps = {
  title: string;
  emoji: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
};

function CollapsibleSection({ title, emoji, defaultOpen = false, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
          <div className="flex justify-center items-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 mr-3">
            <span className="text-xl" role="img" aria-hidden="true">
              {emoji}
            </span>
          </div>
          <h2 className="text-xl font-medium">{title}</h2>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && children && (
          <motion.div
            id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DestinationDetailsClean() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-background p-8 rounded-3xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-10 text-center">Paris Travel Details</h1>

      <div className="space-y-4">
        <CollapsibleSection title="Essentials" emoji="✨" />
        <CollapsibleSection title="Planning" emoji="📅" />
        <CollapsibleSection title="Local Insights" emoji="💡" />
      </div>
    </div>
  );
}
