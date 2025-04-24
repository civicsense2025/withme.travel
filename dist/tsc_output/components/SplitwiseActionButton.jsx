"use client";
import { useState } from "react";
import { Link2, Link2Off, Loader2, Settings, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
export function SplitwiseActionButton({ tripId, isLinked, isConnected, isLoading, groups, error, linkedGroupName, // Destructure the new prop
onConnect, onLink, onUnlink, onDisconnect, // Destructure new prop
 }) {
    const [open, setOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    // Determine button state and appearance
    let buttonVariant = "outline";
    let buttonText = "Splitwise";
    let buttonIcon = <Settings className="h-4 w-4"/>; // Default icon
    if (isLoading) {
        buttonIcon = <Loader2 className="h-4 w-4 animate-spin"/>;
        buttonText = "Processing...";
    }
    else if (error) {
        buttonVariant = "destructive";
        buttonText = "Splitwise Error";
        // Icon remains default or could be an error icon
    }
    else if (isLinked === null || isConnected === null) {
        // Initial loading state (checking status)
        return <Skeleton className="h-9 w-32"/>; // Show skeleton while checking initial status
    }
    else if (isLinked) {
        buttonVariant = "secondary"; // Indicate success/linked state
        buttonText = "Splitwise Linked";
        buttonIcon = <Link2 className="h-4 w-4 text-green-600"/>;
    }
    else if (isConnected) {
        buttonText = "Link Splitwise Group";
        buttonIcon = <Link2 className="h-4 w-4"/>;
    }
    else {
        buttonText = "Connect Splitwise";
        buttonIcon = <Link2 className="h-4 w-4"/>;
    }
    const handleGroupSelectAndLink = (groupId) => {
        onLink(groupId);
        setOpen(false); // Close dropdown after linking
    };
    // Handle disconnect click
    const handleDisconnectClick = () => {
        onDisconnect();
        setOpen(false); // Close dropdown after initiating disconnect
    };
    return (<DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size="sm" className="gap-1.5">
          {buttonIcon}
          {buttonText}
          <ChevronDown className="h-4 w-4 opacity-70"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {error && (<DropdownMenuItem disabled className="text-destructive text-xs">
             Error: {error}
           </DropdownMenuItem>)}
        {isLinked ? (<>
            <DropdownMenuLabel>Splitwise Connected</DropdownMenuLabel>
            {/* Display group name if available */}
            {linkedGroupName && (<DropdownMenuItem disabled className="text-xs text-muted-foreground">
                Group: {linkedGroupName}
              </DropdownMenuItem>)}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onUnlink} disabled={isLoading}>
              <Link2Off className="mr-2 h-4 w-4"/>
              <span>Unlink Group</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDisconnectClick} disabled={isLoading} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4"/>
              <span>Disconnect Account</span>
            </DropdownMenuItem>
          </>) : isConnected ? (<>
             <DropdownMenuLabel>Link to Group</DropdownMenuLabel>
             <DropdownMenuSeparator />
            {(groups && groups.length > 0) ? (<DropdownMenuSub>
                 <DropdownMenuSubTrigger>
                  <Link2 className="mr-2 h-4 w-4"/>
                  Select Group
                 </DropdownMenuSubTrigger>
                 <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                     {groups.map((group) => (<DropdownMenuItem key={group.id} onClick={() => handleGroupSelectAndLink(group.id.toString())}>
                          {group.name}
                        </DropdownMenuItem>))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>) : (<DropdownMenuItem disabled>No groups found</DropdownMenuItem>)}
            <DropdownMenuItem onClick={() => window.open("https://secure.splitwise.com/groups/new", "_blank")}>
              Create New Group...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnectClick} disabled={isLoading} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4"/>
              <span>Disconnect Account</span>
            </DropdownMenuItem>
          </>) : (<>
            <DropdownMenuLabel>Connect Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onConnect} disabled={isLoading}>
              <Link2 className="mr-2 h-4 w-4"/>
              <span>Connect to Splitwise</span>
            </DropdownMenuItem>
           </>)}
      </DropdownMenuContent>
    </DropdownMenu>);
}
