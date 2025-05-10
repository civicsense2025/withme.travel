'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import Cookies from 'js-cookie';

// Research cookies constants
const RESEARCH_PARTICIPANT_ID_COOKIE = 'research_participant_id';
const RESEARCH_STUDY_ID_COOKIE = 'research_study_id';
const RESEARCH_SESSION_COOKIE = 'research_session';
const COOKIE_EXPIRY_DAYS = 7;

interface ResearchSessionData {
  isResearchSession: boolean;
  participantId: string | null;
  studyId: string | null;
}

/**
 * Hook to access research session data from cookies and URL parameters
 * This handles detection of research participants coming from research links
 */
export function useResearchSession(): ResearchSessionData {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = getBrowserClient();
  const [isResearchSession, setIsResearchSession] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [studyId, setStudyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // First check URL parameters (new research participants)
    const searchParams = new URLSearchParams(window.location.search);
    const isResearch = searchParams.get('research') === 'true';
    const urlParticipantId = searchParams.get('pid');
    const urlStudyId = searchParams.get('sid');
    
    // If URL has research parameters, store them in cookies
    if (isResearch && urlParticipantId && urlStudyId) {
      // Save to cookies for persistence across the session
      Cookies.set('research_participant_id', urlParticipantId, { expires: 7 });
      Cookies.set('research_study_id', urlStudyId, { expires: 7 });
      Cookies.set('research_mode', 'true', { expires: 7 });
      
      // Update state
      setIsResearchSession(true);
      setParticipantId(urlParticipantId);
      setStudyId(urlStudyId);
      
      // Remove the parameters from the URL to avoid sharing issues
      // Use history API to update URL without reloading page
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      return;
    }
    
    // Otherwise check cookies for existing research session
    const cookieParticipantId = Cookies.get('research_participant_id');
    const cookieStudyId = Cookies.get('research_study_id');
    const cookieResearchMode = Cookies.get('research_mode') === 'true';
    
    if (cookieResearchMode && cookieParticipantId && cookieStudyId) {
      setIsResearchSession(true);
      setParticipantId(cookieParticipantId);
      setStudyId(cookieStudyId);
    }
  }, [router]);
  
  useEffect(() => {
    async function initResearchSession() {
      try {
        setIsLoading(true);
        
        // Check URL parameters first for initial entry
        const research = searchParams?.get('research');
        const pid = searchParams?.get('pid');
        const sid = searchParams?.get('sid');
        
        if (research === 'true' && pid && sid) {
          // Save to cookies for persistence across the session
          Cookies.set(RESEARCH_PARTICIPANT_ID_COOKIE, pid, { expires: COOKIE_EXPIRY_DAYS });
          Cookies.set(RESEARCH_STUDY_ID_COOKIE, sid, { expires: COOKIE_EXPIRY_DAYS });
          Cookies.set(RESEARCH_SESSION_COOKIE, 'true', { expires: COOKIE_EXPIRY_DAYS });
          
          setParticipantId(pid);
          setStudyId(sid);
          setIsResearchSession(true);
          
          // Update participant status to active
          await supabase
            .from(TABLES.RESEARCH_PARTICIPANTS)
            .update({ status: 'active' })
            .eq('id', pid);
          
          // Log session start event
          await trackEvent('research_session_start', { url: pathname });
        } else {
          // Check if we have research cookies from previous page loads
          const savedPid = Cookies.get(RESEARCH_PARTICIPANT_ID_COOKIE);
          const savedSid = Cookies.get(RESEARCH_STUDY_ID_COOKIE);
          const savedSession = Cookies.get(RESEARCH_SESSION_COOKIE);
          
          if (savedPid && savedSid && savedSession === 'true') {
            setParticipantId(savedPid);
            setStudyId(savedSid);
            setIsResearchSession(true);
            
            // Log page navigation event
            await trackEvent('page_navigation', { url: pathname });
          }
        }
      } catch (error) {
        console.error('Error initializing research session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initResearchSession();
  }, [pathname, searchParams, supabase]);
  
  // Track an event for the current research session
  const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    if (!isResearchSession || !participantId || !studyId) return;
    
    try {
      await supabase.from(TABLES.RESEARCH_EVENTS).insert({
        participant_id: participantId,
        study_id: studyId,
        event_name: eventName,
        metadata
      });
    } catch (error) {
      console.error(`Error tracking research event ${eventName}:`, error);
    }
  };
  
  // End the current research session
  const endSession = () => {
    Cookies.remove(RESEARCH_PARTICIPANT_ID_COOKIE);
    Cookies.remove(RESEARCH_STUDY_ID_COOKIE);
    Cookies.remove(RESEARCH_SESSION_COOKIE);
    
    setParticipantId(null);
    setStudyId(null);
    setIsResearchSession(false);
    
    // No need to try/catch this as we're ending the session anyway
    if (participantId && studyId) {
      supabase
        .from(TABLES.RESEARCH_PARTICIPANTS)
        .update({ status: 'completed' })
        .eq('id', participantId)
        .then(() => {
          console.log('Research session completed');
        })
        .catch((error: unknown) => {
          console.error('Error completing research session:', error);
        });
    }
  };
  
  return { 
    isResearchSession, 
    participantId, 
    studyId, 
    isLoading,
    trackEvent,
    endSession
  };
} 