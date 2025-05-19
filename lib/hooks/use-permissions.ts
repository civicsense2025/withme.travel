/**
 * usePermissions Hook
 *
 * Manages trip permissions, access requests, and permission checks.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  listPermissionRequests,
  getPermissionRequest,
  createPermissionRequest,
  approvePermissionRequest,
  rejectPermissionRequest,
  checkPermissions,
  type PermissionRequest,
  type PermissionCheck,
} from '@/lib/client/permissions';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for usePermissions
 */
export interface UsePermissionsResult {
  /** List of permission requests for the trip */
  requests: PermissionRequest[];
  /** Current user's permissions for the trip */
  permissions: PermissionCheck | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh permission requests */
  refreshRequests: () => Promise<void>;
  /** Refresh user permissions */
  refreshPermissions: () => Promise<void>;
  /** Request access to a trip */
  requestAccess: (data: { message?: string; requestedRole?: string }) => Promise<Result<PermissionRequest>>;
  /** Approve a permission request */
  approveRequest: (requestId: string) => Promise<Result<PermissionRequest>>;
  /** Reject a permission request */
  rejectRequest: (requestId: string, reason?: string) => Promise<Result<PermissionRequest>>;
  /** Get a specific permission request */
  getRequest: (requestId: string) => Promise<Result<PermissionRequest>>;
}

/**
 * usePermissions - React hook for managing trip permissions
 */
export function usePermissions(
  /** Trip ID to check permissions for */
  tripId: string,
  /** Whether to fetch permissions on mount */
  fetchOnMount = true
): UsePermissionsResult {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [permissions, setPermissions] = useState<PermissionCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch permission requests
  const refreshRequests = useCallback(async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await listPermissionRequests(tripId);
      
      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.error);
        toast({
          description: `Failed to load permission requests: ${result.error}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading permission requests';
      setError(errorMessage);
      toast({
        description: `Error: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  // Fetch user permissions
  const refreshPermissions = useCallback(async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await checkPermissions(tripId);
      
      if (result.success) {
        setPermissions(result.data);
      } else {
        setError(result.error);
        toast({
          description: `Failed to check permissions: ${result.error}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error checking permissions';
      setError(errorMessage);
      toast({
        description: `Error: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  // Request access to a trip
  const requestAccess = useCallback(
    async (data: { message?: string; requestedRole?: string }): Promise<Result<PermissionRequest>> => {
      setIsLoading(true);
      
      try {
        const result = await createPermissionRequest(tripId, data);
        
        if (result.success) {
          toast({
            description: 'Your request has been sent to the trip administrators',
          });
          await refreshRequests();
        } else {
          setError(result.error);
          toast({
            description: `Failed to request access: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error requesting access';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, refreshRequests, toast]
  );

  // Approve a permission request
  const approveRequest = useCallback(
    async (requestId: string): Promise<Result<PermissionRequest>> => {
      setIsLoading(true);
      
      try {
        const result = await approvePermissionRequest(tripId, requestId);
        
        if (result.success) {
          setRequests((prev) =>
            prev.map((req) => (req.id === requestId ? result.data : req))
          );
          toast({
            description: 'The access request has been approved',
          });
        } else {
          setError(result.error);
          toast({
            description: `Failed to approve request: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error approving request';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast]
  );

  // Reject a permission request
  const rejectRequest = useCallback(
    async (requestId: string, reason?: string): Promise<Result<PermissionRequest>> => {
      setIsLoading(true);
      
      try {
        const result = await rejectPermissionRequest(tripId, requestId, reason);
        
        if (result.success) {
          setRequests((prev) =>
            prev.map((req) => (req.id === requestId ? result.data : req))
          );
          toast({
            description: 'The access request has been rejected',
          });
        } else {
          setError(result.error);
          toast({
            description: `Failed to reject request: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error rejecting request';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast]
  );

  // Get a specific permission request
  const getRequest = useCallback(
    async (requestId: string): Promise<Result<PermissionRequest>> => {
      setIsLoading(true);
      
      try {
        const result = await getPermissionRequest(tripId, requestId);
        
        if (!result.success) {
          setError(result.error);
          toast({
            description: `Failed to get permission request: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error getting request';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast]
  );

  // Initial load
  useEffect(() => {
    if (fetchOnMount && tripId) {
      refreshRequests();
      refreshPermissions();
    }
  }, [fetchOnMount, tripId, refreshRequests, refreshPermissions]);

  return {
    requests,
    permissions,
    isLoading,
    error,
    refreshRequests,
    refreshPermissions,
    requestAccess,
    approveRequest,
    rejectRequest,
    getRequest,
  };
} 