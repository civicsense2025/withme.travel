'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Before and After API Implementation Example
 * 
 * This component demonstrates the transition from direct API calls
 * to using standardized hooks.
 */
export function BeforeAfterExample({ tripId }: { tripId: string }) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>API Implementation Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="before">
          <TabsList className="w-full">
            <TabsTrigger value="before" className="flex-1">Before: Direct API Calls</TabsTrigger>
            <TabsTrigger value="after" className="flex-1">After: Hook-Based Approach</TabsTrigger>
          </TabsList>
          <TabsContent value="before">
            <DirectApiExample tripId={tripId} />
          </TabsContent>
          <TabsContent value="after">
            <HookBasedExample tripId={tripId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Before: Using direct API calls
 * Issues:
 * - Duplicate loading/error handling logic
 * - Inconsistent error handling
 * - No standard pattern for API interaction
 * - Each component reimplements the same logic
 */
function DirectApiExample({ tripId }: { tripId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);

  // Fetch permissions
  useEffect(() => {
    async function fetchPermissions() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/trips/${tripId}/get-permissions`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch permissions');
        }
        
        const data = await response.json();
        setPermissions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch permissions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPermissions();
  }, [tripId]);

  // Fetch access requests
  useEffect(() => {
    async function fetchAccessRequests() {
      try {
        const response = await fetch(`/api/trips/${tripId}/access-requests`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch access requests');
        }
        
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch access requests:', err);
        // Note: Error handling is inconsistent (not updating state like in fetchPermissions)
      }
    }
    
    fetchAccessRequests();
  }, [tripId]);

  // Request access
  const handleRequestAccess = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/trips/${tripId}/permissions/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'I need to edit this trip.',
          requestedRole: 'editor',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request access');
      }
      
      alert('Access requested successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to request access:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Approve request
  const handleApproveRequest = async (requestId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/trips/${tripId}/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve request');
      }
      
      // Update local state to reflect the change
      setRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status: 'approved' } : req)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to approve request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Your Permissions (Direct API)</h3>
        {permissions ? (
          <ul className="list-disc list-inside">
            <li>View: {permissions.canView ? 'Yes' : 'No'}</li>
            <li>Edit: {permissions.canEdit ? 'Yes' : 'No'}</li>
            <li>Manage: {permissions.canManage ? 'Yes' : 'No'}</li>
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
            {requests.map((request: any) => (
              <li key={request.id} className="py-2">
                <p>
                  User requested "{request.requested_role}" access
                  {request.message && <span className="block italic text-sm">"{request.message}"</span>}
                </p>
                {request.status === 'pending' && (
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      Approve
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
          <Button onClick={handleRequestAccess}>
            Request Edit Access
          </Button>
        </div>
      )}
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-600">
          <strong>Issues with this approach:</strong>
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
          <li>Duplicate loading/error state management</li>
          <li>Inconsistent error handling</li>
          <li>No centralized data fetching logic</li>
          <li>Every component must reimplement the same patterns</li>
          <li>Harder to maintain as API changes</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * After: Using the standardized hook-based approach
 * Benefits:
 * - Centralized data fetching logic
 * - Consistent error handling
 * - Reusable patterns across components
 * - Easier to maintain as API changes
 */
function HookBasedExample({ tripId }: { tripId: string }) {
  const { 
    permissions, 
    requests, 
    isLoading, 
    error,
    requestAccess,
    approveRequest
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
        <h3 className="font-medium mb-2">Your Permissions (Hook-Based)</h3>
        {permissions ? (
          <ul className="list-disc list-inside">
            <li>View: {permissions.canView ? 'Yes' : 'No'}</li>
            <li>Edit: {permissions.canEdit ? 'Yes' : 'No'}</li>
            <li>Manage: {permissions.canManage ? 'Yes' : 'No'}</li>
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
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-600">
          <strong>Benefits of this approach:</strong>
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
          <li>Centralized data fetching and state management</li>
          <li>Consistent error handling</li>
          <li>Component code is cleaner and more focused</li>
          <li>Reusable patterns across the application</li>
          <li>Easier to update APIs in one place</li>
          <li>Better TypeScript type support</li>
        </ul>
      </div>
    </div>
  );
} 