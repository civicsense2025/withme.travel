# Feature-based Component Organization

This directory contains UI components organized by feature and following atomic design principles.

## Structure

Components are organized into two levels:

1. **Feature-based folders**: Each major feature area has its own directory
2. **Atomic design categories**: Within each feature, components are organized by complexity

```components/ui/features/
├── auth/                  # Authentication components
│   ├── atoms/             # Small, single-purpose components 
│   ├── molecules/         # Composite components made from atoms
│   ├── organisms/         # Complex components combining molecules
│   └── stories/           # Storybook stories for auth components
├── trips/                 # Trip-related components
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── stories/
├── destinations/          # Destination-related components
└── ...other features
```

## Atomic Design Categories

- **Atoms**: Smallest building blocks (buttons, form inputs, badges)
- **Molecules**: Groups of atoms that function together (cards, form groups)
- **Organisms**: Complex UI components combining multiple molecules (forms, modals, sections)

## Feature Areas

- **auth**: Authentication forms, modals, and flows
- **trips**: Trip cards, lists, details, and management interfaces
- **destinations**: Destination cards, detail views, and search interfaces
- **groups**: Group management and membership components
- **itinerary**: Itinerary planning and viewing components
- **user**: User profiles, settings, and account management
- **core**: Base UI components that span features

## Best Practices

1. **Imports**: Always import components from their feature module
   ```tsx
   // ✅ Good
   import { AuthForm } from '@/components/ui/features/auth';
   
   // ❌ Avoid
   import { AuthForm } from '@/components/ui/features/auth/molecules/AuthForm';
   ```

2. **Component Placement**: Place components in the appropriate atomic category based on their complexity

3. **Index Exports**: Each feature should export its components through an index.ts file

4. **Storybook Stories**: Create stories for all reusable components in the feature's stories folder

5. **Dependencies**: Feature components should import from more general components, not the other way around
   - Core components should not import from feature components
   - Feature components can import from core components

## Adding New Components

When adding a new component:

1. Identify which feature it belongs to
2. Determine its atomic design level (atom, molecule, organism)
3. Create the component in the appropriate directory
4. Export it from the feature's index.ts file
5. Create Storybook stories for the component

## Migrating Existing Components

When migrating components from the old structure:

1. Move the component to the appropriate feature/atomic directory
2. Update imports in affected files
3. Create Storybook stories if they don't exist
4. Add exports to the appropriate index.ts files 