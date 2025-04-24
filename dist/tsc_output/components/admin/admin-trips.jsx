"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Loader2, Search, Edit, Trash, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
export function AdminTrips() {
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);
    const [tripToEdit, setTripToEdit] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        is_public: false,
        start_date: "",
        end_date: "",
    });
    useEffect(() => {
        fetchTrips();
    }, []);
    const fetchTrips = async () => {
        setLoading(true);
        try {
            // Use the admin API endpoint instead of direct Supabase access
            const response = await fetch('/api/admin/trips');
            if (!response.ok) {
                throw new Error(`Failed to fetch trips: ${response.status}`);
            }
            const data = await response.json();
            setTrips(data.trips || []);
        }
        catch (error) {
            console.error("Error fetching trips:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    const filteredTrips = trips.filter((trip) => {
        var _a, _b;
        return trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (trip.destination_name && trip.destination_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (trip.created_by && trip.created_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (((_a = trip.users) === null || _a === void 0 ? void 0 : _a.email) && trip.users.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (((_b = trip.users) === null || _b === void 0 ? void 0 : _b.name) && trip.users.name.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    const confirmDelete = (trip) => {
        setTripToDelete(trip);
        setDeleteDialogOpen(true);
    };
    const handleDelete = async () => {
        if (!tripToDelete)
            return;
        setIsDeleting(true);
        try {
            // Delete trip from database
            const response = await fetch(`/api/admin/trips/${tripToDelete.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to delete trip: ${response.status}`);
            }
            // Update UI
            setTrips(trips.filter((trip) => trip.id !== tripToDelete.id));
            setDeleteDialogOpen(false);
        }
        catch (error) {
            console.error("Error deleting trip:", error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const confirmEdit = (trip) => {
        setTripToEdit(trip);
        setEditForm({
            name: trip.name,
            is_public: trip.is_public || false,
            start_date: trip.start_date ? new Date(trip.start_date).toISOString().split('T')[0] : "",
            end_date: trip.end_date ? new Date(trip.end_date).toISOString().split('T')[0] : "",
        });
        setEditDialogOpen(true);
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleCheckboxChange = (checked) => {
        setEditForm(prev => (Object.assign(Object.assign({}, prev), { is_public: checked })));
    };
    const handleSaveEdit = async () => {
        if (!tripToEdit)
            return;
        setIsSaving(true);
        try {
            // Update trip in database
            const response = await fetch(`/api/admin/trips/${tripToEdit.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });
            if (!response.ok) {
                throw new Error(`Failed to update trip: ${response.status}`);
            }
            const { trip: updatedTrip } = await response.json();
            // Update UI
            setTrips(trips.map(trip => trip.id === tripToEdit.id ? Object.assign(Object.assign({}, trip), updatedTrip) : trip));
            setEditDialogOpen(false);
        }
        catch (error) {
            console.error("Error updating trip:", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleDateString();
    };
    const getOwnerDisplay = (trip) => {
        var _a;
        if ((_a = trip.users) === null || _a === void 0 ? void 0 : _a.name) {
            return (<div>
          <div>{trip.users.name}</div>
          <div className="text-xs text-muted-foreground">{trip.users.email}</div>
        </div>);
        }
        return trip.created_by || "Unknown";
    };
    return (<div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Trips</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search trips..." className="pl-8" value={searchTerm} onChange={handleSearch}/>
        </div>
      </div>

      {loading ? (<div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>) : (<div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (<TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No trips found
                  </TableCell>
                </TableRow>) : (filteredTrips.map((trip) => (<TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.name}</TableCell>
                    <TableCell>{trip.destination_name || 'Unknown'}</TableCell>
                    <TableCell>{getOwnerDisplay(trip)}</TableCell>
                    <TableCell>{formatDate(trip.start_date)}</TableCell>
                    <TableCell>{formatDate(trip.end_date)}</TableCell>
                    <TableCell>{new Date(trip.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => confirmEdit(trip)}>
                          <Edit className="h-4 w-4"/>
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => router.push(`/trips/${trip.id}`)}>
                          <ExternalLink className="h-4 w-4"/>
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(trip)}>
                          <Trash className="h-4 w-4"/>
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)))}
            </TableBody>
          </Table>
        </div>)}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the trip "{tripToDelete === null || tripToDelete === void 0 ? void 0 : tripToDelete.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Deleting...
                </>) : ("Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>
              Make changes to the trip details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input id="name" name="name" value={editForm.name} onChange={handleEditChange}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" value={editForm.start_date} onChange={handleEditChange}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" name="end_date" type="date" value={editForm.end_date} onChange={handleEditChange}/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_public" checked={editForm.is_public} onCheckedChange={handleCheckboxChange}/>
              <Label htmlFor="is_public">Public Trip</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Saving...
                </>) : ("Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
