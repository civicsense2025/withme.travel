"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function ExportCalendarDialog({ tripId, tripName }) {
    const [isExporting, setIsExporting] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch(`/api/trips/${tripId}/export-calendar`, {
                method: "POST",
            });
            if (!response.ok) {
                throw new Error("Failed to export calendar");
            }
            const data = await response.json();
            // Open the Google Calendar URL in a new tab
            window.open(data.url, "_blank");
            toast({
                title: "calendar exported!",
                description: "your trip has been added to google calendar",
            });
            setOpen(false);
        }
        catch (error) {
            console.error("Error exporting calendar:", error);
            toast({
                title: "export failed",
                description: "there was an error exporting to google calendar",
                variant: "destructive",
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4"/>
          export to calendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>export to google calendar</DialogTitle>
          <DialogDescription>add your trip itinerary to google calendar so everyone can stay in sync</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            this will create calendar events for all activities in your trip "{tripName}". you'll be redirected to
            google to confirm.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (<>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                exporting...
              </>) : ("export to google calendar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
