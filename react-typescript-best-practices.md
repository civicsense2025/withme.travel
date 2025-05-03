# React & TypeScript Best Practices for withme.travel

## Introduction

This document outlines best practices for writing React components with TypeScript in the withme.travel codebase. Following these guidelines will help prevent common errors, improve code clarity, maintain consistency, and make development more efficient. The focus is on addressing the specific types of issues encountered during recent debugging sessions.

## Core Principles

1.  **Type Safety First**: Leverage TypeScript's features to catch errors at compile time. Avoid `any` whenever possible. Be explicit with types for props, state, and function return values.
2.  **Clarity and Readability**: Write code that is easy for other developers (and your future self) to understand. Use descriptive names and consistent formatting.
3.  **Consistency**: Adhere to established patterns within the codebase for hooks, state management, component structure, and syntax.
4.  **Correctness**: Ensure React hooks are used correctly, state is managed predictably, and component logic is sound.

## Common Pitfalls & Solutions

Based on recent fixes, here are common areas where errors occur and how to avoid them:

### 1. React Hooks Usage

**a. Initialization:**

- **Problem**: Forgetting to initialize state variables using `useState` or refs using `useRef`.
- **Solution**: Always declare `useState` and `useRef` hooks at the top level of your functional component before they are used. Provide appropriate initial values.

  ```tsx
  // WRONG - State used before declaration
  // export function MyComponent() {
  //   const handleClick = () => setIsLoading(true); // Error: setIsLoading not defined
  //   // ... later ...
  //   const [isLoading, setIsLoading] = useState(false);
  // }

  // RIGHT
  'use client';
  import { useState, useRef } from 'react';

  export function MyComponent() {
    const [isLoading, setIsLoading] = useState(false); // Declare at the top
    const myRef = useRef<HTMLDivElement>(null); // Declare refs

    const handleClick = () => setIsLoading(true);

    return <div ref={myRef}>{/* ... */}</div>;
  }
  ```

**b. `useEffect` Dependencies:**

- **Problem**: Missing dependencies in the `useEffect` dependency array, leading to stale closures or effects not running when expected. Incorrect syntax like `return setState()` inside effects.
- **Solution**: Include _all_ variables from the component scope that are used inside the `useEffect` callback in the dependency array. Use the `eslint-plugin-react-hooks` (`exhaustive-deps` rule) to help identify missing dependencies. Never use `return setState()` inside `useEffect`; just call `setState`.

  ```tsx
  // WRONG - Missing dependency, incorrect return
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await fetch(`/api/data?id=${itemId}`);
  //     return setData(await data.json()); // Incorrect return
  //   }
  //   fetchData();
  // }, []); // Missing itemId and setData

  // RIGHT
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`/api/data?id=${itemId}`);
      setData(await data.json()); // Correct state update
    };
    if (itemId) {
      fetchData();
    }
  }, [itemId, setData]); // Include all dependencies used inside
  ```

**c. `useEffect` Cleanup:**

- **Problem**: Incorrectly accessing `ref.current` directly within the cleanup function, which might capture a stale value.
- **Solution**: Capture the `ref.current` value in a variable _inside_ the effect setup phase, and use that variable in the cleanup function.

  ```tsx
  // WRONG
  // useEffect(() => {
  //   myRef.current?.addEventListener('click', handleClick);
  //   return () => {
  //     myRef.current?.removeEventListener('click', handleClick); // May use stale ref value
  //   };
  // }, [handleClick]);

  // RIGHT
  useEffect(() => {
    const node = myRef.current; // Capture current value
    node?.addEventListener('click', handleClick);
    return () => {
      node?.removeEventListener('click', handleClick); // Use captured value
    };
  }, [handleClick]); // Include dependencies
  ```

**d. `useCallback` Dependencies:**

- **Problem**: Including unnecessary dependencies in `useCallback` or forgetting necessary ones, leading to either stale callbacks or unnecessary re-creations.
- **Solution**: Only include variables in the `useCallback` dependency array that are actually _used within the callback function itself_.

  ```tsx
  // WRONG - updateItemsAfterEdit not used inside
  // const updateItems = useCallback(() => {
  //  doSomething(value);
  // }, [value, updateItemsAfterEdit]);

  // RIGHT
  const updateItems = useCallback(() => {
    doSomething(value);
  }, [value]); // Only include 'value'
  ```

