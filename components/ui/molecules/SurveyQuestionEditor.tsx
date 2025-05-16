import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export interface SurveyQuestionEditorProps {
  question: any;
  index: number;
  onChange: (q: any) => void;
  onDelete?: () => void;
  milestoneOptions?: { label: string; value: string }[];
}

export const SurveyQuestionEditor: React.FC<SurveyQuestionEditorProps> = ({
  question,
  index,
  onChange,
  onDelete,
  milestoneOptions = [],
}) => {
  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Question {index + 1}</span>
        {onDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
            ×
          </Button>
        )}
      </div>
      <div className="grid gap-2 mb-2">
        <Input
          value={question.label || ''}
          onChange={e => onChange({ ...question, label: e.target.value })}
          placeholder="Question text"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Select
          value={question.type || 'text'}
          onValueChange={type => onChange({ ...question, type })}
        >
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="textarea">Textarea</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="radio">Radio</SelectItem>
            <SelectItem value="checkbox">Checkbox</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={question.milestone || ''}
          onValueChange={milestone => onChange({ ...question, milestone })}
        >
          <SelectTrigger><SelectValue placeholder="Milestone" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {milestoneOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Switch
          checked={!!question.required}
          onCheckedChange={required => onChange({ ...question, required })}
        />
        <span>Required</span>
      </div>
      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
        <div className="mb-2">
          <Textarea
            value={(question.options || []).join('\n')}
            onChange={e => onChange({ ...question, options: e.target.value.split('\n').map(o => o.trim()).filter(Boolean) })}
            placeholder="Options (one per line)"
            rows={4}
          />
        </div>
      )}
    </div>
  );
};

export default SurveyQuestionEditor; 