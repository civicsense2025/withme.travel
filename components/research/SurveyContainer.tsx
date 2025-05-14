'use client';
import React, { useState, useMemo } from 'react';
import type { Survey, SurveyQuestion } from '@/types/research';
import { useResearchTracking } from '@/hooks/use-research-tracking';
import { useResearchContext } from '@/app/context/research-context';

interface SurveyContainerProps {
  survey: Survey;
  onComplete: (responses: Record<string, any>) => void;
}

export const SurveyContainer: React.FC<SurveyContainerProps> = ({ survey, onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'questions' | 'completion'>('welcome');
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useResearchTracking();
  const { session } = useResearchContext();

  // Group questions by milestone (simple version)
  const milestones = useMemo(() => {
    const grouped: SurveyQuestion[][] = [];
    if (!survey.questions || survey.questions.length === 0) return grouped;
    // For now, group all questions as one step
    grouped.push(survey.questions);
    return grouped;
  }, [survey.questions]);

  const progress = milestones.length > 0 ? (currentMilestone + 1) / milestones.length : 0;

  // Function to track survey events
  const handleSurveyStart = () => {
    trackEvent('survey_started', { 
      surveyId: survey.id,
      surveyType: survey.type,
      milestone: currentMilestone 
    });
    setStep('questions');
  };

  // Handle milestone completion
  const handleMilestoneComplete = async () => {
    // Track the step completion
    trackEvent('survey_step_completed', { 
      surveyId: survey.id, 
      milestone: currentMilestone,
      progress: Math.round(progress * 100)
    });
    
    if (currentMilestone < milestones.length - 1) {
      // Move to next milestone
      setCurrentMilestone((m) => m + 1);
    } else {
      // Final milestone - submit all responses
      await handleSurveyComplete();
    }
  };

  // Handle final survey submission
  const handleSurveyComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Send responses to the backend
      if (survey.id && responses) {
        await fetch(`/api/research/surveys/${survey.id}/responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses,
            session_id: session?.id,
            milestone: currentMilestone.toString(),
          }),
        });
      }
      
      // Track survey completion
      trackEvent('survey_completed', { 
        surveyId: survey.id,
        responseCount: Object.keys(responses).length
      });
      
      // Move to completion step
      setStep('completion');
      // Call the onComplete callback
      onComplete(responses);
    } catch (error) {
      console.error('Failed to submit survey responses:', error);
      // Still show completion to user to avoid blocking
      setStep('completion');
      onComplete(responses);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle response changes
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    
    // Optionally track individual responses
    trackEvent('survey_question_answered', {
      surveyId: survey.id,
      questionId,
      milestone: currentMilestone
    });
  };

  return (
    <div className="survey-container">
      {step === 'welcome' && (
        <div>
          <h2>{survey.title}</h2>
          <p>{survey.description}</p>
          <button onClick={handleSurveyStart}>Begin Survey</button>
        </div>
      )}
      {step === 'questions' && (
        <div>
          <div>Progress: {Math.round(progress * 100)}%</div>
          <div>
            {milestones[currentMilestone]?.map((q) => (
              <div key={q.id}>
                <label>{q.text}</label>
                {/* Placeholder for input */}
                <input
                  type="text"
                  value={responses[q.id] ?? ''}
                  onChange={(e) => handleResponseChange(q.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div>
            {currentMilestone > 0 && (
              <button 
                onClick={() => setCurrentMilestone((m) => m - 1)}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleMilestoneComplete}
              disabled={isSubmitting}
            >
              {currentMilestone < milestones.length - 1 ? 'Next' : 'Submit'}
              {isSubmitting && '...'}
            </button>
          </div>
        </div>
      )}
      {step === 'completion' && (
        <div>
          <h2>Thank you for your feedback!</h2>
          <button
            onClick={() => {
              /* handle close or redirect */
            }}
          >
            Return to App
          </button>
        </div>
      )}
    </div>
  );
};
