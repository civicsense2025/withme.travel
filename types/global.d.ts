/// <reference types="next" />
/// <reference types="next/types/global" />

// Path alias declarations
// More specific module declarations instead of catch-all 'any' exports
declare module '@/lib/utils' {
  export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]): string;
  export function formatDate(date: Date | string | number): string;
  export function createUrl(pathname: string, params: Record<string, string | string[] | undefined>): string;
}

declare module '@/lib/auth/supabase' {
  import { SupabaseClient, Session } from '@supabase/supabase-js';
  export function createClient(): SupabaseClient;
  export function getSession(): Promise<Session | null>;
}

declare module '@/utils/constants' {
  export const APP_NAME: string;
  export const BASE_URL: string;
  // Add other constants as needed
}

declare module '@/utils/constants/database' {
  export const TABLES: {
    USERS: string;
    TRIPS: string;
    DESTINATIONS: string;
    // Add other tables as needed
  };
}

// Define fallback modules for other imports
declare module '@/lib/*' {
  const content: unknown;
  export default content;
  export * from content;
}

declare module '@/app/*' {
  const content: unknown;
  export default content;
  export * from content;
}

declare module '@/utils/*' {
  const content: unknown;
  export default content;
  export * from content;
}

// Shadcn UI Components
// Common interfaces for shadcn/ui components
interface VariantProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

interface InputVariantProps {
  size?: 'default' | 'sm' | 'lg';
}

interface CardVariantProps {
  variant?: 'default' | 'outline' | 'shadow';
}

interface SelectVariantProps {
  size?: 'default' | 'sm' | 'lg';
}

// Button component with proper variant and size props
declare module '@/components/ui/button' {
  import * as React from 'react';
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps {
    asChild?: boolean;
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export default Button;
}

declare module '@/components/ui/dialog' {
  import * as React from 'react';
  
  export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }
  
  export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onFocusOutside?: (event: FocusEvent) => void;
    forceMount?: boolean;
  }
  
  export const Dialog: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>>;
  export const DialogContent: React.FC<DialogContentProps>;
  export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export default Dialog;
}

declare module '@/components/ui/form' {
  import * as React from 'react';
  import { ControllerProps, FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
  
  export interface FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  > {
    name: TName;
  }

  export interface FormItemContextValue {
    id: string;
  }
  
  export const Form: <
    TFieldValues extends FieldValues = FieldValues,
    TContext = any
  >(props: {
    children?: React.ReactNode;
    form: UseFormReturn<TFieldValues, TContext>;
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
    className?: string;
  }) => React.ReactElement;
  
  export const FormItem: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
  export const FormControl: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const FormDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export const FormMessage: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  
  export const FormField: <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(
    props: ControllerProps<TFieldValues, TName> & {
      className?: string;
    }
  ) => React.ReactElement;
  
  export const useFormField: () => FormFieldContextValue;
  export default Form;
}

// Input component
declare module '@/components/ui/input' {
  import * as React from 'react';
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, InputVariantProps {}
  export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
  export default Input;
}

// Select component
declare module '@/components/ui/select' {
  import * as React from 'react';
  
  export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, SelectVariantProps {
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    value?: string;
  }
  
  export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement>, SelectVariantProps {}
  
  export const Select: React.FC<React.PropsWithChildren<SelectProps>>;
  export const SelectGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SelectValue: React.FC<React.HTMLAttributes<HTMLSpanElement>>;
  export const SelectTrigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<HTMLDivElement>>;
  export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SelectLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
  export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }>;
  export const SelectSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  export default Select;
}

// Card component
declare module '@/components/ui/card' {
  import * as React from 'react';
  
  export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, CardVariantProps {}
  
  export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
  export const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
  export const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
  export const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
  export const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
  
  export default Card;
}

// Next.js specific types
// This is more restrictive than the previous [elemName: string]: any approach
// It preserves the ability to use custom elements while providing better type safety
declare namespace JSX {
  interface IntrinsicElements {
    // Standard HTML elements are handled by React typings
    // For custom elements or those not covered by React's types:
    'next-image': React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    'next-link': React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    // Fallback for any other elements - use sparingly
    [elemName: string]: { [key: string]: any };
  }
}

// Project-specific types
interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

interface Trip {
  id: string;
  title: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  destination_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  visibility?: string;
  status?: string;
  slug?: string;
}

interface Destination {
  id: string;
  name: string;
  country?: string;
  description?: string;
  image_url?: string;
  slug?: string;
}

// Database types for Supabase
declare namespace Database {
  interface Tables {
    users: User;
    trips: Trip;
    destinations: Destination;
    // Add more tables as needed
  }
}