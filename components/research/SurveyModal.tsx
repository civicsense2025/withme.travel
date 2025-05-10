'use client';

import { useState } from 'react';
import { useResearch } from '@/app/context/ResearchContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { SurveyQuestion, RadioQuestion, CheckboxQuestion, TextQuestion, TextareaQuestion, RatingQuestion, MatrixQuestion, DropdownQuestion } from '@/types/research';

type SurveyQuestionResponse = {
  questionId: string;
  questionText: string;
  response: string | string[] | boolean;
};

/**
 * A modal that displays research surveys to participants
 * This should be placed near the root of the application to be available globally
 */
export function SurveyModal() {
  const { 
    isResearchSession, 
    currentSurvey, 
    isShowingSurvey,
    dismissSurvey, 
    submitSurvey
  } = useResearch();
  
  const [responses, setResponses] = useState<SurveyQuestionResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If there's no survey or not in a research session, don't render anything
  if (!isResearchSession || !currentSurvey || !isShowingSurvey) {
    return null;
  }
  
  const handleSingleChoiceChange = (questionId: string, questionText: string, value: string) => {
    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], response: value };
        return updated;
      } else {
        return [...prev, { questionId, questionText, response: value }];
      }
    });
  };
  
  const handleMultiChoiceChange = (questionId: string, questionText: string, value: string, checked: boolean) => {
    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        const currentResponses = Array.isArray(updated[existing].response) 
          ? updated[existing].response as string[]
          : [];
          
        updated[existing] = { 
          ...updated[existing], 
          response: checked 
            ? [...currentResponses, value]
            : currentResponses.filter(v => v !== value)
        };
        return updated;
      } else {
        return [...prev, { questionId, questionText, response: checked ? [value] : [] }];
      }
    });
  };
  
  const handleTextChange = (questionId: string, questionText: string, value: string) => {
    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], response: value };
        return updated;
      } else {
        return [...prev, { questionId, questionText, response: value }];
      }
    });
  };
  
  const handleBooleanChange = (questionId: string, questionText: string, value: boolean) => {
    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], response: value };
        return updated;
      } else {
        return [...prev, { questionId, questionText, response: value }];
      }
    });
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitSurvey(responses);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setIsSubmitting(false);
      setResponses([]);
    }
  };
  
  const handleDismiss = () => {
    dismissSurvey();
    setResponses([]);
  };
  
  // Helper type guards
  function isRadioQuestion(q: SurveyQuestion): q is RadioQuestion {
    return q.type === 'radio';
  }
  function isCheckboxQuestion(q: SurveyQuestion): q is CheckboxQuestion {
    return q.type === 'checkbox';
  }
  function isTextQuestion(q: SurveyQuestion): q is TextQuestion {
    return q.type === 'text';
  }
  function isTextareaQuestion(q: SurveyQuestion): q is TextareaQuestion {
    return q.type === 'textarea';
  }
  function isRatingQuestion(q: SurveyQuestion): q is RatingQuestion {
    return q.type === 'rating';
  }
  function isDropdownQuestion(q: SurveyQuestion): q is DropdownQuestion {
    return q.type === 'dropdown';
  }
  
  return (
    <Dialog open={isShowingSurvey} onOpenChange={open => !open && handleDismiss()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{currentSurvey.title}</DialogTitle>
          {currentSurvey.description && (
            <DialogDescription>{currentSurvey.description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {currentSurvey.questions.map((question: SurveyQuestion, index: number) => (
            <div key={question.id || `q-${index}`} className="space-y-3">
              <h3 className="font-medium">
                {index + 1}. {question.text}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </h3>
              {isRadioQuestion(question) && (
                <RadioGroup
                  value={responses.find(r => r.questionId === question.id)?.response as string || ''}
                  onValueChange={value => handleSingleChoiceChange(question.id, question.text, value)}
                >
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={`opt-${index}-${optIndex}`} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`q-${index}-opt-${optIndex}`} />
                        <Label htmlFor={`q-${index}-opt-${optIndex}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
              {isCheckboxQuestion(question) && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const response = responses.find(r => r.questionId === question.id);
                    const selectedOptions = response?.response as string[] || [];
                    const isChecked = selectedOptions.includes(option.value);
                    return (
                      <div key={`opt-${index}-${optIndex}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`q-${index}-opt-${optIndex}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleMultiChoiceChange(
                              question.id,
                              question.text,
                              option.value,
                              checked as boolean
                            )
                          }
                        />
                        <Label htmlFor={`q-${index}-opt-${optIndex}`}>{option.label}</Label>
                      </div>
                    );
                  })}
                </div>
              )}
              {isTextQuestion(question) && (
                <Textarea
                  placeholder={question.placeholder || "Enter your response here..."}
                  value={responses.find(r => r.questionId === question.id)?.response as string || ''}
                  onChange={e => handleTextChange(question.id, question.text, e.target.value)}
                />
              )}
              {isTextareaQuestion(question) && (
                <Textarea
                  placeholder={question.placeholder || "Enter your response here..."}
                  value={responses.find(r => r.questionId === question.id)?.response as string || ''}
                  onChange={e => handleTextChange(question.id, question.text, e.target.value)}
                  rows={question.rows || 3}
                />
              )}
            </div>
          ))}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleDismiss} disabled={isSubmitting}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 