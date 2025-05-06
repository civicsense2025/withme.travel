## [May 5, 2025] - Collaborative Idea Board & WhiteboardControls Fixes

### Major Fixes & Improvements

- **WhiteboardControls Clickability & Layering**
  - Changed the WhiteboardControls wrapper in `IdeasWhiteboard` from `absolute` to `fixed` positioning, ensuring it stays in place regardless of other element transforms.
  - Dramatically increased the z-index for WhiteboardControls from 50/100 to 1000, guaranteeing it appears above all other elements.
  - Added `pointer-events-auto !important` to `.whiteboard-controls` in CSS to force the controls to receive pointer events and be clickable.
  - Updated the main content area in `IdeasWhiteboard` to use a new `.board-content` class for improved stacking context.
  - Added a dedicated `.board-background` class with explicit pointer-events handling to prevent event capture issues.
  - Ensured no transparent overlays or grid layers block interaction with controls.

- **TypeScript & Linter Fixes**
  - Fixed a linter/type error in the `useDeviceCapabilities` function by ensuring `hasLimitedMemory` is always a boolean value, not `number | boolean`.

### Result
- WhiteboardControls now:
  1. Appear at the bottom center (fixed position)
  2. Are fully clickable and interactive (high z-index, pointer events)
  3. Maintain proper stacking above all other content

## Learnings: Groups & Collaborative Whiteboard (as of May 2025)

### Key Lessons & Best Practices

- **Z-Index & Stacking Contexts**
  - Always explicitly manage z-index for interactive and overlay elements. Use very high z-index values (e.g., 1000+) for floating controls that must always be on top.
  - Use dedicated CSS classes (e.g., `.board-background`, `.board-content`, `.whiteboard-controls`) to create clear stacking layers and avoid accidental overlaps.

- **Pointer Events & Clickability**
  - Use `pointer-events: auto` on interactive controls and `pointer-events: none` on overlays (like grid/cursor layers) to ensure only the right elements capture events.
  - If controls are not clickable, check for invisible overlays or stacking context issues before debugging event handlers.

- **Event Propagation**
  - Always check event targets in mouse handlers. Prevent panning/dragging logic from triggering when clicking on controls, buttons, or input fields.
  - Use `stopPropagation()` only when necessary—prefer to structure the DOM so that event bubbling is not a problem.

- **Component Structure**
  - Render overlays (like grid or SVG connections) *before* interactive content in the DOM to ensure proper layering.
  - Use wrapper divs with explicit z-index and pointer-events for all floating UI (modals, controls, dropdowns, etc.).

- **TypeScript & Defensive Coding**
  - Always ensure computed values (like `hasLimitedMemory`) are strictly typed as boolean to avoid subtle bugs and linter errors.
  - Use type-safe hooks and context for collaborative state (presence, ideas, etc.).

- **Debugging Strategies**
  - Use temporary event debugger components to visualize which elements are capturing events.
  - If highlighting/selecting one element highlights everything, check for a full-screen overlay or a parent with pointer-events issues.
  - When in doubt, comment out overlays/cursors and reintroduce them one by one to isolate the problem.

- **Collaborative UI Patterns**
  - Virtualize large lists of ideas/cursors for performance.
  - Throttle high-frequency events (drag, cursor, presence) to avoid UI jank.
  - Memoize components and callbacks to prevent unnecessary re-renders in large collaborative boards.

--- 