/**
 * Button (Atom)
 *
 * A comprehensive button component with multiple variants, states,
 * animations, and accessibility features.
 *
 * @module ui/atoms
 */
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ExternalLink, ChevronDown, Check } from 'lucide-react';
import { HtmlHTMLAttributes } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'warning'
  | 'success'
  | 'info'
  | 'link'
  | 'subtle'
  | 'gradient';

export type ButtonSize = 
  | 'xs'
  | 'sm' 
  | 'md' 
  | 'lg' 
  | 'xl'
  | 'icon'
  | 'icon-sm'
  | 'icon-lg';

export type ButtonShape = 
  | 'default'
  | 'square'
  | 'rounded'
  | 'pill';

export type ButtonAnimation = 
  | 'none'
  | 'pulse'
  | 'bounce'
  | 'shine'
  | 'scale';

export type ButtonState = 
  | 'default'
  | 'active'
  | 'selected';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button shape */
  shape?: ButtonShape;
  /** Animation effect */
  animation?: ButtonAnimation;
  /** Loading state */
  isLoading?: boolean;
  /** Active/pressed state */
  isActive?: boolean;
  /** Selected state for toggle buttons */
  isSelected?: boolean;
  /** Stretches button to full width */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Custom loading indicator */
  loadingIndicator?: React.ReactNode;
  /** Loading text */
  loadingText?: string;
  /** Disables button and shows loading state */
  isLoadingSubmit?: boolean;
  /** Badge/counter value */
  badge?: string | number;
  /** Badge color */
  badgeColor?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Whether button opens in a new tab (adds icon automatically) */
  isExternal?: boolean;
  /** Visual elevation level (0-3) */
  elevation?: 0 | 1 | 2 | 3;
  /** Makes button take only necessary width */
  compact?: boolean;
  /** Has dropdown menu */
  hasDropdown?: boolean;
  /** Visual-only disabled state (keeps events) */
  visuallyDisabled?: boolean;
  /** Button state */
  state?: ButtonState;
  /** Has success checkmark animation */
  showSuccessAnimation?: boolean;
  /** Gradient colors (for gradient variant) */
  gradientFrom?: string;
  /** Gradient colors (for gradient variant) */
  gradientTo?: string;
  /** Gradient direction (for gradient variant) */
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  /** Maximum width in pixels */
  maxWidth?: number;
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    shape = 'default',
    animation = 'none',
    isLoading = false,
    isLoadingSubmit = false,
    isActive = false,
    isSelected = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    loadingIndicator,
    loadingText,
    badge,
    badgeColor,
    tooltip,
    shortcut,
    isExternal = false,
    elevation = 0,
    compact = false,
    hasDropdown = false,
    visuallyDisabled = false,
    state,
    showSuccessAnimation = false,
    gradientFrom,
    gradientTo,
    gradientDirection = 'to-r',
    maxWidth,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  }, ref) => {
    // Determine if button should be disabled
    const isDisabled = disabled || isLoading || isLoadingSubmit || visuallyDisabled;
    
    // Currently in loading state
    const showLoading = isLoading || isLoadingSubmit;
    
    // Active state (from prop or state)
    const buttonIsActive = isActive || state === 'active';
    
    // Selected state (from prop or state)
    const buttonIsSelected = isSelected || state === 'selected';
    
    // Default loading indicator
    const defaultLoadingIndicator = (
      <Loader2 
        className={cn(
          "animate-spin",
          size === 'xs' ? 'h-3 w-3' : 
          size === 'sm' ? 'h-3.5 w-3.5' : 
          size === 'lg' ? 'h-5 w-5' : 
          size === 'xl' ? 'h-6 w-6' : 
          'h-4 w-4'
        )} 
      />
    );
    
    // Variant classes mapping
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'bg-transparent hover:bg-muted hover:text-foreground',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      warning: 'bg-amber-500 text-white hover:bg-amber-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      info: 'bg-blue-500 text-white hover:bg-blue-600',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
      subtle: 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
      gradient: 'text-white bg-gradient-to-r from-primary to-blue-600 hover:opacity-90',
    };
    
    // Size classes mapping
    const sizeClasses = {
      xs: 'h-7 px-2 text-xs rounded',
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-10 px-4 text-sm rounded-md',
      lg: 'h-12 px-6 text-base rounded-lg',
      xl: 'h-14 px-8 text-lg rounded-lg',
      'icon': 'h-10 w-10 p-0 rounded-md',
      'icon-sm': 'h-8 w-8 p-0 rounded-md',
      'icon-lg': 'h-12 w-12 p-0 rounded-md',
    };
    
    // Shape classes mapping
    const shapeClasses = {
      default: '',
      square: 'rounded-none',
      rounded: 'rounded-md',
      pill: 'rounded-full',
    };
    
    // Animation classes mapping
    const animationClasses = {
      none: '',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      shine: 'relative overflow-hidden [&:after]:absolute [&:after]:inset-0 [&:after]:-translate-x-full [&:after]:animate-shimmer [&:after]:bg-gradient-to-r [&:after]:from-transparent [&:after]:via-white/10 [&:after]:to-transparent',
      scale: 'transition-transform hover:scale-105 active:scale-95',
    };
    
    // Elevation classes
    const elevationClasses = {
      0: '',
      1: 'shadow-sm',
      2: 'shadow-md',
      3: 'shadow-lg',
    };
    
    // Handle dropdown icon
    const dropdownIcon = hasDropdown ? (
      <ChevronDown className={cn('ml-1', size === 'xs' || size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
    ) : null;
    
    // Handle external link icon
    const externalIcon = isExternal ? (
      <ExternalLink className={cn('ml-1', size === 'xs' || size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
    ) : null;
    
    // Handle success animation
    const successIcon = showSuccessAnimation ? (
      <span className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded-md animate-in fade-in duration-300">
        <Check className="h-5 w-5" />
      </span>
    ) : null;
    
    // Handle gradient style
    const gradientStyle = variant === 'gradient' ? {
      backgroundImage: `linear-gradient(${gradientDirection}, ${gradientFrom || 'var(--primary)'}, ${gradientTo || 'rgb(37, 99, 235)'})`,
    } : undefined;
    
    // Combine styles
    const style = {
      ...gradientStyle,
      ...(maxWidth ? { maxWidth: `${maxWidth}px` } : {}),
      ...props.style,
    };
    
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          sizeClasses[size],
          shapeClasses[shape],
          animationClasses[animation],
          elevationClasses[elevation],
          variantClasses[variant],
          {
            'disabled:pointer-events-none disabled:opacity-50': !visuallyDisabled,
            'opacity-50': visuallyDisabled,
            'w-full': fullWidth,
            'w-auto': compact,
            'cursor-default': isLoading,
            'bg-accent': variant === 'outline' && buttonIsActive,
            'bg-muted': variant === 'ghost' && buttonIsActive,
            'bg-primary/90': variant === 'primary' && buttonIsActive,
            'bg-secondary/90': variant === 'secondary' && buttonIsActive,
            'bg-destructive/90': variant === 'danger' && buttonIsActive,
            'bg-muted/90': variant === 'subtle' && buttonIsActive,
            'border-primary': variant === 'outline' && buttonIsSelected,
            'bg-muted/50': variant === 'ghost' && buttonIsSelected,
            'ring-2 ring-primary ring-offset-2': buttonIsSelected && variant !== 'link',
          },
          className
        )}
        disabled={isDisabled && !visuallyDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        data-state={buttonIsActive ? 'active' : buttonIsSelected ? 'selected' : 'default'}
        {...(tooltip && { 'aria-label': tooltip, 'title': tooltip })}
        style={style}
        {...props}
      >
        {showLoading ? (
          <>
            {loadingIndicator || defaultLoadingIndicator}
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span 
                className={cn(
                  'mr-2', 
                  size === 'xs' ? 'h-3 w-3' : 
                  size === 'sm' ? 'h-3.5 w-3.5' : 
                  size === 'lg' || size === 'xl' ? 'h-5 w-5' : 
                  'h-4 w-4'
                )}
              >
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span 
                className={cn(
                  'ml-2', 
                  size === 'xs' ? 'h-3 w-3' : 
                  size === 'sm' ? 'h-3.5 w-3.5' : 
                  size === 'lg' || size === 'xl' ? 'h-5 w-5' : 
                  'h-4 w-4'
                )}
              >
                {rightIcon}
              </span>
            )}
            {externalIcon}
            {dropdownIcon}
            
            {/* Keyboard shortcut */}
            {shortcut && (
              <kbd className="ml-2 inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                {shortcut}
              </kbd>
            )}
            
            {/* Badge */}
            {badge !== undefined && (
              <span 
                className={cn(
                  "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium",
                  badgeColor ? `bg-${badgeColor}-100 text-${badgeColor}-800` : "bg-primary/20 text-primary"
                )}
              >
                {badge}
              </span>
            )}
            
            {successIcon}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

interface ButtonGroupBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<ButtonProps> | React.ReactElement<ButtonProps>[];
  joined?: boolean;
  vertical?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  equalWidth?: boolean;
}

interface ButtonGroupToggleProps {
  isToggleGroup: true;
  value?: string;
  onChange?: (value: string) => void;
}

type ButtonGroupProps = ButtonGroupBaseProps & (ButtonGroupToggleProps | { isToggleGroup?: false });

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({
    children,
    joined = false,
    vertical = false,
    size,
    variant,
    equalWidth = false,
    isToggleGroup = false,
    onChange,
    className,
    ...props
  }, ref) => {
    const childrenWithProps = React.Children.map(children, (child, index) => {
      if (!React.isValidElement<ButtonProps>(child)) return child;
      
      const childProps: Partial<ButtonProps> & {
        style?: React.CSSProperties;
        isSelected?: boolean;
      } = {};
      
      // Apply size and variant if provided
      if (size) childProps.size = size;
      if (variant) childProps.variant = variant;
      
      // Apply equal width
      if (equalWidth) childProps.fullWidth = true;
      
      // Apply joined styling
      if (joined) {
        const baseClass = child.props.className || '';
        const style = child.props.style || {};
        
        if (vertical) {
          // Vertical group styling
          if (index === 0) {
            childProps.className = `${baseClass} rounded-b-none`;
            childProps.style = { ...style, marginBottom: '-1px' };
          } else if (index < React.Children.count(children) - 1) {
            childProps.className = `${baseClass} rounded-none`;
            childProps.style = { ...style, marginBottom: '-1px' };
          } else {
            childProps.className = `${baseClass} rounded-t-none`;
          }
        } else {
          // Horizontal group styling
          if (index === 0) {
            childProps.className = `${baseClass} rounded-r-none`;
            childProps.style = { ...style, marginRight: '-1px' };
          } else if (index < React.Children.count(children) - 1) {
            childProps.className = `${baseClass} rounded-none`;
            childProps.style = { ...style, marginRight: '-1px' };
          } else {
            childProps.className = `${baseClass} rounded-l-none`;
          }
        }
      }
      
// First, define interfaces for the props
interface ToggleItemProps {
  value: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // Add other props your toggle items might have
}

interface ToggleGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  // Add other props your toggle group might have
}

// Then, use type guards to safely access properties
if (isToggleGroup && React.isValidElement(child) && 'value' in child.props) {
  // Now TypeScript knows child.props might have 'value' property
  const childValue = (child.props as ToggleItemProps).value;
  if (typeof childValue !== 'string') {
    console.error('Toggle item value must be a string');
    return child;
  }

  const toggleGroupProps = props as ToggleGroupProps;
  const toggleItemProps = child.props as ToggleItemProps;
  
  childProps.isSelected = childValue === toggleGroupProps.value;
  childProps.onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Safely call the child's onClick if it exists
    if (typeof toggleItemProps.onClick === 'function') {
      toggleItemProps.onClick(e);
    }
    
    // If the event wasn't prevented and we have an onChange handler
    if (!e.defaultPrevented && toggleGroupProps.onChange) {
      toggleGroupProps.onChange(childValue);
    }
  };
}
      
      return React.cloneElement(child, childProps);
    });
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          vertical ? 'flex-col' : 'flex-row',
          joined ? 'gap-0' : 'gap-2',
          className
        )}
        {...props}
      >
        {childrenWithProps}
      </div>
    );
  }
);
ButtonGroup.displayName = 'ButtonGroup';
ButtonGroup.propTypes = {
  // Add PropTypes if needed
};

