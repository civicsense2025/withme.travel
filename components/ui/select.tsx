'use client';

/**
 * Select (Molecule)
 *
 * A themeable, accessible select dropdown component with support
 * for single and multiple selection, grouping, searching, and virtualization.
 *
 * @module ui/molecules
 */
import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { Check, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & CONTEXT
// ============================================================================

export type SelectOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  meta?: any;
};

export type SelectOptionGroup = {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
};

export type SelectPlacement = 'top' | 'bottom' | 'auto';
export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectState = 'default' | 'error' | 'success' | 'warning';

type SelectContextValue = {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple: boolean;
  disabled: boolean;
  closeMenu: () => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
};

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export interface SelectProps {
  /** Select options */
  options: (SelectOption | SelectOptionGroup)[];
  /** Currently selected value(s) */
  value: string | string[];
  /** Called when selection changes */
  onChange: (value: string | string[]) => void;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Whether to allow multiple selections */
  multiple?: boolean;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is readonly */
  readOnly?: boolean;
  /** Child components */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: SelectSize;
  /** Menu dropdown placement */
  placement?: SelectPlacement;
  /** Whether to clear all values when clicking clear button */
  clearable?: boolean;
  /** Show search input in dropdown */
  searchable?: boolean;
  /** Called when search input changes */
  onSearch?: (query: string) => void;
  /** Width of the select */
  width?: number | string;
  /** Maximum height of the options menu */
  maxMenuHeight?: number;
  /** Minimum width of the dropdown menu as fraction of trigger */
  menuWidthRatio?: number;
  /** Whether to close on selection */
  closeOnSelect?: boolean;
  /** Maximum selected items to display before showing "+X more" */
  maxDisplayValues?: number;
  /** Custom render function for selected value */
  renderValue?: (value: string | string[], options: SelectOption[]) => React.ReactNode;
  /** State/validation status */
  state?: SelectState;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Called when select menu opens */
  onOpen?: () => void;
  /** Called when select menu closes */
  onClose?: () => void;
  /** Default open state */
  defaultOpen?: boolean;
  /** Format the option label display */
  formatOptionLabel?: (option: SelectOption) => React.ReactNode;
  /** Create new option from input */
  creatable?: boolean;
  /** Called when creating a new option */
  onCreateOption?: (inputValue: string) => void;
  /** Virtualize options for performance */
  virtualized?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  multiple = false,
  disabled = false,
  readOnly = false,
  children,
  className,
  size = 'md',
  placement = 'bottom',
  clearable = false,
  searchable = false,
  onSearch,
  width,
  maxMenuHeight = 300,
  menuWidthRatio = 1,
  closeOnSelect = !multiple,
  maxDisplayValues = 3,
  renderValue,
  state = 'default',
  error,
  helperText,
  onOpen,
  onClose,
  defaultOpen = false,
  formatOptionLabel,
  creatable = false,
  onCreateOption,
  virtualized = false,
}: SelectProps) {
  // Component state
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [triggerWidth, setTriggerWidth] = useState(0);
  
  // Refs
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Flatten option groups
  const flatOptions = useMemo(() => {
    const flattened: SelectOption[] = [];
    
    options.forEach((option) => {
      if ('options' in option) {
        // It's a group
        option.options.forEach((groupOption) => {
          if (!option.disabled) {
            flattened.push(groupOption);
          }
        });
      } else {
        // It's a single option
        flattened.push(option);
      }
    });
    
    return flattened;
  }, [options]);
  
  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    
    return options.map((option) => {
      if ('options' in option) {
        // Filter group options
        const filteredGroupOptions = option.options.filter((groupOption) =>
          String(groupOption.label).toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Only return groups that have matching options
        return filteredGroupOptions.length > 0
          ? { ...option, options: filteredGroupOptions }
          : null;
      } else {
        // Filter single option
        return String(option.label).toLowerCase().includes(searchQuery.toLowerCase())
          ? option
          : null;
      }
    }).filter(Boolean) as (SelectOption | SelectOptionGroup)[];
  }, [options, searchQuery]);
  
  // Selected options
  const selectedOptions = useMemo(() => {
    if (multiple) {
      return (value as string[]).map(
        (val) => flatOptions.find((option) => option.value === val)
      ).filter(Boolean) as SelectOption[];
    } else {
      const selected = flatOptions.find((option) => option.value === value);
      return selected ? [selected] : [];
    }
  }, [value, flatOptions, multiple]);
  
  // Get option label by value
  const getOptionLabel = (optionValue: string): React.ReactNode => {
    const option = flatOptions.find(opt => opt.value === optionValue);
    return option ? option.label : optionValue;
  };
  
  // Toggle menu
  const toggleMenu = () => {
    if (disabled || readOnly) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      onOpen?.();
      
      // Focus search input if searchable
      setTimeout(() => {
        if (searchable && inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    } else {
      onClose?.();
      setSearchQuery('');
    }
  };
  
  // Close menu
  const closeMenu = () => {
    setIsOpen(false);
    onClose?.();
    setSearchQuery('');
  };
  
  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    if (multiple) {
      const currentValues = value as string[];
      const newValue = currentValues.includes(option.value)
        ? currentValues.filter((val) => val !== option.value)
        : [...currentValues, option.value];
      
      onChange(newValue);
    } else {
      onChange(option.value);
      
      if (closeOnSelect) {
        closeMenu();
      }
    }
  };
  
  // Handle clear button click
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };
  
  // Create a new option
  const handleCreateOption = () => {
    if (!creatable || !searchQuery.trim() || !onCreateOption) return;
    
    onCreateOption(searchQuery.trim());
    setSearchQuery('');
    
    if (closeOnSelect) {
      closeMenu();
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const flattenedFilteredOptions = flattenOptions(filteredOptions);
          return Math.min(prevIndex + 1, flattenedFilteredOptions.length - 1);
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        break;
        
      case 'Enter':
        e.preventDefault();
        const flattenedFilteredOptions = flattenOptions(filteredOptions);
        
        if (searchQuery && creatable && !flattenedFilteredOptions.length) {
          handleCreateOption();
        } else if (flattenedFilteredOptions[highlightedIndex]) {
          handleSelect(flattenedFilteredOptions[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
        
      case 'Tab':
        closeMenu();
        break;
    }
  };
  
  // Flatten options for keyboard navigation
  const flattenOptions = (opts: (SelectOption | SelectOptionGroup)[]) => {
    const flat: SelectOption[] = [];
    
    opts.forEach((option) => {
      if ('options' in option) {
        option.options.forEach((o) => {
          if (!o.disabled) flat.push(o);
        });
      } else if (!option.disabled) {
        flat.push(option);
      }
    });
    
    return flat;
  };
  
  // Update trigger width for menu positioning
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [isOpen]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };
  
  // State classes
  const stateClasses = {
    default: 'border-input',
    error: 'border-destructive text-destructive',
    success: 'border-green-500',
    warning: 'border-yellow-500',
  };
  
  // Render selected values
  const renderSelectedValues = () => {
    if (renderValue) {
      return renderValue(value, selectedOptions);
    }
    
    if (selectedOptions.length === 0) {
      return (
        <span className="text-muted-foreground">{placeholder}</span>
      );
    }
    
    if (!multiple) {
      return (
        <span className="truncate">{selectedOptions[0].label}</span>
      );
    }
    
    // For multiple selection
    const displayCount = Math.min(selectedOptions.length, maxDisplayValues);
    const remainingCount = selectedOptions.length - displayCount;
    
    return (
      <div className="flex flex-wrap gap-1 items-center">
        {selectedOptions.slice(0, displayCount).map((option) => (
          <span
            key={option.value}
            className={cn(
              'inline-flex items-center gap-1 rounded-sm bg-muted px-1 py-0.5 text-xs',
              size === 'sm' ? 'py-0 text-xs' : ''
            )}
          >
            {option.label}
            {!disabled && !readOnly && (
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
              />
            )}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-muted-foreground text-xs">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };
  
  return (
    <SelectContext.Provider
      value={{
        value,
        onChange,
        multiple,
        disabled,
        closeMenu,
        highlightedIndex,
        setHighlightedIndex,
      }}
    >
      <div className="flex flex-col space-y-1">
        <div
          ref={triggerRef}
          className={cn(
            'flex items-center justify-between border rounded bg-background',
            'cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
            sizeClasses[size],
            stateClasses[state],
            disabled && 'opacity-50 cursor-not-allowed',
            readOnly && 'cursor-default',
            className
          )}
          tabIndex={disabled || readOnly ? -1 : 0}
          onClick={toggleMenu}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-disabled={disabled}
          role="combobox"
          aria-controls={isOpen ? 'select-dropdown' : undefined}
          style={{ width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%' }}
        >
          <div className="flex-grow overflow-hidden">
            {renderSelectedValues()}
          </div>
          
          <div className="flex shrink-0 items-center">
            {clearable && (value as any)?.length > 0 && !disabled && !readOnly && (
              <X
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors mr-1"
                onClick={handleClear}
              />
            )}
            
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {(error || helperText) && (
          <div className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error || helperText}
          </div>
        )}
        
        {isOpen && (
          <div
            ref={menuRef}
            id="select-dropdown"
            className={cn(
              'absolute z-50 mt-1 overflow-auto rounded-md border bg-popover shadow-md',
              'p-1 animate-in fade-in-80 zoom-in-95'
            )}
            style={{
              width: menuWidthRatio * triggerWidth,
              maxHeight: maxMenuHeight,
              top: placement === 'bottom' ? undefined : 'auto',
              bottom: placement === 'top' ? undefined : 'auto',
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            {searchable && (
              <div className="sticky top-0 bg-popover p-1 z-10">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className={cn(
                      'w-full border rounded bg-background px-8 py-1.5 text-sm',
                      'focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                  />
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {searchQuery && (
                    <X
                      className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* Options list */}
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                  {creatable ? (
                    <button
                      className="w-full text-left cursor-pointer hover:bg-muted rounded px-2 py-1"
                      onClick={handleCreateOption}
                    >
                      Create "{searchQuery}"
                    </button>
                  ) : (
                    "No options found"
                  )}
                </div>
              ) : (
                virtualized ? (
                  // ============================================================================
                  // OPTIONS LIST RENDERING (WITH TYPE SAFETY)
                  // ============================================================================

                  <div className="virtual-list-placeholder">
                    {/* Virtualized list would go here using a library like react-window */}
                    {/* This is a placeholder since full virtualization would require additional dependencies */}
                    {filteredOptions.map((option, index) => {
                      // Type guard for option group
                      if ('options' in option) {
                        return (
                          <SelectOptionGroup
                            key={`group-${index}`}
                            group={option}
                            baseIndex={index}
                            formatOptionLabel={formatOptionLabel}
                            value={value}
                            multiple={multiple}
                          />
                        );
                      }
                      return (
                        <SelectOption
                          key={option.value}
                          option={option}
                          index={index}
                          isSelected={(multiple ? value : [value]).includes(option.value)}
                          formatOptionLabel={formatOptionLabel}
                        />
                      );
                    })}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    if ('options' in option) {
                      return (
                        <SelectOptionGroup
                          key={`group-${index}`}
                          group={option}
                          baseIndex={index}
                          formatOptionLabel={formatOptionLabel}
                          value={value}
                          multiple={multiple}
                        />
                      );
                    }
                    return (
                      <SelectOption
                        key={option.value}
                        option={option}
                        index={index}
                        isSelected={(multiple ? value : [value]).includes(option.value)}
                        formatOptionLabel={formatOptionLabel}
                      />
                    );
                  })
                )
              )}
            </div>
          </div>
        )}
        
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ============================================================================
// SELECT OPTION COMPONENT
// ============================================================================
/**
 * Option data and rendering logic for a single Select option.
 *
 * @property option - The option data to render (label, value, disabled, etc)
 * @property index - The index of the option in the flattened, filtered list
 * @property isSelected - Whether this option is currently selected
 * @property formatOptionLabel - Optional custom label renderer for the option
 */

export interface SelectOptionProps extends React.HTMLAttributes<HTMLDivElement> {

  option: {
    /** Option label (displayed to the user) */
    label: React.ReactNode;
    /** Option value (unique identifier) */
    value: string;
    /** Optional: Whether the option is disabled */
    disabled?: boolean;
    /** Optional: Option description or sublabel */
    description?: string;
    /** Optional: Option icon or avatar */
    icon?: React.ReactNode;
    /** Optional: Any additional custom data for the option */
    [key: string]: unknown;
  };
  /** Index of the option in the flattened, filtered list */
  index: number;
  /** Whether this option is currently selected */
  isSelected: boolean;
  /**
   * Optional custom label renderer for the option.
   * Receives the full option object and returns a React node.
   */
  formatOptionLabel?: (option: SelectOption) => React.ReactNode;
}

/**
 * Renders a single selectable option in the dropdown
 *
 * @param props - SelectOptionProps
 * @param ref - React ref for the option div
 */
export const SelectOption = React.forwardRef<HTMLDivElement, SelectOptionProps>(function SelectOption(
  {
    option,
    index,
    isSelected,
    formatOptionLabel,
    ...rest
  }: SelectOptionProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  // Defensive context extraction with fallback to avoid undefined errors
  const selectContext = useContext(SelectContext);

  const onChange = selectContext?.onChange;
  const multiple = selectContext?.multiple;
  const closeMenu = selectContext?.closeMenu;
  const highlightedIndex = selectContext?.highlightedIndex;
  const setHighlightedIndex = selectContext?.setHighlightedIndex;

  const handleClick = () => {
    if (option.disabled) return;

    if (multiple) {
      if (typeof onChange === 'function') {
        // For multi-select, ensure onChange receives the correct value type
        const newValueUpdater = (prev: string[] | string | undefined): string[] => {
          const prevArray = Array.isArray(prev)
            ? prev
            : typeof prev === 'string' && prev
            ? [prev]
            : [];
          return isSelected
            ? prevArray.filter((v) => v !== option.value)
            : [...prevArray, option.value];
        };
        // Always pass a string[] for multi-select
        onChange(newValueUpdater([]));
      }
    } else {
      if (typeof onChange === 'function') {
        onChange(option.value);
      }
      if (typeof closeMenu === 'function') {
        closeMenu();
      }
    }
    };


  const isHighlighted = highlightedIndex === index;

  // Handle hover
  /**
   * Handles mouse enter event for the option.
   * Sets the highlighted index if the option is not disabled and setHighlightedIndex is available.
   */
  const handleMouseEnter = () => {
    if (!option.disabled && typeof setHighlightedIndex === 'function') {
      setHighlightedIndex(index);
    }
  };

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      className={cn(
        'flex items-center px-2 py-1.5 text-sm rounded cursor-pointer',
        isHighlighted && 'bg-muted',
        isSelected && 'bg-primary/10',
        option.disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      {multiple && (
        <div className="mr-2 flex h-4 w-4 items-center justify-center">
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
      )}

      {option.icon && (
        <span className="mr-2 text-muted-foreground">{option.icon}</span>
      )}

      <div className="flex flex-col">
        <span>{formatOptionLabel ? formatOptionLabel(option) : option.label}</span>
        {option.description && (
          <span className="text-xs text-muted-foreground">{option.description}</span>
        )}
      </div>

      {!multiple && isSelected && (
        <Check className="ml-auto h-4 w-4 text-primary" />
      )}
    </div>
  );
});

// ============================================================================
// SELECT OPTION GROUP COMPONENT
// ============================================================================

/**
 * Props for the SelectOptionGroup component
 */
interface SelectOptionGroupProps {
  /** The group object containing label and options */
  group: SelectOptionGroup;
  /** The base index in the overall options list */
  baseIndex: number;
  /** Optional custom label renderer */
  formatOptionLabel?: (option: SelectOption) => React.ReactNode;
  /** Current value(s) for selection */
  value: unknown;
  /** Whether multiple selection is enabled */
  multiple: boolean;
}

/**
 * Renders a group of options with a group label
 */
function SelectOptionGroup({
  group,
  baseIndex,
  formatOptionLabel,
  value,
  multiple,
}: SelectOptionGroupProps) {
  return (
    <div>
      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
        {group.label}
      </div>
      <div className="pl-2">
        {group.options.map((option, optionIndex) => (
          <SelectOption
            key={option.value}
            option={{
              ...option,
              disabled: option.disabled || group.disabled,
            }}
            index={baseIndex + optionIndex}
            isSelected={
              Array.isArray(multiple ? value : [value])
                ? (multiple ? (value as unknown[]) : [value]).includes(option.value)
                : false
            }
            formatOptionLabel={formatOptionLabel}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SELECT TRIGGER COMPONENT
// ============================================================================

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether select is open */
  open?: boolean;
  /** Placeholder when no option is selected */
  placeholder?: string;
  /** Child components */
  children?: React.ReactNode;
  /** Size variant */
  size?: SelectSize;
  /** Whether trigger is disabled */
  disabled?: boolean;
  /** State/validation status */
  state?: SelectState;
}

export function SelectTrigger({
  open,
  placeholder,
  children,
  className,
  size = 'md',
  disabled = false,
  state = 'default',
  ...props
}: SelectTriggerProps) {
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };
  
  const stateClasses = {
    default: 'border-input',
    error: 'border-destructive text-destructive',
    success: 'border-green-500',
    warning: 'border-yellow-500',
  };
  
  return (
    <div
      className={cn(
        'flex items-center justify-between border rounded bg-background',
        'cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
        sizeClasses[size],
        stateClasses[state],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...props}
    >
      {children || (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      
      {open ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

// ============================================================================
// SELECT CONTENT COMPONENT
// ============================================================================

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Child components */
  children: React.ReactNode;
  /** Whether to render in a portal */
  portal?: boolean;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Placement of the content */
  placement?: SelectPlacement;
}

export function SelectContent({
  children,
  className,
  portal = true,
  maxHeight = 300,
  placement = 'bottom',
  ...props
}: SelectContentProps) {
  return (
    <div
      className={cn(
        'z-50 min-w-[8rem] overflow-auto rounded-md border bg-popover shadow-md',
        'animate-in fade-in-80 zoom-in-95',
        className
      )}
      style={{ maxHeight }}
      {...props}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

// ============================================================================
// SELECT ITEM COMPONENT
// ============================================================================

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Item value */
  value: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is selected */
  selected?: boolean;
  /** Icon to display before label */
  icon?: React.ReactNode;
  /** Item description */
  description?: string;
}

export function SelectItem({
  value,
  children,
  disabled = false,
  selected = false,
  icon,
  description,
  className,
  ...props
}: SelectItemProps) {
  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      className={cn(
        'relative flex items-center px-2 py-1.5 text-sm rounded cursor-pointer',
        selected && 'bg-primary/10',
        !disabled && !selected && 'hover:bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="mr-2 text-muted-foreground">{icon}</span>
      )}
      
      <div className="flex flex-col">
        <span>{children}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      
      {selected && (
        <Check className="ml-auto h-4 w-4 text-primary" />
      )}
    </div>
  );
}

// ============================================================================
// OTHER SUBCOMPONENTS
// ============================================================================

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <div
      className={cn('px-2 py-1 text-xs font-semibold text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <div className={cn('my-1 h-px bg-muted', className)} {...props} />;
}

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group label */
  label?: React.ReactNode;
}

export function SelectGroup({ label, children, className, ...props }: SelectGroupProps) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {label && <SelectLabel>{label}</SelectLabel>}
      {children}
    </div>
  );
}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <span className={cn('truncate', className)} {...props} />
  );
}