'use client';

/**
 * Form (Molecule)
 *
 * A comprehensive form system with validation, error handling,
 * and accessible form controls.
 *
 * @module ui/molecules
 */
import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & CONTEXT
// ============================================================================

export type ValidationFn = (value: any) => string | null | undefined;

export interface FieldState {
  value: any;
  touched: boolean;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
}

export interface FormState {
  [field: string]: FieldState;
}

export interface FormContextValue {
  state: FormState;
  register: (name: string, options?: RegisterOptions) => {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    name: string;
    id: string;
  };
  setValue: (name: string, value: any, shouldValidate?: boolean) => void;
  getFieldState: (name: string) => FieldState | undefined;
  setError: (name: string, error: string | null) => void;
  clearErrors: (name?: string) => void;
  validate: () => boolean;
  submit: () => Promise<boolean>;
  reset: (values?: Record<string, any>) => void;
  formId: string;
  isSubmitting: boolean;
}

interface RegisterOptions {
  required?: boolean | string;
  disabled?: boolean;
  validate?: ValidationFn | ValidationFn[];
  defaultValue?: any;
  valueAs?: 'string' | 'number' | 'boolean';
  shouldUnregister?: boolean;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

// ============================================================================
// FORM COMPONENT
// ============================================================================

/**
 * Props for the Form component.
 * Extends base form attributes, but uses custom handlers for submission, error, and change events.
 */
export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError' | 'onChange'> {
  /** Child elements */
  children: React.ReactNode;
  /** Default values for form fields */
  defaultValues?: Record<string, any>;
  /** Called with form values when form is submitted successfully */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Called when form submission fails validation */
  onError?: (errors: Record<string, string>) => void;
  /** Called when form values change */
  onChange?: (values: Record<string, any>) => void;
  /** Form ID (auto-generated if not provided) */
  id?: string;
  /** Form mode */
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  /** Whether to reset form after successful submission */
  resetOnSubmit?: boolean;
}

