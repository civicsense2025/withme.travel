'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, PlusCircle, Receipt, CalendarClock, Share2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BudgetTabContentProps {
  tripId: string;
  canEdit: boolean;
  isTripOver: boolean;
  manualExpenses: any[];
  plannedExpenses: number;
  members: any[];
  isLoading: boolean;
}

export function BudgetTabContent({
  tripId,
  canEdit,
  isTripOver,
  manualExpenses,
  plannedExpenses,
  members,
  isLoading,
}: BudgetTabContentProps) {
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [itineraryItem, setItineraryItem] = useState('');
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});

  const resetExpenseForm = () => {
    setExpenseAmount('');
    setDescription('');
    setExpenseCategory('');
    setPaidBy('');
    setSplitType('equal');
    setItineraryItem('');
    setSplitDetails({});
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // This would be replaced with actual API call to save the expense
    const expenseData = {
      amount: parseFloat(expenseAmount),
      description,
      category: expenseCategory,
      paidBy,
      splitType,
      tripId,
      itineraryItem: itineraryItem || undefined,
      splitDetails: splitType === 'custom' ? splitDetails : undefined,
    };

    console.log('Submitting expense data:', expenseData);
    // Implement actual API call here
    
    resetExpenseForm();
    setIsExpenseDialogOpen(false);
  };

  const handleSplitTypeChange = (value: string) => {
    setSplitType(value);
    
    // Initialize split details equally if changing to custom
    if (value === 'custom') {
      const equalSplit = members.reduce<Record<string, number>>((acc, member) => {
        acc[member.id] = parseFloat((100 / members.length).toFixed(2));
        return acc;
      }, {});
      setSplitDetails(equalSplit);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trip Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : ((manualExpenses?.reduce((total, exp) => total + exp.amount, 0) || 0) + (plannedExpenses || 0)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined expenses and estimated costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logged Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (manualExpenses?.reduce((total, exp) => total + exp.amount, 0) || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {manualExpenses?.length || 0} expenses logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Costs</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (plannedExpenses || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From itinerary items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Expenses</h3>
          {canEdit && (
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger>
                <Button className="gap-1">
                  <Receipt className="h-4 w-4" />
                  Log Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Log a new expense for your trip. Fill out the details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            $
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-7"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        className="col-span-3"
                        placeholder="What was this expense for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <div className="col-span-3">
                        <Select value={expenseCategory} onValueChange={setExpenseCategory} required>
                          <SelectTrigger>
                            <SelectValue>Select category</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="food">Food & Drinks</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="activities">Activities</SelectItem>
                            <SelectItem value="shopping">Shopping</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="paidby" className="text-right">
                        Paid By
                      </Label>
                      <div className="col-span-3">
                        <Select value={paidBy} onValueChange={setPaidBy} required>
                          <SelectTrigger>
                            <SelectValue>Who paid?</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name || member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="splitType" className="text-right">
                        Split
                      </Label>
                      <div className="col-span-3">
                        <Select value={splitType} onValueChange={handleSplitTypeChange}>
                          <SelectTrigger>
                            <SelectValue>
                              {splitType === 'equal' ? 'Equal Split' : 
                               splitType === 'custom' ? 'Custom Split' : 
                               splitType === 'individual' ? 'No Split (Individual)' : ''}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equal">Equal Split</SelectItem>
                            <SelectItem value="custom">Custom Split</SelectItem>
                            <SelectItem value="individual">No Split (Individual)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="itineraryItem" className="text-right">
                        Itinerary Item
                      </Label>
                      <div className="col-span-3">
                        <Select value={itineraryItem} onValueChange={setItineraryItem}>
                          <SelectTrigger>
                            <SelectValue>Select an itinerary item</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {/* This would be populated with actual itinerary items */}
                            <SelectItem value="item-1">Flight to Destination</SelectItem>
                            <SelectItem value="item-2">Hotel Stay</SelectItem>
                            <SelectItem value="item-3">Museum Visit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {splitType === 'custom' && (
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Split Details</Label>
                        <div className="col-span-3 space-y-2">
                          {members.map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                              <span className="w-24 truncate">
                                {member.name || member.email}:
                              </span>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={splitDetails[member.id] || 0}
                                onChange={(e) => {
                                  setSplitDetails((prev) => ({
                                    ...prev,
                                    [member.id]: parseFloat(e.target.value),
                                  }));
                                }}
                              />
                              <span>%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Expense</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Expenses</TabsTrigger>
            <TabsTrigger value="my">My Expenses</TabsTrigger>
            <TabsTrigger value="owe">I Owe</TabsTrigger>
            <TabsTrigger value="owed">Owed to Me</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-2">
            {/* Expenses list would go here */}
            <Card>
              <CardContent className="p-6">
                {manualExpenses && manualExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {manualExpenses.map((expense, i) => (
                      <div key={i} className="flex justify-between items-start py-2">
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <div className="text-sm text-muted-foreground">
                            Paid by {expense.paidBy || 'Unknown'}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {expense.category || 'Other'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${expense.amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {expense.date
                              ? new Date(expense.date).toLocaleDateString()
                              : 'No date'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No expenses have been logged yet.</p>
                    {canEdit && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsExpenseDialogOpen(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add First Expense
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="my" className="mt-2">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground py-8">
                Your expenses will appear here
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="owe" className="mt-2">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground py-8">
                Expenses you owe others will appear here
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="owed" className="mt-2">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground py-8">
                Expenses others owe you will appear here
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 