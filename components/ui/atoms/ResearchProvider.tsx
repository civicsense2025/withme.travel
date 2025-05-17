import React, { createContext, useContext, useState } from 'react';

interface ResearchContextType {
  showSurvey: boolean;
  setShowSurvey: (show: boolean) => void;
  trackEvent: (eventName: string, data?: Record<string, any>) => void;
}

const ResearchContext = createContext<ResearchContextType>({
  showSurvey: false,
  setShowSurvey: () => {},
  trackEvent: () => {},
});

export const useResearch = () => useContext(ResearchContext);

export interface ResearchProviderProps {
  children: React.ReactNode;
}

export const ResearchProvider: React.FC<ResearchProviderProps> = ({ children }) => {
  const [showSurvey, setShowSurvey] = useState(false);

  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    // Implementation would go here
    console.log('Research tracking:', eventName, data);
  };

  return (
    <ResearchContext.Provider
      value={{
        showSurvey,
        setShowSurvey,
        trackEvent,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
}; 