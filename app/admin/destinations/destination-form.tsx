"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/types/supabase";
type Destination = Database['public']['Tables']['destinations']['Row'];

interface DestinationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination?: Destination;
  onSubmit: (data: Partial<Destination>) => Promise<void>;
}

export function DestinationForm({
  open,
  onOpenChange,
  destination,
  onSubmit,
}: DestinationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Destination>>(
    destination || {
      name: "",
      city: "",
      country: "",
      continent: "",
      description: "",
      image_url: "",
    }
  );

  useEffect(() => {
    setFormData(destination || {
      name: "",
      city: "",
      country: "",
      continent: "",
      description: "",
      image_url: "",
    });
  }, [destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting destination:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {destination ? "Edit Destination" : "Create Destination"}
            </DialogTitle>
            <DialogDescription>
              {destination
                ? `Update details for ${destination.name}`
                : "Add a new destination to the database."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Destination Name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City Name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state_province">State/Province</Label>
                <Input
                  id="state_province"
                  value={formData.state_province || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state_province: e.target.value })
                  }
                  placeholder="State or Province"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  required
                  placeholder="Country Name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="continent">Continent</Label>
                <Input
                  id="continent"
                  value={formData.continent || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, continent: e.target.value })
                  }
                  placeholder="Continent Name"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  placeholder="Enter a description..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="byline">Byline</Label>
                <Input
                  id="byline"
                  value={formData.byline || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, byline: e.target.value })
                  }
                  placeholder="Short summary or tagline"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : destination ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 