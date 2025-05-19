/**
 * LogisticsTabContent
 *
 * Tab content for trip logistics management
 */

'use client';

import { useState, useEffect } from 'react';
import { useLogistics } from '@/lib/hooks/use-logistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, X, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LogisticsTabContentProps {
  tripId: string;
  canEdit: boolean;
}

interface LogisticsItem {
  id: string;
  title: string;
  details: string | null;
}

export function LogisticsTabContent({ tripId, canEdit }: LogisticsTabContentProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: '', details: '' });
  const [editedItem, setEditedItem] = useState<LogisticsItem | null>(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  
  const { toast } = useToast();
  
  // Use our custom hook instead of direct API calls
  const { 
    logistics,
    isLoading,
    error,
    addLogisticsItem,
    updateLogisticsItem,
    deleteLogisticsItem,
    refreshLogistics
  } = useLogistics(tripId);

  // Handle form submission for adding a new logistics item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.title) {
      toast({ 
        title: 'Required field missing',
        description: 'Title is required',
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const result = await addLogisticsItem({
        title: newItem.title,
        details: newItem.details || null
      });
      
      if (result.success) {
        setNewItem({ title: '', details: '' });
        setIsAddingNewItem(false);
        toast({ title: 'Item added', description: 'Logistics item added successfully' });
      } else {
        toast({ 
          title: 'Failed to add item',
          description: result.error || 'An error occurred',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error adding logistics item:', error);
      toast({ 
        title: 'Failed to add item',
        description: 'An unexpected error occurred',
        variant: 'destructive' 
      });
    }
  };

  // Handle form submission for updating a logistics item
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editedItem || !editedItem.title) {
      toast({ 
        title: 'Required field missing',
        description: 'Title is required',
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const result = await updateLogisticsItem(editedItem.id, {
        title: editedItem.title,
        details: editedItem.details || null
      });
      
      if (result.success) {
        setEditingItem(null);
        setEditedItem(null);
        toast({ title: 'Item updated', description: 'Logistics item updated successfully' });
      } else {
        toast({ 
          title: 'Failed to update item',
          description: result.error || 'An error occurred',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error updating logistics item:', error);
      toast({ 
        title: 'Failed to update item',
        description: 'An unexpected error occurred',
        variant: 'destructive' 
      });
    }
  };

  // Handle logistics item deletion
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const result = await deleteLogisticsItem(id);
      
      if (result.success) {
        toast({ title: 'Item deleted', description: 'Logistics item deleted successfully' });
      } else {
        toast({ 
          title: 'Failed to delete item',
          description: result.error || 'An error occurred',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error deleting logistics item:', error);
      toast({ 
        title: 'Failed to delete item',
        description: 'An unexpected error occurred',
        variant: 'destructive' 
      });
    }
  };

  // Start editing a logistics item
  const handleStartEdit = (item: LogisticsItem) => {
    setEditingItem(item.id);
    setEditedItem(item);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Error loading logistics information</p>
        <Button variant="outline" onClick={refreshLogistics}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Trip Logistics</h2>
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNewItem(true)}
            disabled={isAddingNewItem}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Add Item</span>
          </Button>
        )}
      </div>

      {/* Add new item form */}
      {isAddingNewItem && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Logistics Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <Input
                  placeholder="Title (required)"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Details (optional)"
                  value={newItem.details}
                  onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingNewItem(false);
                    setNewItem({ title: '', details: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Display logistics items */}
      {logistics && logistics.length > 0 ? (
        <div className="space-y-4">
          {logistics.map((item) => (
            <Card key={item.id}>
              {editingItem === item.id ? (
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateItem} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Title (required)"
                        value={editedItem?.title || ''}
                        onChange={(e) => setEditedItem({ 
                          ...editedItem!, 
                          title: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Details (optional)"
                        value={editedItem?.details || ''}
                        onChange={(e) => setEditedItem({ 
                          ...editedItem!, 
                          details: e.target.value 
                        })}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingItem(null);
                          setEditedItem(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-1" />
                        <span>Save</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.title}</CardTitle>
                      {canEdit && (
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleStartEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.details ? (
                      <p className="whitespace-pre-line">{item.details}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No details provided</p>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            No logistics information added yet
          </p>
          {canEdit && !isAddingNewItem && (
            <Button onClick={() => setIsAddingNewItem(true)}>
              Add Your First Logistics Item
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default LogisticsTabContent;
