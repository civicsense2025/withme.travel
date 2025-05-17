# Expense Components

This directory contains a comprehensive set of components for handling trip expenses and budgeting, organized according to the Atomic Design methodology.

## Component Structure

### Atoms (Fundamental UI Elements)
- `ExpenseCategoryIcon` - Displays icons for expense categories
- `ExpenseAmount` - Formats and displays currency amounts
- `BudgetProgressIndicator` - Visualizes budget progress with a custom progress bar
- `DateBadge` - Displays formatted dates in a badge

### Molecules (Combinations of Atoms)
- `ExpenseItemCard` - Card displaying a single expense with its details
- `MemberExpenseSummaryCard` - Card showing a member's expense summary

### Organisms (Functional Components)
- `BudgetSnapshotCard` - Shows budget overview with editing capabilities
- `MemberExpensesGrid` - Displays all member expenses and settlement calculations
- `ExpenseList` - Filterable, sortable list of expenses with tabs for actual vs. planned
- `ExpenseForm` - Form for adding or editing expenses

### Templates
- `BudgetTab` - Complete budget management interface integrating all organisms

## Usage

### Basic Usage

Import the desired components directly:

```tsx
import { 
  BudgetSnapshotCard,
  ExpenseList,
  MemberExpensesGrid 
} from '@/components/expenses';
```

Or import the complete BudgetTab:

```tsx
import { BudgetTab } from '@/components/expenses/budget-tab';
```

### Example Implementation

```tsx
<BudgetTab
  tripId="trip-123"
  canEdit={true}
  manualExpenses={manualExpenses}
  plannedExpenses={plannedExpenses}
  initialMembers={tripMembers}
  budget={1000}
  handleBudgetUpdated={() => console.log('Budget updated')}
/>
```

## Design Principles

1. **Modularity**: Each component is reusable and has a single responsibility
2. **Composability**: Atoms combine into molecules, which combine into organisms
3. **Flexibility**: Components can be used individually or as part of the complete BudgetTab
4. **Accessibility**: All components follow accessibility best practices
5. **Design System Integration**: Components use the shared UI components library

## API Integration

- The components interact with the trip budget API via the `useTripBudget` hook
- Expense data is fetched and managed through the API endpoints in `app/api/trips/[tripId]/expenses`
- Planned expenses are managed through `app/api/trips/[tripId]/planned-expenses` 