### 2. Component Structure & Syntax

**a. Function Definition:**

- **Problem**: Incomplete or syntactically incorrect component function definitions (e.g., missing return statements, incorrect parameter destructuring, unclosed brackets).
- **Solution**: Ensure functional components have a clear structure: props definition (interface), hook initializations, helper functions/logic, and a single top-level JSX return statement. Use a linter/formatter (like Prettier) to catch syntax errors early.

  ```tsx
  // WRONG - Missing return, incorrect destructuring
  // export function MyCard({ title, description }) => { // Incorrect syntax
  //   const [isVisible, setIsVisible] = useState(true);
  //   <div>{title}</div> // No return statement
  // }

  // RIGHT
  'use client';
  import { useState } from 'react';

  interface MyCardProps {
    title: string;
    description: string;
  }

  export function MyCard({ title, description }: MyCardProps) {
    // Correct props destructuring and typing
    const [isVisible, setIsVisible] = useState(true);

    return (
      // Explicit return
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    );
  }
  ```

**b. Props Typing:**

- **Problem**: Missing or incorrect TypeScript interfaces for component props.
- **Solution**: Always define a clear `interface` for your component's props. Use optional properties (`?`) where appropriate.

  ```tsx
  interface UserProfileProps {
    userId: string;
    showDetails?: boolean; // Optional prop
    onUpdate: (data: UserData) => void; // Function prop type
  }

  export function UserProfile({ userId, showDetails = false, onUpdate }: UserProfileProps) {
    // ... component logic
  }
  ```

### 3. TypeScript Syntax

**a. Function Return Types:**

- **Problem**: Implicit `any` return types or incorrect explicit return types for functions. Syntax errors like `return throw error;`.
- **Solution**: Be explicit about function return types, especially for utility functions or complex logic. Use `void` for functions that don't return anything. Use `throw error;` directly, not `return throw error;`.

  ```typescript
  // WRONG
  // function calculateTotal(items) { ... } // Implicit any return
  // function throwErrorHook(): (error: Error) => void {
  //   return (error: Error) => { return throw error; }; // Incorrect syntax
  // }

  // RIGHT
  function calculateTotal(items: CartItem[]): number {
    // Explicit return type
    // ... calculation
    return total;
  }

  function logMessage(message: string): void {
    // Explicit void return
    console.log(message);
  }

  function useThrowError(): (error: Error) => void {
    return (error: Error) => {
      throw error;
    }; // Correct syntax
  }
  ```

**b. Object/Interface Definitions:**

- **Problem**: Syntax errors when defining object literals or interfaces (e.g., misplaced commas, incorrect bracket usage).
- **Solution**: Pay close attention to syntax. Use linters and TypeScript's compiler feedback to identify and fix these issues.

  ```typescript
  // WRONG
  // interface Config {
  //   apiKey: string // Missing comma or semicolon
  //   timeout: number,; // Extra comma and semicolon
  // }

  // RIGHT
  interface Config {
    apiKey: string;
    timeout: number;
    retries?: number; // Optional property
  }

  const settings: Config = {
    // Type annotation for object literal
    apiKey: 'abc',
    timeout: 5000,
  };
  ```

### 4. Template Literals

