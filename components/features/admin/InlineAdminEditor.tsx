'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Save, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

interface InlineEditField {
  type: 'text' | 'textarea' | 'number' | 'select';
  name: string;
  label: string;
  value: string | number;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
}

interface InlineAdminEditorProps {
  entityType: 'destination' | 'country' | 'continent';
  entityId: string;
  fields: InlineEditField[];
  onSave: (entityId: string, data: Record<string, any>) => Promise<boolean>;
  className?: string;
}

export default function InlineAdminEditor({
  entityType,
  entityId,
  fields,
  onSave,
  className,
}: InlineAdminEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check if the user is an admin
    // We're checking if the user has admin privileges from user metadata
    setIsAdmin(Boolean(user?.user_metadata?.is_admin));

    // Initialize form values from fields
    const initialValues: Record<string, any> = {};
    fields.forEach((field) => {
      initialValues[field.name] = field.value;
    });
    setEditValues(initialValues);
  }, [fields, user]);

  const handleInputChange = (name: string, value: string | number) => {
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await onSave(entityId, editValues);
      if (success) {
        toast({
          title: 'Changes saved',
          description: `The ${entityType} has been successfully updated.`,
        });
        setIsEditing(false);
      } else {
        toast({
          title: 'Error saving changes',
          description: 'An error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error saving changes',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset values to original
    const originalValues: Record<string, any> = {};
    fields.forEach((field) => {
      originalValues[field.name] = field.value;
    });
    setEditValues(originalValues);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      className={cn(
        'border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 rounded-md p-4 my-4',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="font-medium">Admin Editor: {entityType}</h3>
        </div>

        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'text' && (
                <Input
                  id={field.name}
                  name={field.name}
                  value={editValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={editValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  rows={4}
                />
              )}

              {field.type === 'number' && (
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={editValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                />
              )}

              {field.type === 'select' && field.options && (
                <Select
                  value={String(editValues[field.name])}
                  onValueChange={(value) => handleInputChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue>Select an option</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium">{field.label}:</span>
              <span className="text-sm col-span-2">
                {field.type === 'select' && field.options
                  ? field.options.find((o) => o.value === String(field.value))?.label || field.value
                  : field.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
