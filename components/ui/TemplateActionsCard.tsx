import React from 'react';

export interface TemplateActionsCardProps {
  onUse?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

/**
 * TemplateActionsCard displays actions for using, sharing, or saving a template.
 * @example <TemplateActionsCard onUse={...} onShare={...} onSave={...} isSaved={false} />
 */
export function TemplateActionsCard({ onUse, onShare, onSave, isSaved }: TemplateActionsCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow flex flex-col gap-3 min-w-[220px] items-center">
      <button
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-lg mb-2 hover:bg-blue-700 transition"
        onClick={onUse}
        aria-label="Use Template"
      >
        Use Template
        <span className="ml-2 align-middle">▼</span>
      </button>
      <div className="flex gap-4 w-full justify-center">
        <button
          className="flex-1 border border-blue-500 text-blue-600 rounded-lg py-2 font-medium hover:bg-blue-50 transition"
          onClick={onShare}
          aria-label="Share"
        >
          <span className="mr-1" role="img" aria-label="share">
            🔗
          </span>
          Share
        </button>
        <button
          className={`flex-1 border border-blue-500 rounded-lg py-2 font-medium transition ${isSaved ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
          onClick={onSave}
          aria-label="Save"
        >
          <span className="mr-1" role="img" aria-label="save">
            {isSaved ? '💙' : '🤍'}
          </span>
          Save
        </button>
      </div>
    </div>
  );
}

export default TemplateActionsCard;
