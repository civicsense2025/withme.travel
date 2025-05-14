import React from 'react';

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const SurveyProgress: React.FC<SurveyProgressProps> = ({ currentStep, totalSteps }) => {
  if (totalSteps <= 0) return null;
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
