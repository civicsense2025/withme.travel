/**
 * ToggleGroup (Molecule)
 *
 * A themeable, accessible toggle group component for selecting one or multiple options.
 *
 * @module ui/molecules
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleGroupContextSingle {
  type: "single";
  value: string | undefined;
  onValueChange: (value: string) => void;
}

interface ToggleGroupContextMultiple {
  type: "multiple";
  value: string[];
  onValueChange: (value: string[]) => void;
}

type ToggleGroupContextValue = ToggleGroupContextSingle | ToggleGroupContextMultiple;

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | undefined>(undefined);

export interface ToggleGroupSingleProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "single";
  value?: string;
  onValueChange: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "multiple";
  value?: string[];
  onValueChange: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  ToggleGroupProps
>(({ className, type, value, onValueChange, ...props }, ref) => {
  // Default empty array for multiple type if value is undefined
  const normalizedValue = type === "multiple" && !value ? [] : value;
  
  return (
    <ToggleGroupContext.Provider value={{ type, value: normalizedValue, onValueChange } as ToggleGroupContextValue}>
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-md bg-muted p-1",
          className
        )}
        {...props}
      />
    </ToggleGroupContext.Provider>
  );
});
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The value associated with this item */
  value: string;
  /** Whether the item can be interacted with */
  disabled?: boolean;
}

export const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, children, value, disabled, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup");
  }
  
  // Calculate whether this item is selected
  const isSelected = context.type === "single" 
    ? context.value === value 
    : context.value.includes(value);
  
  const handleClick = () => {
    if (disabled) return;
    
    if (context.type === "single") {
      context.onValueChange(value);
    } else {
      // For multiple selection, toggle the value
      const currentValue = [...context.value];
      if (isSelected) {
        context.onValueChange(currentValue.filter(v => v !== value));
      } else {
        context.onValueChange([...currentValue, value]);
      }
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role={context.type === "single" ? "radio" : "checkbox"}
      aria-checked={isSelected}
      data-state={isSelected ? "on" : "off"}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem"; 