'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SurveyQuestion as QuestionType } from "@/types/research";

export interface SurveyQuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
}

/**
 * Renders a survey question based on its type
 */
export function SurveyQuestion({ question, value, onChange }: SurveyQuestionProps) {
  if (!question) return null;

  // Handle text/textarea questions
  if (question.type === 'text' || question.type === 'textarea') {
    const isTextarea = question.type === 'textarea';
    
    return (
      <div className="space-y-4">
        <Label 
          htmlFor={question.id} 
          className="text-lg font-medium"
        >
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {question.description && (
          <p className="text-muted-foreground text-sm">{question.description}</p>
        )}
        
        {isTextarea ? (
          <Textarea
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.config?.placeholder || ''}
            className="min-h-[120px]"
            required={question.required}
          />
        ) : (
          <Input
            id={question.id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.config?.placeholder || ''}
            required={question.required}
          />
        )}
      </div>
    );
  }

  // Handle single choice questions
  if (question.type === 'single_choice') {
    return (
      <div className="space-y-4">
        <Label className="text-lg font-medium">
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {question.description && (
          <p className="text-muted-foreground text-sm">{question.description}</p>
        )}
        
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          className="space-y-3"
        >
          {(question.options || []).map((option) => (
            <div 
              key={option.value} 
              className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
            >
              <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
              <Label htmlFor={`${question.id}-${option.value}`} className="flex-grow cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  // Handle multiple choice questions
  if (question.type === 'multiple_choice') {
    // Ensure value is always an array
    const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    
    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, optionValue]);
      } else {
        onChange(selectedValues.filter(v => v !== optionValue));
      }
    };
    
    return (
      <div className="space-y-4">
        <Label className="text-lg font-medium">
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {question.description && (
          <p className="text-muted-foreground text-sm">{question.description}</p>
        )}
        
        <div className="space-y-3">
          {(question.options || []).map((option) => (
            <div 
              key={option.value} 
              className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
            >
              <Checkbox 
                id={`${question.id}-${option.value}`} 
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(option.value, checked === true)
                }
              />
              <Label htmlFor={`${question.id}-${option.value}`} className="flex-grow cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default fallback for unknown question types
  return (
    <div className="p-4 border rounded-md bg-muted">
      <p className="text-muted-foreground text-sm">
        Unsupported question type: {question.type}
      </p>
    </div>
  );
} 