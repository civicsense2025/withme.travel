"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export function DestinationForm({ open, onOpenChange, destination, onSubmit, }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(destination || {
        city: "",
        country: "",
        continent: "",
        description: "",
        image_url: "",
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        }
        catch (error) {
            console.error("Error submitting destination:", error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {destination ? "Edit Destination" : "Create Destination"}
            </DialogTitle>
            <DialogDescription>
              {destination
            ? "Update the destination details below."
            : "Add a new destination to the database."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input id="city" value={formData.city} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { city: e.target.value }))} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input id="country" value={formData.country} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { country: e.target.value }))} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="continent" className="text-right">
                Continent
              </Label>
              <Input id="continent" value={formData.continent} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { continent: e.target.value }))} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">
                Image URL
              </Label>
              <Input id="image_url" value={formData.image_url || ""} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { image_url: e.target.value }))} className="col-span-3" placeholder="https://..."/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" value={formData.description || ""} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { description: e.target.value }))} className="col-span-3" rows={3}/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : destination ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
