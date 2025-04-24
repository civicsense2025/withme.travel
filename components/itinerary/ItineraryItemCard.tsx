import React, { useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItineraryItem } from "@/types/itinerary"; // Assuming types are moved or defined here
import { MapPin, Clock, DollarSign, Edit, Trash2, GripVertical } from "lucide-react";
import { useDrag, ConnectDragSource, ConnectDragPreview } from 'react-dnd';

// Define ItemTypes locally
const ItemTypes = {
  ITINERARY_ITEM: 'itineraryItem',
};

// Props interface matching the one defined in ItineraryBuilder
interface ItineraryItemCardProps {
  item: ItineraryItem;
  dayNumber: number;
  // State and handlers related to inline editing (passed from parent/hook)
  editingItemId: string | null; 
  inlineEditValue: string; 
  handleStartInlineEdit: (item: ItineraryItem) => void;
  handleInlineEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCancelInlineEdit: () => void; // Added for clarity
  handleSaveInlineEdit: () => void; // Added for clarity
  // Other action handlers
  onDeleteItem: (itemId: string) => void;
  onVote: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => void;
}

export const ItineraryItemCard: React.FC<ItineraryItemCardProps> = ({ 
    item, 
    dayNumber,
    editingItemId,
    inlineEditValue,
    handleStartInlineEdit,
    handleInlineEditChange,
    handleCancelInlineEdit,
    handleSaveInlineEdit,
    onDeleteItem,
    onVote,
}) => { 
  const internalRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, preview] = useDrag(() => ({
      type: ItemTypes.ITINERARY_ITEM,
      item: { id: item.id, dayNumber: item.day_number ?? 0 }, 
      collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [item.id, item.day_number]); 

  drag(internalRef);
  preview(internalRef);

  const isEditing = editingItemId === item.id;

  return (
    <div 
       ref={internalRef}
       style={{ opacity: isDragging ? 0.5 : 1 }} 
       className="mb-2 bg-background p-3 rounded-lg shadow-sm border relative group"
     >
       <div className="absolute top-1/2 -left-2 -translate-y-1/2 cursor-move p-1 opacity-0 group-hover:opacity-50">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      <div className="flex justify-between items-start ml-4">
         <div className="flex-1 pr-2">
            {isEditing ? (
                  <Input
                      value={inlineEditValue} 
                      onChange={handleInlineEditChange} 
                      onBlur={handleCancelInlineEdit}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineEdit();
                          if (e.key === 'Escape') handleCancelInlineEdit(); 
                      }}
                      autoFocus
                      className="h-8 text-base font-semibold"
                  />
            ) : (
               <p className="font-semibold cursor-pointer" onClick={() => handleStartInlineEdit(item)}>{item.title}</p>
            )}
            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
            {item.address && <p className="text-sm flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {item.address}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
                {item.start_time && (
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {item.start_time}{item.end_time ? ` - ${item.end_time}` : ''}{item.duration_minutes && ` (${item.duration_minutes} min)`}</span>
                )}
                {item.estimated_cost && (
                    <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1"/> {item.estimated_cost} {item.currency || ''}</span>
                )}
            </div>
         </div>
         <div className="pl-2 flex flex-col items-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleStartInlineEdit(item)} className="h-7 w-7 opacity-0 group-hover:opacity-100">
                 <Edit className="w-4 h-4"/>
              </Button>
         </div>
      </div>
       {/* Vote Buttons would go here, using onVote prop */}
       {/* Example: <button onClick={() => onVote(item.id, item.day_number, 'up')}>Up</button> */}

       {/* Delete Button */}
       <Button 
         variant="ghost" 
         size="icon" 
         onClick={() => onDeleteItem(item.id)} 
         className="h-7 w-7 opacity-0 group-hover:opacity-100 absolute bottom-1 right-1"
       >
           <Trash2 className="w-4 h-4 text-destructive"/>
       </Button>
    </div>
  );
} 