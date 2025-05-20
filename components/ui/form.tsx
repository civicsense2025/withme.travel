'use client';

import { useForm as useReactHookForm, FormProvider, Validate, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import React, { createContext, useContext, useId } from 'react';

export type ValidationFn = (value: any) => string | null | undefined | Promise<string | null | undefined>;

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError' | 'onChange'> {
  children: React.ReactNode;
  defaultValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
  onChange?: (values: Record<string, any>) => void;
  id?: string;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  resetOnSubmit?: boolean;
}

export const Form = ({
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
}: FormProps) => {
  const generatedId = useId();
  const formId = id || `form-${generatedId}`;

  const methods = useReactHookForm({
    defaultValues,
    mode,
    shouldUnregister: true,
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
        if (resetOnSubmit) {
          methods.reset();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  const contextValue = {
    // ... existing form context types ...
  };

  return (
    <FormProvider {...methods}>
      <form
        id={formId}
        className={cn('space-y-4', className)}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        <FormContext.Provider value={contextValue as any}>
          {children}
        </FormContext.Provider>
      </form>
    </FormProvider>
  );
};

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
}

export interface FormFieldProps {
  name: string;
  label?: React.ReactNode;
  required?: boolean | string;
  validate?: ValidationFn | ValidationFn[];
  children: (field: {
    id: string;
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string | null;
    required?: boolean;
    disabled?: boolean;
  }) => React.ReactNode;
  description?: React.ReactNode;
  defaultValue?: any;
  disabled?: boolean;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
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
  containerProps,
}: FormFieldProps) {
  const fieldId = React.useId();
  const { register, formState: { errors } } = useReactHookForm();
  const { field, error } = {
    field: register(name, {
      validate: validate as Validate<any, FieldValues>,
      value: defaultValue,
      disabled,
    }),
    error: errors[name]?.message as string | null,
  };

  return (
    <div className={cn('space-y-1', containerProps?.className)} {...containerProps}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <div className="[&:has(:disabled)]:opacity-50 [&:has(:disabled)]:cursor-not-allowed">
        {children({
          id: fieldId,
          name: name,
          value: defaultValue ?? '',
          onChange: (e: React.ChangeEvent<HTMLInputElement> | any) => {
            const value = e?.target?.value ?? e;
            field.onChange(value);
          },
          onBlur: (e: React.FocusEvent<HTMLInputElement>) => field.onBlur(e),
          error,
          required: !!required,
          disabled: !!disabled,
        })}
      </div>
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export interface FormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  loadingIndicator?: React.ReactNode;
}

export function FormSubmit({
  children,
  className,
  disabled,
  loadingText,
  loadingIndicator,
  ...props
}: FormSubmitProps) {
  const { formState: { isSubmitting } } = useReactHookForm();
  
  return (
    <button
      type="submit"
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
        'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting && loadingIndicator ? (
        loadingIndicator
      ) : isSubmitting && loadingText ? (
        loadingText
      ) : (
        children
      )}
    </button>
  );
}

const FormContext = createContext(null);