- **Problem**: Using backticks (`) instead of double (`"`) or single (`'`) quotes for simple string attributes in JSX. Unterminated or incorrectly nested template literals.
- **Solution**: Use double or single quotes for static JSX string attributes. Use template literals (` `` `) with `${expression}` syntax _only_ when embedding expressions. Ensure template literals are properly closed.

  ```tsx
  // WRONG
  // <div className=`my-class`>...</div> // Incorrect quotes
  // const message = `Error: ${error.message; // Unterminated literal

  // RIGHT
  <div className="my-class another-class">...</div> // Correct quotes
  <div className={`p-4 ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}> {/* Correct template literal use */}
    Content
  </div>
  const message = `Error: ${error.message}`; // Correctly terminated
  ```

### 5. Error Handling

- **Problem**: Missing `try...catch` blocks for asynchronous operations (like `fetch`) or potentially failing logic. Lack of specific error boundaries around UI sections.
- **Solution**: Wrap `async/await` calls and other error-prone code in `try...catch` blocks. Use custom error boundary components (like `ClassErrorBoundary` or the default Next.js `error.tsx`) to gracefully handle rendering errors in specific parts of the UI.

  ```tsx
  // Fetching data
  async function fetchData(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Handle error appropriately (e.g., show toast, set error state)
      setErrorState('Failed to load data.');
      return null; // Or rethrow a more specific error
    }
  }

  // UI with Error Boundary
  import { ClassErrorBoundary } from '@/components/error-boundary';
  import { SomeFallbackUI } from '@/components/error-fallbacks';

  function MyPageComponent() {
    return (
      <div>
        <h1>Page Title</h1>
        <ClassErrorBoundary fallback={<SomeFallbackUI section="profile" />}>
          <UserProfile />
        </ClassErrorBoundary>
        <ClassErrorBoundary fallback={<SomeFallbackUI section="feed" />}>
          <ActivityFeed />
        </ClassErrorBoundary>
      </div>
    );
  }
  ```

## Best Practices Summary

- **Initialize Hooks**: Always declare `useState`, `useRef`, etc., at the top of your component with initial values.
- **`useEffect` Dependencies**: Be exhaustive. Include everything from the component scope used inside the effect. Use the linter rule.
- **`useEffect` Cleanup**: Capture `ref.current` values _inside_ the effect for safe use in cleanup.
- **Props Typing**: Define clear `interface`s for all component props.
- **Function Typing**: Explicitly type function parameters and return values. Use `void` where applicable.
- **Syntax**: Pay close attention to brackets, commas, and quotes. Use a formatter.
- **Template Literals**: Use `""` or `''` for static strings in JSX. Use `` `${}` `` only for embedding expressions.
- **Error Handling**: Use `try...catch` for async/risky code. Use Error Boundaries for UI robustness.
- **Avoid `any`**: Use specific types, `unknown`, or generics instead of `any`.

## Frequently Asked Questions (FAQs)

- **Q: My `useEffect` runs too often or not enough.**
  - **A:** Check your dependency array. Ensure _all_ values used inside the effect that can change are included. If a function is included, ensure it's stable (e.g., wrapped in `useCallback`).
- **Q: I'm getting "Cannot read property '...' of undefined" errors.**
  - **A:** This often happens when state hasn't initialized yet or an API call failed. Ensure proper initialization (e.g., `useState([])` for arrays, `useState(null)` for objects) and check for loading/error states before accessing data. Use optional chaining (`?.`) safely.
- **Q: Why is my `ref.current` `null` in the `useEffect` cleanup?**
  - **A:** The component might unmount before the ref is assigned, or the cleanup function is capturing a stale `null` value. Capture `ref.current` in a variable inside the effect setup as shown in the examples.
- **Q: When should I use `useCallback`?**
  - **A:** Use `useCallback` to memoize functions passed down as props to memoized child components (`React.memo`) or when functions are included in `useEffect` dependency arrays to prevent unnecessary re-runs. Avoid premature optimization.
- **Q: TypeScript complains about a type mismatch, but it looks correct.**
  - **A:** Double-check the exact types. Are you comparing `string | null` with `string`? Is an object missing an optional property? Use explicit type annotations or type guards (`typeof`, `instanceof`, custom type predicate functions) to help TypeScript narrow down the type.

## Integration

- **Linting**: Ensure ESLint with `eslint-plugin-react` and `eslint-plugin-react-hooks` (especially the `exhaustive-deps` rule) is configured and running.
- **Formatting**: Use Prettier to maintain consistent code style and catch basic syntax errors.
- **Code Reviews**: Actively look for these common pitfalls during code reviews.

By consistently applying these practices, we can significantly reduce TypeScript and React-related errors in the withme.travel project.
