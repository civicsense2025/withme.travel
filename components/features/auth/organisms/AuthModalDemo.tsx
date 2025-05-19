'use client';

import { useAuthModal } from '@/app/context/auth-modal-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { AuthModalContext, ABTestVariant } from '@/app/context/auth-modal-context';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthModalDemo() {
  const { open, setABTestVariant, abTestVariant } = useAuthModal();
  const { toast } = useToast();
  const [selectedContext, setSelectedContext] = useState<AuthModalContext>('default');

  // Array of all available contexts
  const contexts: AuthModalContext[] = [
    'default',
    'join-group',
    'create-group',
    'save-trip',
    'like-trip',
    'comment',
    'edit-trip',
    'invite-friends',
    'premium-feature',
    'vote-on-idea',
    'create-itinerary',
    'add-to-itinerary',
  ];

  // A/B testing variants
  const variants: ABTestVariant[] = ['control', 'variant-a', 'variant-b'];

  // Function to handle opening the modal with the selected context
  const handleOpenModal = () => {
    open(selectedContext);
    toast({
      title: 'Auth Modal Opened',
      description: `Context: ${selectedContext}, Variant: ${abTestVariant}`,
    });
  };

  // Function to handle changing the A/B test variant
  const handleVariantChange = (variant: ABTestVariant) => {
    setABTestVariant(variant);
    toast({
      title: 'A/B Test Variant Changed',
      description: `Now using: ${variant}`,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Auth Modal Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="context" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="context">Context Testing</TabsTrigger>
            <TabsTrigger value="ab">A/B Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="context" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="context-select" className="text-sm font-medium">
                  Select Auth Context
                </label>
                <Select
                  value={selectedContext}
                  onValueChange={(value) => setSelectedContext(value as AuthModalContext)}
                >
                  <SelectTrigger id="context-select">
                    <SelectValue>Select a context</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {contexts.map((context) => (
                      <SelectItem key={context} value={context}>
                        {context}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleOpenModal} className="w-full lowercase">
                open auth modal with {selectedContext} context
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ab" className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">
                Current A/B Test Variant: <span className="font-bold">{abTestVariant}</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {variants.map((variant) => (
                  <Button
                    key={variant}
                    onClick={() => handleVariantChange(variant)}
                    variant={abTestVariant === variant ? 'default' : 'outline'}
                    className="w-full lowercase"
                  >
                    {variant}
                  </Button>
                ))}
              </div>

              <div className="pt-4">
                <Button onClick={handleOpenModal} className="w-full lowercase">
                  test current variant
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-sm text-muted-foreground">
          <p>
            You can test different contexts and A/B test variants to see how the auth modal adapts
            to each situation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 