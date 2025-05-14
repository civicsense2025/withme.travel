import React from 'react';
import type { Survey } from '@/types/research';

interface ResearchModalProps {
  survey: Survey | null;
  onClose: () => void;
  children?: React.ReactNode;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({ survey, onClose, children }) => {
  if (!survey) return null;
  // TODO: Replace with design system modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close survey modal"
        >
          ×
        </button>
        {children || <div>Survey: {survey.title}</div>}
      </div>
    </div>
  );
};
