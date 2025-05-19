'use client';

/**
 * DropdownMenu (Molecule)
 *
 * A themeable, accessible dropdown menu component with keyboard navigation,
 * submenus, item icons, and customizable positioning.
 *
 * @module ui/molecules
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Check, Circle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type DropdownMenuOption = {
  label: React.ReactNode;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  description?: string;
  shortcut?: string;
  checked?: boolean;
  onSelect?: () => void;
};

export type DropdownMenuGroup = {
  label: string;
  options: DropdownMenuOption[];
};

export type DropdownMenuContent = DropdownMenuOption[] | DropdownMenuGroup[];

export type DropdownMenuAlign = 'start' | 'center' | 'end';
export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';

export interface DropdownMenuProps {
  /** Dropdown trigger element */
  trigger?: React.ReactNode;
  /** Dropdown options */
  options: DropdownMenuContent;
  /** Called when an option is selected */
  onSelect?: (value: string) => void;
  /** Whether dropdown is open (controlled) */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Preferred alignment against trigger */
  align?: DropdownMenuAlign;
  /** Preferred side to open on */
  side?: DropdownMenuSide;
  /** Whether dropdown should stay open on select */
  stayOpenOnSelect?: boolean;
  /** Whether dropdown should close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether dropdown should close on escape key */
  closeOnEscape?: boolean;
  /** Additional CSS class for the dropdown container */
  className?: string;
  /** Additional CSS class for the trigger button */
  triggerClassName?: string;
  /** Additional CSS class for the content menu */
  contentClassName?: string;
  /** Custom render function for options */
  renderOption?: (option: DropdownMenuOption) => React.ReactNode;
  /** Whether the dropdown should span the full width of its container */
  fullWidth?: boolean;
  /** Minimum width of the dropdown menu */
  minWidth?: number;
  /** Maximum width of the dropdown menu */
  maxWidth?: number;
  /** Whether to show a dropdown arrow */
  showArrow?: boolean;
  /** Whether the menu should be disabled */
  disabled?: boolean;
  /** Custom ID for the dropdown */
  id?: string;
}

// ============================================================================
// DROPDOWN MENU COMPONENT
// ============================================================================