// ============================================================================
// ICON BUTTON COMPONENT
// ============================================================================

export interface IconButtonProps extends ButtonProps {
  /** The icon to render */
  icon: React.ReactNode;
  /** Accessible label for the button */
  ariaLabel: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    ariaLabel,
    size = 'icon',
    ...props
  }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        aria-label={ariaLabel}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = 'IconButton';

// ============================================================================
// SPLIT BUTTON COMPONENT
// ============================================================================

export interface SplitButtonProps extends ButtonProps {
  /** Main button action */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Split button action */
  onSplitClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Split button icon */
  splitIcon?: React.ReactNode;
}

export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
  ({
    children,
    onClick,
    onSplitClick,
    splitIcon = <ChevronDown className="h-4 w-4" />,
    variant = 'primary',
    size = 'md',
    disabled,
    className,
    ...props
  }, ref) => {
    return (
      <ButtonGroup joined>
        <Button
          ref={ref}
          variant={variant}
          size={size}
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'rounded-r-none',
            className
          )}
          {...props}
        >
          {children}
        </Button>
        <Button
          variant={variant}
          size={size}
          onClick={onSplitClick}
          disabled={disabled}
          className="rounded-l-none border-l-2 border-l-primary-foreground/20 px-2"
        >
          {splitIcon}
        </Button>
      </ButtonGroup>
    );
  }
);
SplitButton.displayName = 'SplitButton';

