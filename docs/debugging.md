# Debugging Common Issues in withme.travel

## UI Component Issues

### Button Nesting Problem

**Issue**: Errors like `<button> cannot be a descendant of <button>` or `<button> cannot contain a nested <button>` occur with components like DialogTrigger.

**Solution**: 
1. Use the `asChild` prop on DialogTrigger to tell Radix UI to use its child as the trigger element instead of creating a new button.

```tsx
// WRONG - creates nested buttons
<DialogTrigger>
  <Button>Click Me</Button>
</DialogTrigger>

// CORRECT - uses the Button component as the trigger
<DialogTrigger asChild>
  <Button>Click Me</Button>
</DialogTrigger>
```

**How It Works**: 
- Without `asChild`, Radix creates a button element: `<button><Button>...</Button></button>`
- With `asChild`, Radix uses the child directly: `<Button>...</Button>`
- The `asChild` prop tells the component to clone its child and merge the props instead of rendering a default element.

## API and Data Handling

### Authentication Issues

**Issue**: 401 Unauthorized errors when accessing API endpoints.

**Solution**:
1. Include credentials in fetch requests to ensure authentication tokens are sent:

```tsx
// WRONG - doesn't send cookies/credentials
const response = await fetch('/api/endpoint');

// CORRECT - includes auth credentials
const response = await fetch('/api/endpoint', {
  credentials: 'include'
});
```

2. For requests from server components, ensure you're using the authenticated Supabase client.

### Destination Data Validation

**Issue**: Missing or invalid data in API responses causing errors when accessing properties.

**Solution**:
1. Define clear TypeScript interfaces for API responses
2. Add explicit validation checks before using data:

```tsx
// WRONG - assumes data structure is valid
const destId = destData.destination.id;

// CORRECT - validates response structure
if (!destData || !destData.destination || !destData.destination.id) {
  throw new Error('Invalid destination data');
}
const destId = destData.destination.id;
```

3. Include meaningful error messages that help with debugging:

```tsx
if (!destData.destination) {
  console.error('API response missing destination object:', destData);
  throw new Error('Invalid API response: Missing destination property');
}
```

## Best Practices

1. **Type Safety**: Always define proper TypeScript interfaces for API responses and validate data before use.
2. **Authentication**: Include credentials in fetch requests to ensure auth tokens are sent.
3. **Error Handling**: Add specific error messages and proper error catching for debugging.
4. **UI Components**: Use `asChild` when placing interactive elements inside Radix UI components.
5. **Logging**: Log relevant information for easier debugging without exposing sensitive data.