export function DropdownMenu({
  trigger,
  options,
  onSelect,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  align = 'start',
  side = 'bottom',
  stayOpenOnSelect = false,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className,
  triggerClassName,
  contentClassName,
  renderOption,
  fullWidth = false,
  minWidth,
  maxWidth,
  showArrow = false,
  disabled = false,
  id,
}: DropdownMenuProps) {
  // State for uncontrolled component
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Generate unique ID for accessibility
  const uniqueId = useRef<string>(id || `dropdown-${Math.random().toString(36).substr(2, 9)}`);
  const menuId = `${uniqueId.current}-menu`;
  
  // Handle open state change
  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };
  
  // Toggle menu
  const toggleMenu = () => {
    if (disabled) return;
    setOpen(!isOpen);
  };
  
  // Handle option selection
  const handleSelect = (option: DropdownMenuOption) => {
    if (option.disabled) return;
    
    if (option.onSelect) {
      option.onSelect();
    } else {
      onSelect?.(option.value);
    }
    
    if (!stayOpenOnSelect) {
      setOpen(false);
    }
  };
  
  // Handle click outside
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, closeOnOutsideClick, setOpen]);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, setOpen]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    
    const menuItems = menuRef.current.querySelectorAll('[role="menuitem"]');
    if (!menuItems.length) return;
    
    let focusedIndex = -1;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (e.key === 'ArrowDown') {
          focusedIndex = (focusedIndex + 1) % menuItems.length;
        } else {
          focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
        }
        
        (menuItems[focusedIndex] as HTMLElement).focus();
      }
      
      // Handle enter/space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (menuItems[focusedIndex] as HTMLElement).click();
      }
      
      // Handle home/end
      if (e.key === 'Home') {
        e.preventDefault();
        focusedIndex = 0;
        (menuItems[focusedIndex] as HTMLElement).focus();
      }
      
      if (e.key === 'End') {
        e.preventDefault();
        focusedIndex = menuItems.length - 1;
        (menuItems[focusedIndex] as HTMLElement).focus();
      }
    };
    
    menuRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      menuRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  // Position menu based on align and side
  const getMenuPosition = () => {
    if (!triggerRef.current || !menuRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    
    // Calculate positions
    const positions = {
      top: {
        start: { top: -menuRect.height, left: 0 },
        center: { top: -menuRect.height, left: (triggerRect.width - menuRect.width) / 2 },
        end: { top: -menuRect.height, left: triggerRect.width - menuRect.width },
      },
      right: {
        start: { top: 0, left: triggerRect.width },
        center: { top: (triggerRect.height - menuRect.height) / 2, left: triggerRect.width },
        end: { top: triggerRect.height - menuRect.height, left: triggerRect.width },
      },
      bottom: {
        start: { top: triggerRect.height, left: 0 },
        center: { top: triggerRect.height, left: (triggerRect.width - menuRect.width) / 2 },
        end: { top: triggerRect.height, left: triggerRect.width - menuRect.width },
      },
      left: {
        start: { top: 0, left: -menuRect.width },
        center: { top: (triggerRect.height - menuRect.height) / 2, left: -menuRect.width },
        end: { top: triggerRect.height - menuRect.height, left: -menuRect.width },
      },
    };
    
    return positions[side][align];
  };
  
  // Check if options are grouped
  const isGrouped = Array.isArray(options) && options.length > 0 && 'label' in options[0] && 'options' in options[0];
  
  // Flatten options for keyboard navigation
  const flattenedOptions = isGrouped 
    ? (options as DropdownMenuGroup[]).flatMap(group => group.options)
    : (options as DropdownMenuOption[]);
  
  // Default trigger if none provided
  const defaultTrigger = (
    <button
      type="button"
      className="inline-flex items-center justify-between rounded bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Select an option
      <svg
        className="ml-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
  
  // Render dropdown
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block',
        fullWidth && 'w-full',
        className
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        id={uniqueId.current}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggleMenu}
        className={cn(
          'inline-flex items-center justify-between rounded font-medium focus:outline-none focus:ring-2 focus:ring-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          fullWidth && 'w-full',
          triggerClassName
        )}
        disabled={disabled}
      >
        {trigger || defaultTrigger}
      </button>
      
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={uniqueId.current}
          className={cn(
            'absolute z-10 mt-1 rounded-md border bg-background shadow-lg',
            'animate-in fade-in-80 zoom-in-95',
            contentClassName
          )}
          style={{
            ...getMenuPosition(),
            minWidth: minWidth || (triggerRef.current?.offsetWidth || 220),
            maxWidth: maxWidth || 'auto',
          }}
        >
          {/* Arrow indicator */}
          {showArrow && (
            <div
              className="absolute w-3 h-3 bg-background border transform rotate-45"
              style={{
                top: side === 'bottom' ? -1.5 : undefined,
                bottom: side === 'top' ? -1.5 : undefined,
                left: align === 'start' ? 16 : align === 'center' ? '50%' : undefined,
                right: align === 'end' ? 16 : undefined,
                marginLeft: align === 'center' ? -6 : undefined,
                borderTopWidth: side === 'bottom' ? 1 : 0,
                borderLeftWidth: side === 'right' ? 1 : 0,
                borderBottomWidth: side === 'top' ? 1 : 0,
                borderRightWidth: side === 'left' ? 1 : 0,
              }}
            />
          )}
          
          {/* Grouped options */}
          {isGrouped ? (
            <div className="py-1">
              {(options as DropdownMenuGroup[]).map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.label && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      {group.label}
                    </div>
                  )}
                  {group.options.map((option, optionIndex) => (
                    renderOption ? (
                      renderOption(option)
                    ) : (
                      <DropdownMenuItem
                        key={optionIndex}
                        option={option}
                        onSelect={() => handleSelect(option)}
                      />
                    )
                  ))}
                  {groupIndex < (options as DropdownMenuGroup[]).length - 1 && (
                    <div className="my-1 border-t" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Flat options
            <div className="py-1">
              {(options as DropdownMenuOption[]).map((option, index) => (
                renderOption ? (
                  renderOption(option)
                ) : (
                  <DropdownMenuItem
                    key={index}
                    option={option}
                    onSelect={() => handleSelect(option)}
                  />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DROPDOWN MENU ITEM COMPONENT
// ============================================================================

interface DropdownMenuItemProps {
  option: DropdownMenuOption;
  onSelect: () => void;
}

function DropdownMenuItem({ option, onSelect }: DropdownMenuItemProps) {
  const {
    label,
    icon,
    disabled,
    variant,
    description,
    shortcut,
    checked,
  } = option;
  
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center px-3 py-2 text-sm',
        'focus:bg-muted focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:bg-muted',
        variant === 'destructive' && 'text-destructive',
        checked && 'bg-muted/50'
      )}
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
    >
      {checked && (
        <span className="mr-2 h-4 w-4 text-primary">
          <Check className="h-4 w-4" />
        </span>
      )}
      
      {icon && !checked && (
        <span className="mr-2 h-4 w-4">
          {icon}
        </span>
      )}
      
      {!icon && !checked && (
        <span className="mr-2 h-4 w-4" />
      )}
      
      <div className="flex flex-col flex-grow">
        <span>{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      
      {shortcut && (
        <span className="ml-auto text-xs text-muted-foreground">{shortcut}</span>
      )}
    </button>
  );
}

// ============================================================================
// CONTEXT MENU COMPONENT (EXTENSION)
// ============================================================================

export interface ContextMenuProps extends Omit<DropdownMenuProps, 'trigger'> {
  /** The element that receives the context menu */
  children: React.ReactNode;
  /** Disable default context menu */
  disableNativeMenu?: boolean;
}

export function ContextMenu({
  children,
  disableNativeMenu = true,
  ...dropdownProps
}: ContextMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const contextRef = useRef<HTMLDivElement>(null);
  
  // Handle context menu event
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disableNativeMenu) {
      e.preventDefault();
    }
    
    setPosition({ x: e.clientX, y: e.clientY });
    dropdownProps.onOpenChange?.(true);
  };
  
  return (
    <div ref={contextRef} onContextMenu={handleContextMenu}>
      {children}
      
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <DropdownMenu
          {...dropdownProps}
          contentClassName={cn(
            'fixed',
            dropdownProps.contentClassName
          )}
          triggerClassName="hidden"
          trigger={<div />}
        />
      </div>
    </div>
  );
}