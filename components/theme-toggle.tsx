'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  children, 
  asChild,
  ...props 
}) => (
  <div {...props}>{asChild && React.isValidElement(children) ? React.cloneElement(children) : children}</div>
);

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  align = 'center',
  ...props 
}) => (
  <div className="absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-white p-2 shadow-md" {...props}>
    {children}
  </div>
);

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, ...props }) => (
  <button
    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
    {...props}
  >
    {children}
  </button>
);

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 