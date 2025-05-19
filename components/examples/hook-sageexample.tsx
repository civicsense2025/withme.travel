'use client';

import { useState } from 'react';
import { usePermissions, useLogistics, useItineraries } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

/**
 * Hook Usage Example
 *
 * Demonstrates how to use the standardized hooks API pattern
 * to interact with backend services.
 */
export function HookUsageExample({ tripId }: { tripId: string }) {
  const [activeTab, setActiveTab] = useState<'permissions' | 'logistics' | 'itineraries'>('permissions');
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Hooks API Example</CardTitle>
        <div className="flex space-x-2 mt-2">
          <Button 
            variant={activeTab === 'permissions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </Button>
          <Button 
            variant={activeTab === 'logistics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('logistics')}
          >
            Logistics
          </Button>
          <Button 
            variant={activeTab === 'itineraries' ? 'default' : 'outline'}
            onClick={() => setActiveTab('itineraries')}
          >
            Itineraries
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'permissions' && <PermissionsExample tripId={tripId} />}
        {activeTab === 'logistics' && <LogisticsExample tripId={tripId} />}
        {activeTab === 'itineraries' && <ItinerariesExample />}
      </CardContent>
    </Card>
  );
}

function PermissionsExample({ tripId }: { tripId: string }) {
  const { 
    permissions, 
    requests, 
    isLoading, 
    error,
    requestAccess,
    approveRequest,
    rejectRequest
  } = usePermissions(tripId);
  
  if (isLoading) {
    return <div>Loading permissions...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Your Permissions</h3>
        {permissions ? (
          <ul className="list-disc list-inside">
            <li>View: {permissions.canView ? 'Yes' : 'No'}</li>
            <li>Edit: {permissions.canEdit ? 'Yes' : 'No'}</li>
            <li>Manage: {permissions.canManage ? 'Yes' : 'No'}</li>
            <li>Add Members: {permissions.canAddMembers ? 'Yes' : 'No'}</li>
            <li>Delete Trip: {permissions.canDeleteTrip ? 'Yes' : 'No'}</li>
            <li>Role: {permissions.role || 'None'}</li>
          </ul>
        ) : (
          <p>No permissions data available</p>
        )}
      </div>
      
      {permissions?.canManage && requests.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Access Requests</h3>
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id} className="py-2">
                <p>
                  User requested "{request.requested_role}" access
                  {request.message && <span className="block italic text-sm">"{request.message}"</span>}
                </p>
                {request.status === 'pending' && (
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={() => approveRequest(request.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => rejectRequest(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {request.status !== 'pending' && (
                  <p className="text-sm mt-1">
                    Status: <span className="font-medium">{request.status}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {!permissions?.canEdit && (
        <div className="mt-4">
          <Button
            onClick={() => requestAccess({ requestedRole: 'editor', message: 'I need to edit this trip.' })}
          >
            Request Edit Access
          </Button>
        </div>
      )}
    </div>
  );
}

function LogisticsExample({ tripId }: { tripId: string }) {
  const { 
    items, 
    isLoading, 
    error,
    addAccommodationItem,
    addTransportationItem,
    deleteItem
  } = useLogistics(tripId);
  
  if (isLoading) {
    return <div>Loading logistics...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  const accommodations = items.filter(item => item.type === 'accommodation');
  const transportation = items.filter(item => item.type === 'transportation');
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Accommodations</h3>
          <Button 
            size="sm"
            onClick={() => addAccommodationItem({
              title: 'New Hotel',
              location: 'Sample City',
              startDate: '2023-07-01',
              endDate: '2023-07-05'
            })}
          >
            Add
          </Button>
        </div>
        
        {accommodations.length === 0 ? (
          <p className="text-gray-500 text-sm">No accommodations added yet</p>
        ) : (
          <ul className="space-y-2">
            {accommodations.map(item => (
              <li key={item.id} className="border rounded-md p-3 bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.location && <p className="text-sm text-gray-600">{item.location}</p>}
                    {item.startDate && item.endDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Transportation</h3>
          <Button 
            size="sm"
            onClick={() => addTransportationItem({
              title: 'Flight to Destination',
              departureLocation: 'Home City',
              arrivalLocation: 'Destination City',
              departureDate: '2023-06-30',
              arrivalDate: '2023-06-30'
            })}
          >
            Add
          </Button>
        </div>
        
        {transportation.length === 0 ? (
          <p className="text-gray-500 text-sm">No transportation added yet</p>
        ) : (
          <ul className="space-y-2">
            {transportation.map(item => (
              <li key={item.id} className="border rounded-md p-3 bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.departureLocation && item.arrivalLocation && (
                      <p className="text-sm text-gray-600">
                        {item.departureLocation} to {item.arrivalLocation}
                      </p>
                    )}
                    {item.departureDate && item.arrivalDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.departureDate).toLocaleDateString()} - {new Date(item.arrivalDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ItinerariesExample() {
  const { 
    templates, 
    popularTemplates,
    isLoading, 
    error,
    loadPopularTemplates
  } = useItineraries();
  
  if (isLoading) {
    return <div>Loading itinerary templates...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Popular Templates</h3>
          <Button 
            size="sm"
            onClick={() => loadPopularTemplates(5)}
          >
            Refresh
          </Button>
        </div>
        
        {popularTemplates.length === 0 ? (
          <p className="text-gray-500 text-sm">No popular templates available</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {popularTemplates.map(template => (
              <Card key={template.id} className="h-full">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.description || 'No description available'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {template.duration_days} days • Used {template.use_count} times
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-medium mb-3">All Templates</h3>
        
        {templates.length === 0 ? (
          <p className="text-gray-500 text-sm">No templates available</p>
        ) : (
          <ul className="space-y-2">
            {templates.map(template => (
              <li key={template.id} className="border rounded-md p-3 bg-gray-50">
                <p className="font-medium">{template.title}</p>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {template.description || 'No description available'}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                  <span>{template.duration_days} days</span>
                  <span>•</span>
                  <span>Views: {template.view_count}</span>
                  <span>•</span>
                  <span>Used: {template.use_count} times</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 