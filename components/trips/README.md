# Trip Components

This directory contains reusable components for trip-related functionality in the withme.travel application.

## Components

### `TripCreationForm`

A modern, user-friendly form component for creating new trips that follows the withme.travel design system.

#### Features

- Apple-inspired design with clean layout and subtle visual effects
- Conversational field labels for friendly user experience
- Integrated city search with autocomplete
- Date range picker for trip dates
- Form validation with real-time feedback
- Responsive layout works on all device sizes
- Animated loading states
- Error handling with visual feedback

#### Usage

```tsx
import { TripCreationForm } from '@/components/trips/trip-creation-form';

function CreateTripPage() {
  const handleDestinationSelect = (destination: string) => {
    console.log(`User selected destination: ${destination}`);
  };

  const handleTripCreated = (tripId: string) => {
    console.log(`Trip created with ID: ${tripId}`);
    // Redirect or show success message
  };

  return (
    <div className="container">
      <TripCreationForm
        onDestinationSelect={handleDestinationSelect}
        onTripCreated={handleTripCreated}
        // Optional: initial destination if coming from destination page
        // initialDestination={someCityObject}
        // Optional: override theme mode
        // mode="dark"
      />
    </div>
  );
}
```

#### Props

| Prop                  | Type                            | Description                                  |
| --------------------- | ------------------------------- | -------------------------------------------- |
| `onDestinationSelect` | `(destination: string) => void` | Callback when a destination is selected      |
| `onTripCreated`       | `(tripId: string) => void`      | Callback when trip creation succeeds         |
| `onCancel`            | `() => void`                    | Optional callback for cancel button click    |
| `initialDestination`  | `City`                          | Optional initial destination to pre-populate |
| `mode`                | `'light' \| 'dark'`             | Optional theme mode override                 |

#### Design Notes

This component implements our Apple-inspired design system with:

- Clean card with subtle elevation
- Generous white space and padding
- Conversational copy (e.g., "What are you calling this adventure?")
- Icons to improve visual hierarchy
- Modern input styling with clear focus states
- Consistent error handling

To see this component in action, visit the enhanced trip creation page at `/trips/create/enhanced`.

---

For additional trip-related components, see the main components documentation.
