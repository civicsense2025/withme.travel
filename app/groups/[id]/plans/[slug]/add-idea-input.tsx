'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddIdeaInputProps {
  onAdd: (idea: { type: string; content: string }) => void;
  showTypeSelector?: boolean;
}

const IDEA_TYPES = [
  { value: 'destination', label: 'Destination', emoji: '📍', color: 'from-blue-400 to-blue-600' },
  { value: 'date', label: 'Date', emoji: '📅', color: 'from-yellow-400 to-yellow-600' },
  { value: 'activity', label: 'Activity', emoji: '🏄‍♂️', color: 'from-green-400 to-green-600' },
  { value: 'budget', label: 'Budget', emoji: '💰', color: 'from-orange-400 to-orange-600' },
  { value: 'other', label: 'Other', emoji: '💭', color: 'from-purple-400 to-purple-600' },
];

export default function AddIdeaInput({ onAdd, showTypeSelector = true }: AddIdeaInputProps) {
  const [type, setType] = useState('destination');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({ type, content: content.trim() });
      setContent(''); // Clear input after successful add
    } catch (error) {
      console.error('Error adding idea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the selected type to show emoji and color
  const selectedType = IDEA_TYPES.find((t) => t.value === type);

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto gap-2">
      {showTypeSelector && (
        <Select value={type} onValueChange={setType}>
          <SelectTrigger
            className="w-[150px] border-2 shadow-sm transition-all"
            style={{
              borderColor:
                type === 'destination'
                  ? '#93c5fd'
                  : type === 'date'
                    ? '#fcd34d'
                    : type === 'activity'
                      ? '#86efac'
                      : type === 'budget'
                        ? '#fdba74'
                        : '#d8b4fe',
            }}
          >
            <SelectValue>
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedType?.emoji}</span>
                <span>{selectedType?.label}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {IDEA_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="font-medium">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{type.emoji}</span>
                  <span>{type.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder={`Add a ${selectedType?.label.toLowerCase() || 'idea'}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full pr-[76px] h-full py-2 pl-4 rounded-lg border-2 border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="sm"
          className={`absolute right-1 top-1 h-[calc(100%-8px)] bg-gradient-to-r ${selectedType?.color}`}
          disabled={!content.trim() || isSubmitting}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </form>
  );
}
