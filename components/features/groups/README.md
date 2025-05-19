# Groups Feature Components

This directory contains all the atomic design components for the Groups feature, organized into atoms, molecules, and organisms.

## Structure

```
components/features/groups/
├── atoms/              # Basic building blocks
│   ├── EmojiPicker.tsx 
│   └── index.ts
├── molecules/          # Combinations of atoms
│   ├── CreateGroupForm.tsx
│   ├── GroupIdeaCard.tsx
│   ├── GroupIdeasStepper.tsx
│   ├── IdeaStepper.tsx
│   ├── InviteLinkBox.tsx
│   ├── PlansNavigation.tsx
│   └── index.ts
├── organisms/          # Complex components
│   ├── ActivityGeneratorWidget.tsx
│   ├── AuthModal.tsx
│   ├── CreateGroupModal.tsx
│   ├── GroupIdeaForm.tsx
│   ├── GroupSettingsModal.tsx
│   ├── GroupDetailClient.tsx
│   ├── GroupsLandingPageClient.tsx
│   ├── IdeasPreviewClient.tsx
│   ├── IdeasSummaryClient.tsx
│   ├── PlansClient.tsx
│   └── index.ts
└── index.ts           # Main exports
```

## Usage

Import components from the feature directory using:

```tsx
import { GroupIdeaCard } from '@/components/features/groups';
```

Or import specific atomic level components:

```tsx
import { EmojiPicker } from '@/components/features/groups/atoms';
import { InviteLinkBox } from '@/components/features/groups/molecules';
import { GroupIdeaForm } from '@/components/features/groups/organisms';
```

## Related Hooks

Group-related hooks are located in `lib/features/groups/hooks/`:

```tsx
import { useGroups, useGroupIdeas, useGroupMembers, useGroupPlans } from '@/lib/features/groups/hooks';
```

## Components Documentation

### Atoms

- **EmojiPicker**: Allows selecting an emoji for group icons or reactions.

### Molecules

- **InviteLinkBox**: Displays invitation links for groups with sharing options.
- **GroupIdeaCard**: Card component for displaying a group idea with voting and actions.
- **GroupIdeasStepper**: Visual stepper component showing the ideation progress.
- **IdeaStepper**: Alternative stepper component for ideas workflow.
- **PlansNavigation**: Navigation breadcrumbs for group plans.
- **CreateGroupForm**: Form for creating new groups.

### Organisms

- **GroupIdeaForm**: Form for creating or editing group ideas.
- **ActivityGeneratorWidget**: Widget that generates activity ideas for groups.
- **AuthModal**: Authentication modal for when users need to sign in.
- **CreateGroupModal**: Modal for creating a new group.
- **GroupSettingsModal**: Modal for configuring group settings.
- **GroupsLandingPageClient**: Client component for the groups landing page.
- **GroupDetailClient**: Client component for the group detail page.

## Storybook Documentation

All components have corresponding Storybook stories which demonstrate their usage and variations. 