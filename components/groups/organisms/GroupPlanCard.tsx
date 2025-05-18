/**
 * GroupPlanCard
 * 
 * A card component for displaying group plan information with status, interactions,
 * and relevant details like location, dates, and participants.
 * 
 * @module groups/organisms
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Check, Clock } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupPlanCardProps {
  /** Unique identifier for the plan */
  id: string;
  /** Title of the plan */
  title: string;
  /** Optional description of the plan */
  description?: string;
  /** Current status of the plan */
  status: 'draft' | 'active' | 'completed';
  /** Number of votes the plan has received */
  voteCount: number;
  /** Number of participants in the plan */
  participantCount: number;
  /** Optional location information */
  location?: string;
  /** Optional date range for the plan */
  dateRange?: {
    start?: string;
    end?: string;
  };
  /** Optional due date for the plan */
  dueDate?: string;
  /** Optional click handler */
  onClick?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupPlanCard({
  id,
  title,
  description,
  status,
  voteCount,
  participantCount,
  location,
  dateRange,
  dueDate,
  onClick,
  className,
}: GroupPlanCardProps) {
  // Status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/30';
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800/30';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800/30';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/20 dark:text-gray-300 dark:border-gray-700/30';
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange) return null;
    
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      
      // Format: "Jun 12 - Jun 15, 2024"
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (dateRange.start) {
      const start = new Date(dateRange.start);
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    return null;
  };

  // Format due date
  const formatDueDate = () => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      <Card 
        className="overflow-hidden cursor-pointer transition-colors hover:border-primary/50"
        onClick={() => onClick?.(id)}
      >
        <CardHeader className="relative pb-2">
          <Badge className={`${getStatusColor()} absolute right-4 top-4`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <CardTitle className="line-clamp-1">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="pb-2">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{location}</span>
              </div>
            )}
            
            {dateRange && formatDateRange() && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{formatDateRange()}</span>
              </div>
            )}
            
            {dueDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Due by {formatDueDate()}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{participantCount} participants</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-muted/20 py-2 justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">{voteCount} votes</span>
          </div>
          
          <Button variant="outline" size="sm" className="h-8 px-2">View Plan</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 