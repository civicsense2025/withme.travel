'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useTripMembers } from '@/lib/hooks/use-trip-members';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import type { TripRole } from '@/utils/constants/status';

/**
 * Gets initials from a name
 */
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format error for display
 */
function formatError(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return fallback;
}

interface TripPermissionManagerProps {
  tripId: string;
  onRequestsUpdated?: () => void;
}

/**
 * Trip Permission Manager component
 * Handles access requests for a trip
 */
export function TripPermissionManager({ tripId, onRequestsUpdated }: TripPermissionManagerProps) {
  const [requestProcessing, setRequestProcessing] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [accessRequestsLoading, setAccessRequestsLoading] = useState(false);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
   
  // Use the permissions hook with the tripId
  const { 
    requests, 
    refreshRequests,
    approveRequest,
    rejectRequest,
    isLoading: isPermissionsLoading,
    error: permissionsError
  } = usePermissions(tripId);

  // Use the trip members hook
  const { 
    isLoading: isTripMembersLoading
  } = useTripMembers(tripId);

  // Update local state when requests change
  useEffect(() => {
    if (requests) {
      setAccessRequests(requests);
    }
  }, [requests]);
   
  // Fetch access requests
  const fetchAccessRequests = async () => {
    try {
      setAccessRequestsLoading(true);
      await refreshRequests();
      if (onRequestsUpdated) {
        onRequestsUpdated();
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
      setFetchError(formatError(error, 'Failed to load access requests'));
    } finally {
      setAccessRequestsLoading(false);
    }
  };

  // Approve access request
  const handleApproveRequest = async (requestId: string, role: TripRole = 'viewer') => {
    try {
      setRequestProcessing(requestId);
      const result = await approveRequest(requestId);
      
      if (result.success) {
        // Refresh access requests list
        fetchAccessRequests();
      } else {
        console.error('Error approving request:', result.error);
        setFetchError(formatError(result.error, 'An error occurred while approving the request'));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      setFetchError(formatError(error, 'An error occurred while approving the request'));
    } finally {
      setRequestProcessing('');
    }
  };

  // Deny access request
  const handleDenyRequest = async (requestId: string) => {
    try {
      setRequestProcessing(requestId);
      const result = await rejectRequest(requestId);
      
      if (result.success) {
        // Refresh the access requests list
        fetchAccessRequests();
      } else {
        console.error('Error denying request:', result.error);
        setFetchError(formatError(result.error, 'An error occurred while denying the request'));
      }
    } catch (error) {
      console.error('Error denying request:', error);
      setFetchError(formatError(error, 'An error occurred while denying the request'));
    } finally {
      setRequestProcessing('');
    }
  };
  
  // Render loading state
  if (isPermissionsLoading || isTripMembersLoading || accessRequestsLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading permission requests...</span>
      </div>
    );
  }
  
  // Render error state
  if (fetchError || permissionsError) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Error loading access requests</h3>
          <p className="text-sm">{fetchError || permissionsError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAccessRequests} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Render no requests state
  if (!accessRequests.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
          <CardDescription>No pending access requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            When people request access to this trip, they'll appear here.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={fetchAccessRequests}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Render requests
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Requests</CardTitle>
        <CardDescription>
          {accessRequests.length} {accessRequests.length === 1 ? 'person' : 'people'} requesting access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accessRequests.map((request) => (
            <div key={request.id} className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage 
                    src={request.user?.avatar_url || undefined}
                    alt={request.user?.name || 'User'} 
                  />
                  <AvatarFallback>
                    {getInitials(request.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{request.user?.name || 'Unknown User'}</h4>
                  <p className="text-sm text-muted-foreground">{request.user?.email || 'No email'}</p>
                  {request.message && (
                    <p className="text-sm mt-1 italic">"{request.message}"</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {requestProcessing === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Select 
                      defaultValue="viewer"
                      onValueChange={(value) => handleApproveRequest(request.id, value as TripRole)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDenyRequest(request.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={fetchAccessRequests}>
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
} 