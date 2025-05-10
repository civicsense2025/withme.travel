import { getCookie as getNextCookie, setCookie as setNextCookie, deleteCookie as deleteNextCookie } from 'cookies-next';
import type { CookieValueTypes } from 'cookies-next';

// Constants for research cookie names
export const RESEARCH_COOKIE = {
  PARTICIPANT_ID: 'research_participant_id',
  STUDY_ID: 'research_study_id',
  STATUS: 'research_status',
};

// Cookie names
const RESEARCH_PARTICIPANT_ID = 'withme_research_participant_id';
const RESEARCH_STUDY_ID = 'withme_research_study_id';
const RESEARCH_STATUS = 'withme_research_status';
const RESEARCH_SURVEY_PROGRESS = 'withme_research_survey_progress';

// Cookie options - compatible with cookies-next
const COOKIE_OPTIONS = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

// Session types
export interface ResearchSession {
  participantId: string | null;
  studyId: string | null;
  status: 'invited' | 'active' | 'completed' | 'dropped' | null;
}

export interface SurveyProgress {
  surveyId: string;
  answers: Record<string, any>;
  questionIndex: number;
  lastUpdated: string;
}

/**
 * Get a cookie value
 */
function getCookie(name: string): string | null {
  const value = getNextCookie(name) as CookieValueTypes;
  return value ? String(value) : null;
}

/**
 * Set a cookie value
 */
function setCookie(name: string, value: string): void {
  setNextCookie(name, value, COOKIE_OPTIONS);
}

/**
 * Remove a cookie
 */
function removeCookie(name: string): void {
  deleteNextCookie(name);
}

/**
 * Get the current research session from cookies
 */
export function getResearchSession(): ResearchSession {
  return {
    participantId: getCookie(RESEARCH_PARTICIPANT_ID),
    studyId: getCookie(RESEARCH_STUDY_ID),
    status: getCookie(RESEARCH_STATUS) as any,
  };
}

/**
 * Set research session cookies
 */
export function setResearchSession(
  participantId: string,
  studyId: string,
  status: 'invited' | 'active' | 'completed' | 'dropped' = 'active'
): void {
  setCookie(RESEARCH_PARTICIPANT_ID, participantId);
  setCookie(RESEARCH_STUDY_ID, studyId);
  setCookie(RESEARCH_STATUS, status);
}

/**
 * Clear all research session cookies
 */
export function clearResearchSession(): void {
  removeCookie(RESEARCH_PARTICIPANT_ID);
  removeCookie(RESEARCH_STUDY_ID);
  removeCookie(RESEARCH_STATUS);
  removeCookie(RESEARCH_SURVEY_PROGRESS);
}

/**
 * Check if the user is in a research session
 */
export function isInResearchSession(): boolean {
  const session = getResearchSession();
  return !!(session.participantId && session.studyId && session.status === 'active');
}

/**
 * Save survey progress for resumption
 */
export function saveSurveyProgress(
  surveyId: string,
  answers: Record<string, any>,
  questionIndex: number
): void {
  const progress: SurveyProgress = {
    surveyId,
    answers,
    questionIndex,
    lastUpdated: new Date().toISOString(),
  };
  
  setCookie(RESEARCH_SURVEY_PROGRESS, JSON.stringify(progress));
}

/**
 * Get saved survey progress
 */
export function getSurveyProgress(): SurveyProgress | null {
  const progressJson = getCookie(RESEARCH_SURVEY_PROGRESS);
  
  if (!progressJson) return null;
  
  try {
    return JSON.parse(progressJson) as SurveyProgress;
  } catch (error) {
    console.error('Error parsing survey progress:', error);
    return null;
  }
}

/**
 * Clear survey progress
 */
export function clearSurveyProgress(): void {
  removeCookie(RESEARCH_SURVEY_PROGRESS);
} 