// ============================================================================
// SPECIALIZED BUTTON VARIANTS
// ============================================================================

interface SocialButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Social network */
  network: 'google' | 'facebook' | 'twitter' | 'github' | 'discord' | 'linkedin';
  /** Override default icon */
  icon?: React.ReactNode;
  /** Show only icon */
  iconOnly?: boolean;
}

export const SocialButton = React.forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({
    network,
    icon,
    iconOnly = false,
    children,
    ...props
  }, ref) => {
    const networkConfig: Record<string, { bg: string, text: string, hoverBg: string, defaultIcon: React.ReactNode }> = {
      google: {
        bg: 'bg-white',
        text: 'text-gray-800',
        hoverBg: 'hover:bg-gray-50',
        defaultIcon: (
          <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        ),
      },
      facebook: {
        bg: 'bg-[#1877F2]',
        text: 'text-white',
        hoverBg: 'hover:bg-[#166FE5]',
        defaultIcon: (
          <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        ),
      },
      twitter: {
        bg: 'bg-[#1DA1F2]',
        text: 'text-white',
        hoverBg: 'hover:bg-[#0D8FE0]',
        defaultIcon: (
          <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        ),
      },
      github: {
        bg: 'bg-[#24292F]',
        text: 'text-white',
        hoverBg: 'hover:bg-[#1D2328]',
        defaultIcon: (
          <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        ),
      },
      discord: {
        bg: 'bg-[#5865F2]',
        text: 'text-white',
        hoverBg: 'hover:bg-[#4A54D3]',
        defaultIcon: (
          <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
        ),
      },
      linkedin: {
        bg: 'bg-[#0A66C2]',
        text: 'text-white',
        hoverBg: 'hover:bg-[#0958A7]',
        defaultIcon: (
          <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z" clipRule="evenodd" />
          </svg>
        ),
      },
    };
    
    const network_config = networkConfig[network];
    
    const label = iconOnly ? 
      `Sign in with ${network.charAt(0).toUpperCase() + network.slice(1)}` :
      children || `Sign in with ${network.charAt(0).toUpperCase() + network.slice(1)}`;
    
    return (
      <Button
        ref={ref}
        className={cn(
          network_config.bg,
          network_config.text,
          network_config.hoverBg,
          "border border-gray-300",
          iconOnly && "px-0",
          props.className
        )}
        leftIcon={icon || network_config.defaultIcon}
        aria-label={`Sign in with ${network.charAt(0).toUpperCase() + network.slice(1)}`}
        {...props}
      >
        {iconOnly ? null : label}
      </Button>
    );
  }
);
SocialButton.displayName = 'SocialButton';