"use client";
import { createContext, useContext, useState, useEffect } from "react";
const SearchContext = createContext(undefined);
export function SearchProvider({ children }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchHistory, setSearchHistory] = useState([]);
    // Load search history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem("withme-search-history");
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                setSearchHistory(parsedHistory);
            }
            catch (error) {
                console.error("Failed to parse search history:", error);
                localStorage.removeItem("withme-search-history");
            }
        }
    }, []);
    // Save search history to localStorage
    useEffect(() => {
        if (searchHistory.length > 0) {
            localStorage.setItem("withme-search-history", JSON.stringify(searchHistory));
        }
    }, [searchHistory]);
    // Listen for keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    const openSearch = () => {
        setIsSearchOpen(true);
    };
    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
    };
    const addToSearchHistory = (query, type) => {
        if (!query.trim())
            return;
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
        localStorage.removeItem("withme-search-history");
    };
    return (<SearchContext.Provider value={{
            isSearchOpen,
            openSearch,
            closeSearch,
            searchQuery,
            setSearchQuery,
            searchHistory,
            addToSearchHistory,
            clearSearchHistory,
        }}>
      {children}
    </SearchContext.Provider>);
}
export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}
