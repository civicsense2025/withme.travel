'use client';

import { useState, useCallback } from 'react';
import type { DisplayItineraryItem } from '@/types/itinerary';

/**
 * Hook to manage all sheet/modal UI states for the trip page
 */
export function useTripSheets() {
  // Sheet visibility states
  const [isEditTripSheetOpen, setIsEditTripSheetOpen] = useState(false);
  const [isEditItemSheetOpen, setIsEditItemSheetOpen] = useState(false);
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isMembersSheetOpen, setIsMembersSheetOpen] = useState(false);
  const [isPlaylistFormOpen, setIsPlaylistFormOpen] = useState(false);

  // Sheet context data
  const [editingItem, setEditingItem] = useState<DisplayItineraryItem | null>(null);
  const [addingItemToDay, setAddingItemToDay] = useState<number | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  /**
   * Open the edit trip sheet
   */
  const openEditTripSheet = useCallback(() => {
    setIsEditTripSheetOpen(true);
  }, []);

  /**
   * Open the edit item sheet with the given item
   */
  const openEditItemSheet = useCallback((item: DisplayItineraryItem) => {
    setEditingItem(item);
    setTargetSectionId(item.section_id ?? null);
    setIsEditItemSheetOpen(true);
  }, []);

  /**
   * Open the add item sheet for the given day
   */
  const openAddItemSheet = useCallback((dayNumber: number | null = null) => {
    setEditingItem(null);
    setAddingItemToDay(dayNumber);
    setIsAddItemSheetOpen(true);
  }, []);

  /**
   * Open the image selector for trip cover
   */
  const openImageSelector = useCallback(() => {
    setIsImageSelectorOpen(true);
  }, []);

  /**
   * Open the members sheet
   */
  const openMembersSheet = useCallback(() => {
    setIsMembersSheetOpen(true);
  }, []);

  /**
   * Open the playlist form
   */
  const openPlaylistForm = useCallback(() => {
    setIsPlaylistFormOpen(true);
  }, []);

  /**
   * Reset all sheet states
   */
  const resetSheetStates = useCallback(() => {
    setIsEditTripSheetOpen(false);
    setIsEditItemSheetOpen(false);
    setIsAddItemSheetOpen(false);
    setIsImageSelectorOpen(false);
    setIsMembersSheetOpen(false);
    setIsPlaylistFormOpen(false);
    setEditingItem(null);
    setAddingItemToDay(null);
    setTargetSectionId(null);
  }, []);

  return {
    // State
    isEditTripSheetOpen,
    isEditItemSheetOpen,
    isAddItemSheetOpen,
    isImageSelectorOpen,
    isMembersSheetOpen,
    isPlaylistFormOpen,
    editingItem,
    addingItemToDay,
    targetSectionId,
    
    // Setters
    setIsEditTripSheetOpen,
    setIsEditItemSheetOpen,
    setIsAddItemSheetOpen,
    setIsImageSelectorOpen,
    setIsMembersSheetOpen,
    setIsPlaylistFormOpen,
    setEditingItem,
    setAddingItemToDay,
    setTargetSectionId,
    
    // Actions
    openEditTripSheet,
    openEditItemSheet,
    openAddItemSheet,
    openImageSelector,
    openMembersSheet,
    openPlaylistForm,
    resetSheetStates,
  };
} 