/**
 * Primary UI Components
 * 
 * This file re-exports all commonly used UI components to simplify imports.
 * Import from '@/components/ui/primary-components' to get a consistent set
 * of UI building blocks.
 */

// Typography
export { Text } from './Text';
export { Heading } from './Heading';

// Interactive elements
export { Button } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

// Layout components
export { FullBleedSection } from './FullBleedSection';

// Form elements
export { Input } from './input';
export { Label } from './label';

// Feedback components
export { Badge } from './badge';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'; 