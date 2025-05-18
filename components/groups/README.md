# Group Components

This directory contains a comprehensive set of components for handling group management and collaboration, organized according to the Atomic Design methodology.

## Component Structure

### Atoms (Fundamental UI Elements)
- Small, reusable UI elements specific to groups
- Building blocks for more complex components

### Molecules (Combinations of Atoms)
- `GroupCard` - Card displaying a group with its basic details and actions
- `DeleteConfirmationDialog` - Modal for confirming deletion of items

### Organisms (Functional Components)
- Complex, self-contained group UI components
- Combinations of molecules working together

## Usage

### Basic Usage

Import the desired components directly:

```tsx
import { 
  GroupCard, 
  DeleteConfirmationDialog 
} from '@/components/groups';
```

### Legacy Components

Some components are still in the process of being migrated to the atomic structure:

```tsx
import { 
  GroupMemberList,
  GroupPlanCard,
  GroupPlanIdea,
  ActivityGeneratorWidget 
} from '@/components/groups';
```

## Design Principles

1. **Modularity**: Each component is reusable and has a single responsibility
2. **Composability**: Atoms combine into molecules, which combine into organisms
3. **Flexibility**: Components can be used individually or as part of larger interfaces
4. **Accessibility**: All components follow accessibility best practices
5. **Design System Integration**: Components use the shared UI components library

## Migration Plan

The group components are being migrated to follow the atomic design methodology:

1. Create atomic structure (atoms, molecules, organisms)
2. Convert existing components into the new structure
3. Update imports across the codebase
4. Maintain backward compatibility during transition

This approach ensures a smooth transition without disrupting existing functionality. 