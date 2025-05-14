import React from 'react';
import type { Survey } from '@/types/research';

interface SurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
}

export const SurveyWelcome: React.FC<SurveyWelcomeProps> = ({ survey, onStart }) => {
  if (!survey) return null;
  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-2">{survey.title}</h2>
      <p className="mb-4">{survey.description}</p>
      <button className="btn btn-primary" onClick={onStart}>
        Begin Survey
      </button>
    </div>
  );
};
