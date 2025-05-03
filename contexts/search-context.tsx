'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

type SearchHistoryItem = {
  query: string;
  type: 'destination' | 'trip' | 'command';
  timestamp: number;
};

type SearchContextType = {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchHistory: SearchHistoryItem[];
  addToSearchHistory: (query: string, type: 'destination' | 'trip' | 'command') => void;
  clearSearchHistory: () => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('withme-search-history');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setSearchHistory(parsedHistory);
        } catch (error) {
          console.error('Failed to parse search history:', error);
          localStorage.removeItem('withme-search-history');
        }
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('withme-search-history', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const addToSearchHistory = (query: string, type: 'destination' | 'trip' | 'command') => {
    if (!query.trim()) return;

    setSearchHistory((prev) => {
      // Remove duplicates
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());

      // Add new item at the beginning
      const newHistory = [{ query, type, timestamp: Date.now() }, ...filtered].slice(0, 10); // Keep only the 10 most recent searches

      return newHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('withme-search-history');
  };

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        searchQuery,
        setSearchQuery,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
