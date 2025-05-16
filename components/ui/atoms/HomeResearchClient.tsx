'use client';
import { useResearchContext } from '@/app/context/research-context';
import { ResearchModal } from '@/components/research/ResearchModal';
import { SurveyContainer } from '@/components/research/SurveyContainer';
import type { Survey } from '@/types/research';

interface HomeResearchClientProps {
  mockSurvey: Survey;
}

export function HomeResearchClient({ mockSurvey }: HomeResearchClientProps) {
  const { activeSurvey } = useResearchContext();

  return (
    <>

{activeSurvey && <ResearchModal />}
    </>
  );
}
