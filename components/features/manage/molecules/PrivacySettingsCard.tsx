/**
 * Privacy Settings Card (Molecule)
 *
 * A card component that displays and allows editing of privacy settings
 * for an entity (trip, group, etc).
 *
 * @module manage/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { EntityPrivacyBadge, PrivacyLevel } from '../atoms/entity-privacy-badge';
import { Globe, Lock, Eye, Users } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface PrivacyOption {
  value: PrivacyLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface PrivacySettingsCardProps {
  /** Currently selected privacy level */
  value: PrivacyLevel;
  /** Handler for when privacy level changes */
  onChange: (value: PrivacyLevel) => void;
  /** Available privacy options to show */
  options?: PrivacyOption[];
  /** Whether the settings are in a loading state */
  isLoading?: boolean;
  /** Whether the settings are in a disabled state */
  disabled?: boolean;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// DEFAULT PRIVACY OPTIONS
// ============================================================================

const DEFAULT_PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can find and view this content.',
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    description: 'Anyone with the link can view this content.',
    icon: <Eye className="h-4 w-4" />,
  },
  {
    value: 'members-only',
    label: 'Members Only',
    description: 'Only members can view this content.',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can view this content.',
    icon: <Lock className="h-4 w-4" />,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PrivacySettingsCard({
  value,
  onChange,
  options = DEFAULT_PRIVACY_OPTIONS,
  isLoading = false,
  disabled = false,
  title = 'Privacy Settings',
  description = 'Control who can see and access this content.',
  className,
}: PrivacySettingsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <EntityPrivacyBadge privacy={value} size="md" />
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={onChange as (value: string) => void}
          disabled={isLoading || disabled}
          className="space-y-3"
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                'flex items-start space-x-3 rounded-md border p-3',
                value === option.value && 'border-primary bg-primary/5'
              )}
            >
              <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center">
                  <span className="mr-2">{option.icon}</span>
                  <Label htmlFor={option.value} className="font-medium">
                    {option.label}
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
