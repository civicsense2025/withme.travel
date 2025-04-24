"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, UserPlus } from "lucide-react";
export function SplitwiseImportDialog({ tripId, onOpenChange, isOpen, isLinked }) {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [isInviting, setIsInviting] = useState(false);
    const { toast } = useToast();
    const fetchCandidates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/splitwise/import-candidates?tripId=${tripId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch candidates");
            }
            const data = await response.json();
            setCandidates(data.candidates || []);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen && isLinked) {
            fetchCandidates();
        }
        else if (isOpen && !isLinked) {
            setIsLoading(false);
            setError("This trip is not linked to a Splitwise group.");
            setCandidates([]);
        }
        else {
            setIsLoading(true);
            setError(null);
            setCandidates([]);
            setSelectedUsers({});
        }
    }, [tripId, isOpen, isLinked]);
    const handleCheckboxChange = (candidate, checked) => {
        setSelectedUsers(prev => (Object.assign(Object.assign({}, prev), { [`${candidate.status}-${candidate.id}`]: checked })));
    };
    const handleInvite = async () => {
        setIsInviting(true);
        setError(null);
        const usersToInvite = [];
        const usersToAdd = [];
        candidates.forEach(candidate => {
            if (selectedUsers[`${candidate.status}-${candidate.id}`]) {
                if (candidate.status === 'new_user' && candidate.email) {
                    usersToInvite.push({ email: candidate.email, role: 'member' });
                }
                else if (candidate.status === 'existing_user' && candidate.profileId) {
                    usersToAdd.push({ userId: candidate.profileId, role: 'member' });
                }
            }
        });
        try {
            let inviteSuccess = true;
            let addSuccess = true;
            // Send invitations for new users
            if (usersToInvite.length > 0) {
                const inviteResponse = await fetch(`/api/trips/${tripId}/invitations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invitations: usersToInvite }),
                });
                if (!inviteResponse.ok) {
                    const errorData = await inviteResponse.json();
                    console.error("Invite error:", errorData);
                    inviteSuccess = false;
                }
            }
            // Add existing users directly
            if (usersToAdd.length > 0) {
                // TODO: Implement a bulk add members endpoint or call individual add endpoint
                // For now, just log the intention
                console.log("Need to add existing users:", usersToAdd);
                // Example (if endpoint existed):
                // const addResponse = await fetch(`/api/trips/${tripId}/members/bulk-add`, {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify({ members: usersToAdd }),
                // });
                // if (!addResponse.ok) {
                //   addSuccess = false;
                // }
                toast({ title: "Action Required", description: "Adding existing users directly is not yet implemented." });
                addSuccess = false; // Mark as failed until implemented
            }
            if (inviteSuccess && addSuccess) {
                toast({ title: "Success", description: "Selected users have been invited or added." });
                onOpenChange(false); // Close the dialog on success
            }
            else {
                throw new Error("Some invitations or additions failed. Check console.");
            }
        }
        catch (err) {
            setError(err.message);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
        finally {
            setIsInviting(false);
        }
    };
    const renderContent = () => {
        if (isLoading) {
            return (<div className="flex justify-center items-center h-40">
          <RefreshCw className="h-6 w-6 animate-spin"/>
        </div>);
        }
        if (error) {
            return (<Alert variant="destructive" className="my-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>);
        }
        if (candidates.length === 0) {
            return <p className="text-muted-foreground text-center py-4">No members found in the linked Splitwise group.</p>;
        }
        const importableCandidates = candidates.filter(c => c.status !== 'member');
        if (importableCandidates.length === 0) {
            return <p className="text-muted-foreground text-center py-4">All Splitwise group members are already in this trip.</p>;
        }
        return (<ScrollArea className="h-72 pr-4">
        <div className="space-y-3">
          {importableCandidates.map((candidate) => (<div key={candidate.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
              <div className="flex items-center space-x-3">
                <Checkbox id={`candidate-${candidate.id}`} checked={selectedUsers[`${candidate.status}-${candidate.id}`] || false} onCheckedChange={(checked) => handleCheckboxChange(candidate, !!checked)} disabled={isInviting}/>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={candidate.picture.medium} alt={`${candidate.first_name} ${candidate.last_name}`}/>
                  <AvatarFallback>{getInitials(`${candidate.first_name} ${candidate.last_name}`)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <Label htmlFor={`candidate-${candidate.id}`} className="font-medium cursor-pointer">
                    {candidate.first_name} {candidate.last_name}
                  </Label>
                  {candidate.email && <span className="text-xs text-muted-foreground">{candidate.email}</span>}
                </div>
              </div>
              <Badge variant={candidate.status === 'new_user' ? "secondary" : "outline"}>
                {candidate.status === 'new_user' ? "Invite New User" : "Add Existing User"}
              </Badge>
            </div>))}
        </div>
      </ScrollArea>);
    };
    const selectedCount = Object.values(selectedUsers).filter(Boolean).length;
    return (<Dialog open={isOpen} onOpenChange={onOpenChange}> 
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5"/>
            Import Members from Splitwise
          </DialogTitle>
          <DialogDescription>
            Select users from your linked Splitwise group to invite or add to this trip.
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isInviting}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isLoading || isInviting || selectedCount === 0}>
            {isInviting ? (<RefreshCw className="mr-2 h-4 w-4 animate-spin"/>) : (<UserPlus className="mr-2 h-4 w-4"/>)}
            {isInviting ? "Processing..." : `Invite/Add ${selectedCount} User${selectedCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
