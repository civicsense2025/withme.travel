'use client';

import React from 'react';
import { CreditCard, DollarSign, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Marketing section that showcases expense tracking features
 */
export function ExpenseMarketingSection() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto bg-muted/30">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Track expenses together</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Split costs, track who paid what, and make sure everyone gets reimb-rsed fairly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-background p-6 rounded-lg shadow-sm">
          <DollarSign className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy cost sharing</h3>
          <p className="text-muted-foreground">
            Enter expenses as you go and see who owes what in real-time.
          </p>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-sm">
          <Receipt className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Multiple currencies</h3>
          <p className="text-muted-foreground">
            Track expenses in any currency with automatic conversion.
          </p>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-sm">
          <CreditCard className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Expense categories</h3>
          <p className="text-muted-foreground">
            Organize and visualize spending across different categories.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Button size="lg">
          Start tracking expenses
        </Button>
      </div>
    </section>
  );
}

export default ExpenseMarketingSection; 