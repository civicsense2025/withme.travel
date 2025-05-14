import React from 'react';
import type { Survey } from '@/types/research';

interface SurveyCompletionProps {
  survey: Survey;
  onClose: () => void;
}

export const SurveyCompletion: React.FC<SurveyCompletionProps> = ({ survey, onClose }) => {
  if (!survey) return null;
  return (
    <div className="text-center p-6">
      <div className="text-4xl mb-2">✅</div>
      <h2 className="text-xl font-bold mb-2">Thank you for your feedback!</h2>
      <p className="mb-4">Your responses help us make withme.travel better for everyone.</p>
      <button className="btn btn-primary" onClick={onClose}>
        Return to App
      </button>
    </div>
  );
};
