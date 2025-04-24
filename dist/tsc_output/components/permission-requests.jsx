"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
export function PermissionRequests({ tripId }) {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const { toast } = useToast();
    useEffect(() => {
        async function fetchRequests() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/trips/${tripId}/permissions/requests`);
                if (!response.ok) {
                    throw new Error("Failed to fetch permission requests");
                }
                const data = await response.json();
                setRequests(data.requests || []);
            }
            catch (error) {
                console.error("Error fetching permission requests:", error);
                toast({
                    title: "Error",
                    description: "Failed to load permission requests",
                    variant: "destructive",
                });
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchRequests();
    }, [tripId, toast]);
    const handleRequest = async (requestId, approve) => {
        try {
            setProcessingId(requestId);
            const response = await fetch(`/api/trips/${tripId}/permissions/requests/${requestId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: approve ? "approved" : "rejected",
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to ${approve ? "approve" : "reject"} request`);
            }
            // Update local state
            setRequests(requests.filter((req) => req.id !== requestId));
            toast({
                title: approve ? "Request approved" : "Request rejected",
                description: approve ? "User now has edit access" : "Request has been rejected",
            });
        }
        catch (error) {
            console.error("Error handling permission request:", error);
            toast({
                title: "Error",
                description: error.message || `Failed to ${approve ? "approve" : "reject"} request`,
                variant: "destructive",
            });
        }
        finally {
            setProcessingId(null);
        }
    };
    if (isLoading) {
        return (<div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
      </div>);
    }
    if (requests.length === 0) {
        return (<div className="text-center py-4">
        <p className="text-muted-foreground">No pending permission requests</p>
      </div>);
    }
    return (<div className="space-y-4">
      {requests.map((request) => {
            var _a;
            return (<Card key={request.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Permission Request</CardTitle>
            <CardDescription>
              {new Date(request.created_at).toLocaleDateString()} at{" "}
              {new Date(request.created_at).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src={request.user.avatar_url || "/images/placeholder-avatar.png"}/>
                <AvatarFallback>{((_a = request.user.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) || request.user.email.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{request.user.name || request.user.email}</p>
                <p className="text-sm text-muted-foreground">{request.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>);
        })}
    </div>);
}
