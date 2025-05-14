'use client';
import { useResearchContext } from '@/app/context/research-context';
import { ResearchModal } from '@/components/research/ResearchModal';
import { SurveyContainer } from '@/components/research/SurveyContainer';
import type { Survey } from '@/types/research';

interface HomeResearchClientProps {
  mockSurvey: Survey;
}

export function HomeResearchClient({ mockSurvey }: HomeResearchClientProps) {
  const { activeSurvey, setActiveSurvey } = useResearchContext();

  return (
    <>
      <button
        onClick={() => setActiveSurvey(mockSurvey)}
        className="rounded bg-purple-600 text-white px-4 py-2 mb-4"
      >
        Open Demo Survey
      </button>
      <ResearchModal survey={activeSurvey} onClose={() => setActiveSurvey(null)}>
        {activeSurvey && (
          <SurveyContainer survey={activeSurvey} onComplete={() => setActiveSurvey(null)} />
        )}
      </ResearchModal>
    </>
  );
}
