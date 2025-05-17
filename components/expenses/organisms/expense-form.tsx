/**
 * Expense Form
 * 
 * Form for adding or editing expenses with validation.
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ENUMS } from '@/utils/constants/status';
import { ExpenseCategoryIcon } from '../atoms/expense-category-icon';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, DollarSign, Calendar, Tag, User } from 'lucide-react';
import { UnifiedExpense } from '@/hooks/use-trip-budget';

// Extended interface for expense form data
export interface ExtendedExpense extends UnifiedExpense {
  description?: string;
  paidById?: string;
}

// Form validation schema
const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.date().optional(),
  description: z.string().optional(),
  paidBy: z.string().optional(),
  currency: z.string().default('USD')
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export interface ExpenseFormProps {
  /**
   * Whether the form is visible
   */
  isOpen: boolean;
  /**
   * Expense to edit (if in edit mode)
   */
  expense?: UnifiedExpense;
  /**
   * Trip members for the paidBy dropdown
   */
  members: Array<{ id: string; name: string }>;
  /**
   * Whether the submission is being processed
   */
  isSubmitting?: boolean;
  /**
   * Function to close the form
   */
  onClose: () => void;
  /**
   * Function to handle form submission
   */
  onSubmit: (data: ExpenseFormValues) => void;
  /**
   * If true, this is for planned expenses
   */
  isPlannedExpense?: boolean;
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * If true, renders without the Dialog wrapper (for use in custom containers)
   */
  noDialogWrapper?: boolean;
}

/**
 * Form component for adding or editing expenses
 */
export function ExpenseForm({
  isOpen,
  expense,
  members,
  isSubmitting = false,
  onClose,
  onSubmit,
  isPlannedExpense = false,
  className = '',
  noDialogWrapper = false
}: ExpenseFormProps) {
  // Initialize form with default values
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: 0,
      category: Object.values(ENUMS.BUDGET_CATEGORY)[0],
      date: new Date(),
      description: '',
      paidBy: '',
      currency: 'USD'
    }
  });

  // Update form values when expense changes
  useEffect(() => {
    if (expense) {
      // Parse date string to Date object
      let expenseDate: Date | undefined;
      if (expense.date) {
        try {
          expenseDate = new Date(expense.date);
          // Check if valid date
          if (isNaN(expenseDate.getTime())) {
            expenseDate = undefined;
          }
        } catch (e) {
          expenseDate = undefined;
        }
      }

      // Reset form with expense values
      form.reset({
        title: expense.title || '',
        amount: expense.amount || 0,
        category: expense.category || Object.values(ENUMS.BUDGET_CATEGORY)[0],
        date: expenseDate,
        description: expense.description || '',
        paidBy: expense.paidById || '',
        currency: expense.currency || 'USD'
      });
    } else {
      // Reset to default values for new expense
      form.reset({
        title: '',
        amount: 0,
        category: Object.values(ENUMS.BUDGET_CATEGORY)[0],
        date: new Date(),
        description: '',
        paidBy: '',
        currency: 'USD'
      });
    }
  }, [expense, form]);

  // Handle form submission
  const handleSubmit = (values: ExpenseFormValues) => {
    onSubmit(values);
  };

  // Get all expense categories from enum
  const categories = Object.values(ENUMS.BUDGET_CATEGORY);

  // Form content
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Dinner at restaurant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center">
                          <ExpenseCategoryIcon
                            category={category}
                            className="mr-2"
                          />
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isPlannedExpense && (
          <FormField
            control={form.control}
            name="paidBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid By</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : expense ? (
              'Update Expense'
            ) : (
              'Add Expense'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // Return form wrapped in dialog
  if (noDialogWrapper) {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[500px] ${className}`}>
        <DialogHeader>
          <DialogTitle>
            {expense
              ? `Edit ${isPlannedExpense ? 'Planned ' : ''}Expense`
              : `Add ${isPlannedExpense ? 'Planned ' : ''}Expense`}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? 'Update the expense details below.'
              : 'Enter the expense details below.'}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
} 