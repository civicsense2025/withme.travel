'use client';

import { useState } from 'react';
import { useLogistics, type UseLogisticsResult } from '@/hooks/use-logistics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Plus, Trash, Edit, Check, X } from 'lucide-react';
import { type LogisticsItem, type AccommodationData, type TransportationData } from '@/lib/client/itinerary';
import { isSuccess } from '@/utils/result';
import { type FormData } from '@/lib/client/logistics';

export interface LogisticsManagerProps {
  tripId: string;
}

export function LogisticsManager({ tripId }: LogisticsManagerProps) {
  const logistics = useLogistics(tripId);
  
  const [newAccommodation, setNewAccommodation] = useState<AccommodationData>({
    title: '',
    location: '',
    description: '',
  });

  const [newTransportation, setNewTransportation] = useState<TransportationData>({
    title: '',
    departureLocation: '',
    arrivalLocation: '',
    description: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  });

  const handleAddAccommodation = async () => {
    if (!newAccommodation.title) return;
    
    const result = await logistics.addAccommodationItem({
      title: newAccommodation.title,
      location: newAccommodation.location,
      description: newAccommodation.description,
    });
    
    if (isSuccess(result)) {
      setNewAccommodation({
        title: '',
        location: '',
        description: '',
      });
    }
  };

  const handleAddTransportation = async () => {
    if (!newTransportation.title) return;
    
    const result = await logistics.addTransportationItem({
      title: newTransportation.title,
      departureLocation: newTransportation.departureLocation,
      arrivalLocation: newTransportation.arrivalLocation,
      description: newTransportation.description,
    });
    
    if (isSuccess(result)) {
      setNewTransportation({
        title: '',
        departureLocation: '',
        arrivalLocation: '',
        description: '',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await logistics.deleteItem(id);
    }
  };

  const startEditing = (item: LogisticsItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (item: LogisticsItem) => {
    if (editingId) {
      const result = await logistics.updateItem(editingId, {
        ...item,
        title: editForm.title,
        description: editForm.description,
        type: item.type,
      });
      
      if (isSuccess(result)) {
        setEditingId(null);
      }
    }
  };

  if (logistics.error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading logistics: {logistics.error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Accommodation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Accommodation</CardTitle>
            <CardDescription>Enter details about where you'll be staying</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="accom-title" className="block text-sm font-medium">Title</label>
                <Input
                  id="accom-title"
                  value={newAccommodation.title}
                  onChange={(e) => setNewAccommodation({ ...newAccommodation, title: e.target.value })}
                  placeholder="e.g., Hilton Hotel"
                />
              </div>
              <div>
                <label htmlFor="accom-location" className="block text-sm font-medium">Location</label>
                <Input
                  id="accom-location"
                  value={newAccommodation.location}
                  onChange={(e) => setNewAccommodation({ ...newAccommodation, location: e.target.value })}
                  placeholder="Address or location"
                />
              </div>
              <div>
                <label htmlFor="accom-description" className="block text-sm font-medium">Description</label>
                <Textarea
                  id="accom-description"
                  value={newAccommodation.description || ''}
                  onChange={(e) => setNewAccommodation({ ...newAccommodation, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddAccommodation} disabled={!newAccommodation.title}>
              <Plus className="w-4 h-4 mr-2" /> Add Accommodation
            </Button>
          </CardFooter>
        </Card>

        {/* Add Transportation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Transportation</CardTitle>
            <CardDescription>Enter details about how you'll be traveling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="trans-title" className="block text-sm font-medium">Title</label>
                <Input
                  id="trans-title"
                  value={newTransportation.title}
                  onChange={(e) => setNewTransportation({ ...newTransportation, title: e.target.value })}
                  placeholder="e.g., Flight to Paris"
                />
              </div>
              <div>
                <label htmlFor="departure" className="block text-sm font-medium">Departure</label>
                <Input
                  id="departure"
                  value={newTransportation.departureLocation}
                  onChange={(e) => setNewTransportation({ ...newTransportation, departureLocation: e.target.value })}
                  placeholder="Departure location"
                />
              </div>
              <div>
                <label htmlFor="arrival" className="block text-sm font-medium">Arrival</label>
                <Input
                  id="arrival"
                  value={newTransportation.arrivalLocation}
                  onChange={(e) => setNewTransportation({ ...newTransportation, arrivalLocation: e.target.value })}
                  placeholder="Arrival location"
                />
              </div>
              <div>
                <label htmlFor="trans-description" className="block text-sm font-medium">Description</label>
                <Textarea
                  id="trans-description"
                  value={newTransportation.description || ''}
                  onChange={(e) => setNewTransportation({ ...newTransportation, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddTransportation} disabled={!newTransportation.title}>
              <Plus className="w-4 h-4 mr-2" /> Add Transportation
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* List of Logistics Items */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Trip Logistics</h2>
        {logistics.isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading logistics...</span>
          </div>
        ) : logistics.items.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">No logistics items added yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {logistics.items.map((item: LogisticsItem) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => saveEdit(item)}>
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                        {item.type === 'accommodation' && item.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {item.location}</p>
                        )}
                        {item.type === 'transportation' && (
                          <p className="text-xs text-gray-500 mt-1">
                            {(item as TransportationData).departureLocation && (item as TransportationData).arrivalLocation
                              ? `${(item as TransportationData).departureLocation} → ${(item as TransportationData).arrivalLocation}`
                              : (item as TransportationData).departureLocation || (item as TransportationData).arrivalLocation}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => startEditing(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 