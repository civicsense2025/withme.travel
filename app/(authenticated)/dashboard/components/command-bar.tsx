'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Map, Globe, CalendarRange, Compass, Users, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CommandBarProps {
  className?: string;
}

export function CommandBar({ className }: CommandBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Quick action button component
  const ActionButton = ({
    icon,
    label,
    href,
    color,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    href?: string;
    color: string;
    onClick?: () => void;
  }) => {
    const content = (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={`h-12 w-12 rounded-full shadow-md ${color}`}
              onClick={onClick}
            >
              {icon}
              <span className="sr-only">{label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    if (href) {
      return <Link href={href} legacyBehavior>{content}</Link>;
    }

    return content;
  };

  return (
    <motion.div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main toggle button */}
      <Button
        size="icon"
        onClick={toggleExpand}
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Expandable action buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-3"
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <ActionButton
              icon={<Plus className="h-5 w-5" />}
              label="New Trip"
              href="/trips/create"
              color="bg-travel-purple hover:bg-travel-purple/90 text-white"
            />
            <ActionButton
              icon={<Users className="h-5 w-5" />}
              label="New Group"
              href="/groups/create"
              color="bg-travel-blue hover:bg-travel-blue/90 text-white"
            />
            <ActionButton
              icon={<Map className="h-5 w-5" />}
              label="Explore Destinations"
              href="/destinations"
              color="bg-travel-pink hover:bg-travel-pink/90 text-white"
            />
            <ActionButton
              icon={<CalendarRange className="h-5 w-5" />}
              label="Itineraries"
              href="/itineraries"
              color="bg-travel-mint hover:bg-travel-mint/90 text-white"
            />
            <ActionButton
              icon={<Globe className="h-5 w-5" />}
              label="Travel Map"
              href="/travel-map"
              color="bg-amber-500 hover:bg-amber-600 text-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
