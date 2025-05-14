import React, { useEffect } from 'react';
import type { SurveyQuestion } from '@/types/research';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface QuestionRendererProps {
  question: SurveyQuestion;
  value: any;
  onChange: (value: any) => void;
}

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  // Dev-only: persist value in localStorage for demo
  useEffect(() => {
    if (!isDev) return;
    const key = `wm_research_q_${question.id}`;
    if (value !== undefined) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
    // On mount, load value if not set
    if (value === undefined) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) onChange(JSON.parse(raw));
      } catch {}
    }
    // Clear on unmount if needed
    return () => {};
  }, [question.id, value, onChange]);

  if (!question) return null;

  if (question.type === 'text') {
    return (
      <div>
        <label>{question.text}</label>
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  if (question.type === 'select') {
    const opts = question.options ?? [];
    if (!opts.length) return <div>No options provided</div>;
    return (
      <div>
        <label>{question.text}</label>
        <Select value={value ?? ''} onValueChange={onChange}>
          <SelectTrigger aria-label={question.text}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {opts.map((opt: any) => (
              <SelectItem key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (question.type === 'radio') {
    const opts = question.options ?? [];
    if (!opts.length) return <div>No options provided</div>;
    return (
      <div>
        <label>{question.text}</label>
        <RadioGroup value={value ?? ''} onValueChange={onChange}>
          {opts.map((opt: any) => (
            <label key={opt.value ?? opt} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value ?? opt} />
              {opt.label ?? opt}
            </label>
          ))}
        </RadioGroup>
      </div>
    );
  }

  if (question.type === 'checkbox') {
    const opts = question.options ?? [];
    if (!opts.length) return <div>No options provided</div>;
    // value is an array of selected values
    const arr = Array.isArray(value) ? value : [];
    return (
      <div>
        <label>{question.text}</label>
        <div className="flex flex-col gap-2">
          {opts.map((opt: any) => {
            const checked = arr.includes(opt.value ?? opt);
            return (
              <label key={opt.value ?? opt} className="flex items-center gap-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    if (v) onChange([...arr, opt.value ?? opt]);
                    else onChange(arr.filter((val: any) => val !== (opt.value ?? opt)));
                  }}
                  ariaLabel={opt.label ?? opt}
                />
                {opt.label ?? opt}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'rating') {
    // Use Slider 0-5 (or from config)
    const min = question.config?.min ?? 0;
    const max = question.config?.max ?? 5;
    return (
      <div>
        <label>{question.text}</label>
        <div className="flex items-center gap-4">
          <Slider
            min={min}
            max={max}
            step={1}
            value={[typeof value === 'number' ? value : min]}
            onValueChange={(vals) => onChange(vals[0])}
            className="w-40"
          />
          <span>{typeof value === 'number' ? value : min}</span>
        </div>
      </div>
    );
  }

  // Fallback for unsupported types
  return <div>Unsupported question type: {question.type}</div>;
};
