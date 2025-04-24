"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2, GripVertical, MapPin, Clock, DollarSign, ArrowUp, ArrowDown, Edit, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { API_ROUTES } from "@/utils/constants"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Place } from '@/types/places'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { debounce } from 'lodash'
import { useItineraryItems } from '@/hooks/useItineraryItems'
import { Trip } from '@/types/trip'
import { ItineraryItemCard } from './ItineraryItemCard'
import { DayDropZone } from './DayDropZone'
import { User } from '@supabase/supabase-js'
import { Separator } from '@/components/ui/separator'

interface ItineraryBuilderProps {
  trip: Trip;
  user: User | null;
}

export function ItineraryBuilder({ trip, user }: ItineraryBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const tripId = trip.id;

  const {
    itemsByDay,
    durationDays,
    isLoadingItineraryItems,
    addItem,
    deleteItem,
    moveItem,
    voteItem,
    fetchItineraryItems,
    saveItemEdit,
    editingItemId,
    inlineEditValue,
    handleStartInlineEdit,
    handleInlineEditChange,
    handleCancelInlineEdit,
    handleSaveInlineEdit,
  } = useItineraryItems(tripId);

  const [newItemForms, setNewItemForms] = useState<{ [day: number]: boolean }>({});
  const [newItemsData, setNewItemsData] = useState<{ [day: number]: any }>({});
  const [isAdding, setIsAdding] = useState<{ [day: number]: boolean }>({});

  const dayNumbers = useMemo(() => {
    const days = new Set<number>([0]);
    for (let i = 1; i <= durationDays; i++) {
      days.add(i);
    }
    Object.keys(itemsByDay).forEach(dayStr => {
        const dayNum = parseInt(dayStr, 10);
        if (!isNaN(dayNum)) {
            days.add(dayNum);
        }
    });
    const sortedDays = Array.from(days).sort((a, b) => (a === 0 ? -1 : (b === 0 ? 1 : a - b)));
    return sortedDays;
  }, [durationDays, itemsByDay]);

  const handlePlaceSelect = (place: Place | null, dayNumber: number) => {
    if (place) {
      setNewItemsData(prev => ({
        ...prev,
        [dayNumber]: {
          ...prev[dayNumber],
          title: place.description || '',
          place_id: place.place_id,
        }
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, dayNumber: number) => {
    const { name, value } = e.target;
    setNewItemsData(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [name]: value
      }
    }));
  };

  const handleSelectChange = (value: string, name: string, dayNumber: number) => {
    setNewItemsData(prev => ({
        ...prev,
        [dayNumber]: {
            ...prev[dayNumber],
            [name]: value,
        },
    }));
  };

  const handleToggleNewItemForm = (dayNumber: number) => {
    setNewItemForms(prev => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
    if (!newItemForms[dayNumber]) {
      setNewItemsData(prev => ({
          ...prev,
          [dayNumber]: {
              title: '',
              description: '',
              day_number: dayNumber,
              is_custom: true
            }
        }));
    }
  };

  const handleAddItem = async (dayNumber: number) => {
    setIsAdding(prev => ({ ...prev, [dayNumber]: true }));
    const itemData = newItemsData[dayNumber];

    if (!itemData || !itemData.title) {
      toast({ title: "Missing Title", description: "Please enter a title for the item.", variant: "destructive" });
      setIsAdding(prev => ({ ...prev, [dayNumber]: false }));
      return;
    }

    const payload = {
        title: itemData.title,
        description: itemData.description || null,
        day_number: dayNumber,
        place_id: itemData.place_id || null,
        address: itemData.address || null,
        latitude: itemData.latitude ? parseFloat(itemData.latitude) : null,
        longitude: itemData.longitude ? parseFloat(itemData.longitude) : null,
        start_time: itemData.start_time || null,
        end_time: itemData.end_time || null,
        estimated_cost: itemData.estimated_cost ? parseFloat(itemData.estimated_cost) : null,
        currency: itemData.currency || trip.default_currency || null,
        duration_minutes: itemData.duration_minutes ? parseInt(itemData.duration_minutes, 10) : null,
        is_custom: itemData.is_custom !== undefined ? itemData.is_custom : true,
        status: 'suggested',
    };

    const addedItem = await addItem(payload);

    if (addedItem) {
      setNewItemsData(prev => ({ ...prev, [dayNumber]: {} }));
      setNewItemForms(prev => ({ ...prev, [dayNumber]: false }));
      toast({ title: "Item Added", description: `${addedItem.title} added to Day ${dayNumber}.` });
    }
    setIsAdding(prev => ({ ...prev, [dayNumber]: false }));
  };

  const handleMoveItem = (itemId: string, targetItemId: string | null, targetDayNumber: number) => {
    moveItem(itemId, targetItemId, targetDayNumber);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
  };

  const handleVoteItem = (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => {
    if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to vote.", variant: "destructive" });
        return;
    }
    voteItem(itemId, dayNumber, voteType);
  };

  const renderDayColumn = (dayNumber: number) => {
    const dayItems = itemsByDay[dayNumber] || [];
    const isFormOpen = newItemForms[dayNumber];
    const formData = newItemsData[dayNumber] || {};

    return (
      <Card key={`day-${dayNumber}`} className="h-full flex flex-col min-w-[300px] md:min-w-[350px] mr-4 border-l-4 border-l-blue-500">
        <CardHeader className="p-4 border-b bg-slate-50 dark:bg-slate-800">
          <CardTitle className="text-lg font-semibold flex justify-between items-center">
            <span>Day {dayNumber === 0 ? 'Unscheduled' : dayNumber}</span>
            {dayNumber !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleNewItemForm(dayNumber)}
                aria-expanded={isFormOpen}
                className="ml-2"
              >
                <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} />
                <span className="sr-only">{isFormOpen ? 'Cancel Adding Item' : 'Add New Item'}</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow">
         <CardContent className="p-0">
            <DayDropZone dayNumber={dayNumber} onDropItem={handleMoveItem}>
              {dayItems.length === 0 && !isFormOpen && (
                <div className="p-4 text-center text-sm text-muted-foreground italic h-20 flex items-center justify-center">
                  {dayNumber === 0 ? "Drag items here to unschedule" : "Drag items or add new ones"}
                </div>
              )}
               {dayItems.map((item) => (
                  <ItineraryItemCard
                      key={item.id}
                      item={item}
                      onMoveItem={handleMoveItem}
                      onDeleteItem={handleDeleteItem}
                      onVote={handleVoteItem}
                      onStartEdit={handleStartInlineEdit}
                      onSaveTitleEdit={handleSaveInlineEdit}
                      isEditing={editingItemId === item.id}
                      editValue={inlineEditValue}
                      onEditChange={handleInlineEditChange}
                      onCancelEdit={handleCancelInlineEdit}
                      user={user}
                  />
              ))}
              <div className="min-h-[5px]"></div>
            </DayDropZone>

            {isFormOpen && dayNumber !== 0 && (
              <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 mt-auto">
                <form onSubmit={(e) => { e.preventDefault(); handleAddItem(dayNumber); }}>
                  <div className="space-y-3">
                     <Input
                       type="text"
                       name="title"
                       placeholder="Activity Title"
                       value={formData.title || ''}
                       onChange={(e) => handleInputChange(e, dayNumber)}
                       required
                       className="font-medium"
                     />
                    <Textarea
                      name="description"
                      placeholder="Notes (optional)"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange(e, dayNumber)}
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                       <Input
                          type="time"
                          name="start_time"
                          value={formData.start_time || ''}
                          onChange={(e) => handleInputChange(e, dayNumber)}
                          aria-label="Start Time"
                       />
                       <Input
                          type="time"
                          name="end_time"
                          value={formData.end_time || ''}
                          onChange={(e) => handleInputChange(e, dayNumber)}
                          aria-label="End Time"
                       />
                       <Input
                           type="number"
                           name="estimated_cost"
                           placeholder="Cost"
                           value={formData.estimated_cost || ''}
                           onChange={(e) => handleInputChange(e, dayNumber)}
                           min="0" step="any" aria-label="Estimated Cost"
                       />
                       <Select
                            name="currency"
                            value={formData.currency || trip.default_currency || ''}
                            onValueChange={(value) => handleSelectChange(value, 'currency', dayNumber)}
                        >
                           <SelectTrigger aria-label="Currency">
                               <SelectValue placeholder="Currency" />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="USD">USD</SelectItem>
                               <SelectItem value="EUR">EUR</SelectItem>
                               <SelectItem value="GBP">GBP</SelectItem>
                           </SelectContent>
                       </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleToggleNewItemForm(dayNumber)}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={isAdding[dayNumber]}>
                        {isAdding[dayNumber] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Add Item
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
          </ScrollArea>
      </Card>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold tracking-tight">{trip.name} - Itinerary</h2>
        </div>
        <Separator />

        {isLoadingItineraryItems && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading itinerary...</p>
          </div>
        )}

        {!isLoadingItineraryItems && (
           <ScrollArea className="w-full whitespace-nowrap pb-4">
               <div className="flex space-x-4">
                   {dayNumbers.map(dayNumber => renderDayColumn(dayNumber))}
               </div>
               <ScrollBar orientation="horizontal" />
           </ScrollArea>
        )}
      </div>
    </DndProvider>
  );
}