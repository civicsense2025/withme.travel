/**
 * LogisticsDialog
 * 
 * Dialog for adding/editing accommodation or transportation
 * 
 * @module trips/molecules
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LogisticsItemIcon } from '@/components/trips/atoms/LogisticsItemIcon';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

interface BaseLogisticsDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Whether the form is in a loading state */
  isLoading?: boolean;
  /** Whether this is an edit operation */
  isEdit?: boolean;
}

export interface AccommodationDialogProps extends BaseLogisticsDialogProps {
  /** Type of dialog - accommodation */
  type: 'accommodation';
  /** Initial values for edit mode */
  initialValues?: {
    title?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  };
  /** Callback when form is submitted */
  onSubmit: (data: {
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }) => void;
}

export interface TransportationDialogProps extends BaseLogisticsDialogProps {
  /** Type of dialog - transportation */
  type: 'transportation';
  /** Initial values for edit mode */
  initialValues?: {
    title?: string;
    transportMode?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    departureDate?: string;
    arrivalDate?: string;
    description?: string;
  };
  /** Callback when form is submitted */
  onSubmit: (data: {
    title: string;
    transportMode?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    departureDate?: string;
    arrivalDate?: string;
    description?: string;
  }) => void;
}

export type LogisticsDialogProps = AccommodationDialogProps | TransportationDialogProps;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LogisticsDialog(props: LogisticsDialogProps) {
  if (props.type === 'accommodation') {
    return <AccommodationDialog {...props} />;
  } else {
    return <TransportationDialog {...props} />;
  }
}

// ============================================================================
// ACCOMMODATION DIALOG COMPONENT
// ============================================================================

function AccommodationDialog({
  open,
  onOpenChange,
  initialValues = {},
  onSubmit,
  isLoading = false,
  isEdit = false,
}: AccommodationDialogProps) {
  const [formValues, setFormValues] = React.useState({
    title: initialValues.title || '',
    location: initialValues.location || '',
    startDate: initialValues.startDate || '',
    endDate: initialValues.endDate || '',
    description: initialValues.description || '',
  });

  React.useEffect(() => {
    if (open) {
      setFormValues({
        title: initialValues.title || '',
        location: initialValues.location || '',
        startDate: initialValues.startDate || '',
        endDate: initialValues.endDate || '',
        description: initialValues.description || '',
      });
    }
  }, [open, initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const dialogTitle = isEdit ? 'Edit Accommodation' : 'Add Accommodation';
  const submitText = isEdit ? 'Update' : 'Add';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogisticsItemIcon type="accommodation" size={18} />
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Name</Label>
              <Input
                id="title"
                name="title"
                placeholder="Hotel, Airbnb, etc."
                value={formValues.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Address or location"
                value={formValues.location}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Check-in</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formValues.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Check-out</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formValues.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Additional details like confirmation number, contact information, etc."
                value={formValues.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// TRANSPORTATION DIALOG COMPONENT
// ============================================================================

function TransportationDialog({
  open,
  onOpenChange,
  initialValues = {},
  onSubmit,
  isLoading = false,
  isEdit = false,
}: TransportationDialogProps) {
  const [formValues, setFormValues] = React.useState({
    title: initialValues.title || '',
    transportMode: initialValues.transportMode || 'flight',
    departureLocation: initialValues.departureLocation || '',
    arrivalLocation: initialValues.arrivalLocation || '',
    departureDate: initialValues.departureDate || '',
    arrivalDate: initialValues.arrivalDate || '',
    description: initialValues.description || '',
  });

  React.useEffect(() => {
    if (open) {
      setFormValues({
        title: initialValues.title || '',
        transportMode: initialValues.transportMode || 'flight',
        departureLocation: initialValues.departureLocation || '',
        arrivalLocation: initialValues.arrivalLocation || '',
        departureDate: initialValues.departureDate || '',
        arrivalDate: initialValues.arrivalDate || '',
        description: initialValues.description || '',
      });
    }
  }, [open, initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormValues((prev) => ({ ...prev, transportMode: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const dialogTitle = isEdit ? 'Edit Transportation' : 'Add Transportation';
  const submitText = isEdit ? 'Update' : 'Add';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogisticsItemIcon 
              type="transportation" 
              transportMode={formValues.transportMode} 
              size={18} 
            />
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Transportation Type</Label>
              <Input
                id="title"
                name="title"
                placeholder="Flight, Train, Car Rental, etc."
                value={formValues.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="transportMode">Mode</Label>
              <Select 
                value={formValues.transportMode} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transportation mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departureLocation">From</Label>
                <Input
                  id="departureLocation"
                  name="departureLocation"
                  placeholder="Departure location"
                  value={formValues.departureLocation}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="arrivalLocation">To</Label>
                <Input
                  id="arrivalLocation"
                  name="arrivalLocation"
                  placeholder="Arrival location"
                  value={formValues.arrivalLocation}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  name="departureDate"
                  type="date"
                  value={formValues.departureDate}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  name="arrivalDate"
                  type="date"
                  value={formValues.arrivalDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Additional details like confirmation number, seats, etc."
                value={formValues.description}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 