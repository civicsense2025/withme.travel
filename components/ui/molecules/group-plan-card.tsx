'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/molecules/Card';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Calendar, MapPin, Users, Check, Clock, Calendar as CalendarIcon } from 'lucide-react';

export interface GroupPlanCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed';
  voteCount: number;
  participantCount: number;
  location?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  dueDate?: string;
  onClick?: (id: string) => void;
}

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
}: GroupPlanCardProps) {
  // Status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'draft':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'active':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100';
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

export default GroupPlanCard; 