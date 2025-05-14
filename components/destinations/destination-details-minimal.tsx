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
    <div className="border-b border-border py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
          <span className="text-2xl mr-3" role="img" aria-hidden="true">
            {emoji}
          </span>
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

export default function DestinationDetailsMinimal() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-background p-8 md:p-10 rounded-3xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-6">Paris Travel Details</h1>

      <CollapsibleSection title="Essentials" emoji="✨" />
      <CollapsibleSection title="Planning" emoji="📅" />
      <CollapsibleSection title="Local Insights" emoji="💡" />
    </div>
  );
}
