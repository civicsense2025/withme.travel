'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GroupIdea } from './store/idea-store';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface AddIdeaModalProps {
  onClose: () => void;
  onSubmit: (ideaData: Partial<GroupIdea>) => void;
  editingIdea?: GroupIdea | null;
}

const IDEA_TYPE_OPTIONS = [
  { value: 'destination', label: 'Destination', emoji: '📍' },
  { value: 'date', label: 'Date', emoji: '📅' },
  { value: 'activity', label: 'Activity', emoji: '🏄‍♂️' },
  { value: 'budget', label: 'Budget', emoji: '💰' },
  { value: 'other', label: 'Other', emoji: '💭' },
];

export function AddIdeaModal({ onClose, onSubmit, editingIdea = null }: AddIdeaModalProps) {
  // Initialize state with existing idea data if editing
  const [title, setTitle] = useState(editingIdea?.title || '');
  const [description, setDescription] = useState(editingIdea?.description || '');
  const [type, setType] = useState<GroupIdea['type']>(editingIdea?.type || 'destination');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    type?: string;
  }>({});
  const [startDate, setStartDate] = useState<Date | null>(editingIdea?.start_date ? new Date(editingIdea.start_date) : null);
  const [endDate, setEndDate] = useState<Date | null>(editingIdea?.end_date ? new Date(editingIdea.end_date) : null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: startDate, to: endDate });

  // Validate form inputs
  const validateForm = () => {
    const newErrors: {
      title?: string;
      type?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!type) {
      newErrors.type = 'Please select an idea type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Create idea data object
    const ideaData: Partial<GroupIdea> = {
      title,
      description: description.trim() || undefined,
      type,
    };

    if (type === 'date') {
      ideaData.start_date = dateRange.from ? dateRange.from.toISOString() : undefined;
      ideaData.end_date = dateRange.to ? dateRange.to.toISOString() : undefined;
    }

    // If editing, include the id
    if (editingIdea) {
      ideaData.id = editingIdea.id;
    }

    onSubmit(ideaData);
  };
  
  // Handle button click events
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md z-200 modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <DialogTitle className="text-lg font-bold">{editingIdea ? 'Edit Idea' : 'Add New Idea'}</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => handleButtonClick(e, onClose)} 
            className="control interactive"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="grid gap-4 py-4">
            {/* Idea Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Idea Type</Label>
              <div className="relative">
                <select
                  id="type"
                  value={type}
                  onChange={e => setType(e.target.value as GroupIdea['type'])}
                  className="w-full rounded-md border p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {IDEA_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>
            
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'destination' ? 'e.g., "Paris, France"' :
                  type === 'date' ? 'e.g., "Summer 2024"' :
                  type === 'activity' ? 'e.g., "Visit Eiffel Tower"' :
                  type === 'budget' ? 'e.g., "$3000 per person"' :
                  'Enter idea title'
                }
                className={`interactive control ${errors.title ? 'border-red-500' : ''}`}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about your idea..."
                rows={3}
                className="interactive control"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Date Range Picker for date ideas */}
            {type === 'date' && (
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <DatePicker
                  date={dateRange}
                  setDate={setDateRange}
                  placeholder="Select date range"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => handleButtonClick(e, onClose)}
              className="interactive control"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={`interactive control ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {isSubmitting ? 'Saving...' : editingIdea ? 'Save Changes' : 'Add Idea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}