export function Form({
  children,
  className,
  defaultValues = {},
  onSubmit,
  onError,
  onChange,
  id,
  mode = 'onSubmit',
  resetOnSubmit = false,
  ...props
}: FormProps) {
  // Generate unique ID for the form
  const generatedId = useId();
  const formId = id || `form-${generatedId}`;
  
  // Form state
  const [state, setState] = useState<FormState>(() => {
    const initialState: FormState = {};
    
    Object.entries(defaultValues).forEach(([name, value]) => {
      initialState[name] = {
        value,
        touched: false,
      };
    });
    
    return initialState;
  });
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Register a field in the form
  const register = useCallback((name: string, options: RegisterOptions = {}) => {
    const fieldId = `${formId}-${name}`;
    
    // Initialize field if it doesn't exist
    if (!state[name]) {
      const initialValue = options.defaultValue !== undefined
        ? options.defaultValue
        : defaultValues[name] !== undefined
          ? defaultValues[name]
          : '';
      
      setState(prev => ({
        ...prev,
        [name]: {
          value: initialValue,
          touched: false,
          required: options.required !== undefined && options.required !== false,
          disabled: options.disabled,
        },
      }));
    }
    
    // Transform value based on valueAs option
    const transformValue = (value: any) => {
      if (options.valueAs === 'number') {
        return value === '' ? null : Number(value);
      }
      if (options.valueAs === 'boolean') {
        return Boolean(value);
      }
      return value;
    };
    
    // Handle field change
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      
      const transformedValue = transformValue(value);
      
      setState(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          value: transformedValue,
          touched: true,
        },
      }));
      
      // Validate on change if mode is onChange
      if (mode === 'onChange') {
        validateField(name, transformedValue, options);
      }
      
      // Call onChange handler
      if (onChange) {
        const values = Object.entries(state).reduce((acc, [key, fieldState]) => {
          acc[key] = key === name ? transformedValue : fieldState.value;
          return acc;
        }, {} as Record<string, any>);
        
        onChange(values);
      }
    };
    
    // Handle field blur
    const handleBlur = () => {
      setState(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          touched: true,
        },
      }));
      
      // Validate on blur if mode is onBlur
      if (mode === 'onBlur') {
        validateField(name, state[name]?.value, options);
      }
    };
    
    return {
      name,
      id: fieldId,
      value: state[name]?.value ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
    };
  }, [state, formId, defaultValues, mode, onChange]);
  
  // Validate a field
  const validateField = useCallback((
    name: string,
    value: any,
    options: RegisterOptions = {}
  ) => {
    let error: string | null = null;
    
    // Required validation
    if (options.required) {
      const isEmpty = value === undefined || value === null || value === '';
      
      if (isEmpty) {
        error = typeof options.required === 'string'
          ? options.required
          : `${name} is required`;
        
        setState(prev => ({
          ...prev,
          [name]: {
            ...prev[name],
            error,
          },
        }));
        
        return false;
      }
    }
    
    // Custom validation
    if (options.validate) {
      const validators = Array.isArray(options.validate)
        ? options.validate
        : [options.validate];
      
      for (const validator of validators) {
        const result = validator(value);
        
        if (result) {
          error = result;
          break;
        }
      }
    }
    
    // Update field error
    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
    
    return !error;
  }, []);
  
  // Validate all fields
  const validate = useCallback(() => {
    let isValid = true;
    
    Object.entries(state).forEach(([name, fieldState]) => {
      // Find registered field options
      const options: RegisterOptions = {
        required: fieldState.required,
        disabled: fieldState.disabled,
      };
      
      // Validate field
      const fieldValid = validateField(name, fieldState.value, options);
      if (!fieldValid) {
        isValid = false;
      }
    });
    
    return isValid;
  }, [state, validateField]);
  
  // Submit form
  const submit = useCallback(async () => {
    // Validate all fields
    const isValid = validate();
    
    if (!isValid) {
      // Collect errors
      const errors = Object.entries(state).reduce((acc, [name, fieldState]) => {
        if (fieldState.error) {
          acc[name] = fieldState.error;
        }
        return acc;
      }, {} as Record<string, string>);
      
      onError?.(errors);
      return false;
    }
    
    // Collect values
    const values = Object.entries(state).reduce((acc, [name, fieldState]) => {
      acc[name] = fieldState.value;
      return acc;
    }, {} as Record<string, any>);
    
    // Submit form
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(values);
        
        // Reset form if required
        if (resetOnSubmit) {
          reset();
        }
        
        return true;
      } catch (err) {
        console.error('Form submission error:', err);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }
    
    return true;
  }, [state, validate, onSubmit, onError, resetOnSubmit]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit();
  };
  
  // Get field state
  const getFieldState = useCallback((name: string) => {
    return state[name];
  }, [state]);
  
  // Set field value
  const setValue = useCallback((name: string, value: any, shouldValidate = false) => {
    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
      },
    }));
    
    if (shouldValidate) {
      validateField(name, value, {
        required: state[name]?.required,
      });
    }
  }, [state, validateField]);
  
  // Set field error
  const setError = useCallback((name: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
  }, []);
  
  // Clear errors
  const clearErrors = useCallback((name?: string) => {
    if (name) {
      setState(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          error: null,
        },
      }));
    } else {
      setState(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = {
            ...newState[key],
            error: null,
          };
        });
        return newState;
      });
    }
  }, []);
  
  // Reset form
  const reset = useCallback((values?: Record<string, any>) => {
    setState(prev => {
      const newState = { ...prev };
      
      Object.keys(newState).forEach(name => {
        newState[name] = {
          value: values?.[name] !== undefined
            ? values[name]
            : defaultValues[name] !== undefined
              ? defaultValues[name]
              : '',
          touched: false,
          error: null,
          required: newState[name]?.required,
          disabled: newState[name]?.disabled,
        };
      });
      
      return newState;
    });
  }, [defaultValues]);
  
  return (
    <FormContext.Provider
      value={{
        state,
        register,
        setValue,
        getFieldState,
        setError,
        clearErrors,
        validate,
        submit,
        reset,
        formId,
        isSubmitting,
      }}
    >
      <form
        id={formId}
        className={cn('space-y-4', className)}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Hook to use form context
export function useForm() {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  
  return context;
}

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

/**
 * Props for the FormField component.
 * 
 * Note: Does NOT extend React.HTMLAttributes<HTMLDivElement> directly,
 * because the `children` prop is a render function, not a ReactNode.
 * Use `containerProps` to pass div props to the field container.
 */
export interface FormFieldProps {
  /** Field name (unique within the form) */
  name: string;
  /** Field label */
  label?: React.ReactNode;
  /** Whether field is required */
  required?: boolean | string;
  /** Custom validation function */
  validate?: ValidationFn | ValidationFn[];
  /** Children function to render the field */
  children: (field: {
    id: string;
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: () => void;
    error?: string | null;
    required?: boolean;
    disabled?: boolean;
  }) => React.ReactNode;
  /** Field description */
  description?: React.ReactNode;
  /** Default value */
  defaultValue?: any;
  /** Whether field is disabled */
  disabled?: boolean;
}

export function FormField({
  name,
  label,
  required,
  validate,
  children,
  description,
  defaultValue,
  disabled,
  ...containerProps
}: FormFieldProps & { containerProps?: React.HTMLAttributes<HTMLDivElement> }) {
  const { register, getFieldState } = useForm();
  // Register field
  const field = register(name, {
    required,
    validate,
    defaultValue,
    disabled,
  });
  
  // Get field state
  const fieldState = getFieldState(name) || { touched: false, value: '', error: null };
  
  // Determine if error should be shown
  const showError = fieldState.touched && !!fieldState.error;
  return (
    <div className={cn('space-y-1', containerProps?.containerProps?.className)} {...containerProps}>
      {label && (
        <FormLabel htmlFor={field.id} required={!!required}>
          {label}
        </FormLabel>
      )}
      
      <FormControl>
        {children({
          ...field,
          error: fieldState.error,
          required: !!required,
          disabled: !!disabled,
        })}
      </FormControl>
      
      {description && !showError && (
        <FormDescription>{description}</FormDescription>
      )}
      
      {showError && (
        <FormMessage>{fieldState.error}</FormMessage>
      )}
    </div>
  );
}

// ============================================================================
// FORM SUBCOMPONENTS
// ============================================================================

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props} />
  )
);
FormItem.displayName = 'FormItem';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ className, required, children, ...props }: FormLabelProps) {
  return (
    <label
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  );
}

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-1', className)} {...props} />
  )
);
FormControl.displayName = 'FormControl';

export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
);
FormDescription.displayName = 'FormDescription';

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  )
);
FormMessage.displayName = 'FormMessage';

export interface FormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text to display when loading */
  loadingText?: string;
}

export const FormSubmit = React.forwardRef<HTMLButtonElement, FormSubmitProps>(
  ({ className, disabled, children, loadingText, ...props }, ref) => {
    const { isSubmitting } = useForm();
    
    return (
      <button
        ref={ref}
        type="submit"
        className={cn(
          'inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
          'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        disabled={disabled || isSubmitting}
        {...props}
      >
        {isSubmitting && loadingText ? loadingText : children}
      </button>
    );
  }
);
FormSubmit.displayName = 'FormSubmit';