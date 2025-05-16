import React from 'react';
import SurveyQuestionEditor from './SurveyQuestionEditor';
import { Button } from '@/components/ui/button';

export interface SurveyQuestionListProps {
  questions: any[];
  onChange: (questions: any[]) => void;
  milestoneOptions?: { label: string; value: string }[];
}

export const SurveyQuestionList: React.FC<SurveyQuestionListProps> = ({
  questions,
  onChange,
  milestoneOptions = [],
}) => {
  const handleQuestionChange = (index: number, updated: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    onChange(newQuestions);
  };
  const handleDelete = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onChange(newQuestions);
  };
  const handleAdd = () => {
    onChange([
      ...questions,
      { label: '', type: 'text', required: false, options: [], milestone: '' },
    ]);
  };
  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(from, 1);
    newQuestions.splice(to, 0, moved);
    onChange(newQuestions);
  };
  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} className="relative">
          <SurveyQuestionEditor
            question={q}
            index={i}
            onChange={updated => handleQuestionChange(i, updated)}
            onDelete={() => handleDelete(i)}
            milestoneOptions={milestoneOptions}
          />
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            <Button size="icon" variant="ghost" onClick={() => handleMove(i, i - 1)} disabled={i === 0}>
              ↑
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleMove(i, i + 1)} disabled={i === questions.length - 1}>
              ↓
            </Button>
          </div>
        </div>
      ))}
      <Button onClick={handleAdd} className="mt-2">+ Add Question</Button>
    </div>
  );
};

export default SurveyQuestionList; 