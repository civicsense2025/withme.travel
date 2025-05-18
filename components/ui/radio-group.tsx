/**
 * RadioGroup (Molecule)
 *
 * A themeable, accessible radio group component with group, item, and label.
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}
export function RadioGroup({
  name,
  value,
  onChange,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              name,
              checked: value === child.props.value,
              onChange: () => onChange(child.props.value),
            })
          : child
      )}
    </div>
  );
}

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label?: string;
}
export function RadioGroupItem({
  value,
  label,
  checked,
  onChange,
  className,
  ...props
}: RadioGroupItemProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', className)}>
      <input type="radio" value={value} checked={checked} onChange={onChange} {...props} />
      {label && <span>{label}</span>}
    </label>
  );
}

export interface RadioGroupLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
export function RadioGroupLabel({ className, ...props }: RadioGroupLabelProps) {
  return <label className={cn('text-sm font-medium', className)} {...props} />;
}
