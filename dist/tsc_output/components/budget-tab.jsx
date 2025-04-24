"use client";
import { useState, useEffect, useMemo } from "react";
import { PlusCircle, DollarSign, Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, formatError } from "@/lib/utils";
import { BUDGET_CATEGORIES, DB_TABLES, DB_FIELDS } from "@/utils/constants";
import { limitItems } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
export function BudgetTab({ tripId, canEdit = false, isTripOver = false, initialSplitwiseExpenses, initialManualExpenses, splitwiseGroupId }) {
    const { supabase } = useAuth();
    const [manualExpenses, setManualExpenses] = useState(initialManualExpenses);
    const [members, setMembers] = useState([]);
    const [totalBudget, setTotalBudget] = useState(0);
    const { toast } = useToast();
    const splitwiseExpenses = initialSplitwiseExpenses;
    const isTripLinked = splitwiseGroupId !== null;
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        paidById: "",
    });
    const loading = false;
    useEffect(() => {
        async function loadMembers() {
            try {
                if (!supabase) {
                    console.warn("Supabase client not available in useEffect yet.");
                    return;
                }
                const { data, error } = await supabase
                    .from(DB_TABLES.TRIP_MEMBERS)
                    .select(`user_id, profiles!inner(name)`)
                    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId);
                if (error)
                    throw error;
                setMembers((data === null || data === void 0 ? void 0 : data.map((member) => {
                    var _a;
                    return ({
                        id: member.user_id,
                        name: ((_a = member.profiles) === null || _a === void 0 ? void 0 : _a.name) || "Unknown User",
                    });
                })) || []);
                setTotalBudget(5000);
            }
            catch (error) {
                console.error("Failed to load members for budget tab:", error);
                toast({ title: "Error", description: formatError(error, "Failed to load member names"), variant: "destructive" });
            }
        }
        loadMembers();
    }, [tripId, toast, supabase]);
    // --- Create Combined Expense List --- 
    const combinedExpenses = useMemo(() => {
        const mappedManual = manualExpenses.map(exp => {
            var _a;
            return ({
                id: exp.id,
                title: exp.title,
                amount: Number(exp.amount), // Ensure amount is number
                currency: "USD", // Assume USD for manual expenses
                category: exp.category,
                date: exp.date, // Assuming date is already ISO string
                paidBy: ((_a = members.find(m => m.id === exp.paid_by)) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
                source: 'manual',
            });
        });
        const mappedSplitwise = splitwiseExpenses.map(exp => ({
            id: exp.id,
            title: exp.description, // Use description field from Splitwise
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            date: exp.date, // Assuming date is ISO string
            paidBy: exp.paidBy, // Use pre-formatted name from Splitwise data
            source: 'splitwise',
        }));
        // Combine and sort by date (newest first)
        return [...mappedManual, ...mappedSplitwise].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [manualExpenses, splitwiseExpenses, members]);
    // --- Calculate Combined Totals (using combined list length if needed) --- 
    const manualTotalSpent = manualExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const splitwiseTotalSpent = splitwiseExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalSpent = manualTotalSpent + splitwiseTotalSpent;
    const remainingBudget = totalBudget - totalSpent;
    const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const handleAddExpense = async () => {
        var _a;
        if (!supabase)
            return toast({ title: "Error", description: "Client not available", variant: "destructive" });
        try {
            if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.paidById) {
                toast({ title: "Missing information", description: "Please fill all fields including Paid By", variant: "destructive" });
                return;
            }
            const expensePayload = {
                title: newExpense.title,
                amount: Number.parseFloat(newExpense.amount),
                category: newExpense.category,
                date: newExpense.date,
                paid_by: newExpense.paidById,
                currency: "USD",
                trip_id: tripId,
            };
            const response = await fetch(`/api/trips/${tripId}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expensePayload),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to add expense");
            }
            const newManualExpense = {
                id: ((_a = result.expense) === null || _a === void 0 ? void 0 : _a.id) || Date.now().toString(),
                trip_id: tripId,
                title: expensePayload.title,
                amount: expensePayload.amount,
                currency: expensePayload.currency,
                category: expensePayload.category,
                paid_by: expensePayload.paid_by,
                date: expensePayload.date,
                created_at: new Date().toISOString(),
                source: 'manual'
            };
            setManualExpenses(prev => [newManualExpense, ...prev]);
            toast({
                title: "Expense Added",
                description: `Expense added successfully locally.`
            });
            setNewExpense({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], paidById: "" });
            setIsAddExpenseOpen(false);
        }
        catch (error) {
            console.error("Failed to add expense:", error);
            toast({ title: "Error", description: formatError(error, "Failed to add expense"), variant: "destructive" });
        }
    };
    const handleSettleUp = () => {
        if (!splitwiseGroupId)
            return;
        window.open(`https://secure.splitwise.com/#/groups/${splitwiseGroupId}/settle`, "_blank");
    };
    if (loading) {
        return <div className="py-8 text-center">Loading budget...</div>;
    }
    return (<div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Trip Finances</CardTitle>
          <CardDescription>Keep track of shared costs and see who owes who (integrates with Splitwise!).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-1 space-y-4 order-2 md:order-1">
            <h3 className="text-lg font-medium border-b pb-2">Budget Snapshot</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Target Budget:</span>
                <span className="font-medium">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Spent:</span>
                <span className="font-medium">{formatCurrency(totalSpent)}</span>
              </div>
               <div className="flex items-center justify-between text-sm">
                <span>Remaining:</span>
                <span className={`font-medium ${remainingBudget < 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(remainingBudget)}
                </span>
              </div>
              <Progress value={percentSpent} className="h-2"/>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full gap-1">
                    <PlusCircle className="h-4 w-4"/>
                    Log an Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Log a New Expense</DialogTitle>
                    <DialogDescription>
                      {isTripLinked
            ? "Adding this straight to your linked Splitwise group. Easy peasy!"
            : "Adding this manually just for this trip (not synced to Splitwise)."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title / Description</Label>
                      <Input id="title" placeholder="Dinner, Souvenirs..." value={newExpense.title} onChange={(e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { title: e.target.value }))}/>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" className="pl-8" value={newExpense.amount} onChange={(e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { amount: e.target.value }))}/>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newExpense.category} onValueChange={(value) => setNewExpense(Object.assign(Object.assign({}, newExpense), { category: value }))}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select category"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BUDGET_CATEGORIES.ACCOMMODATION}>Accommodation</SelectItem>
                          <SelectItem value={BUDGET_CATEGORIES.TRANSPORTATION}>Transportation</SelectItem>
                          <SelectItem value={BUDGET_CATEGORIES.FOOD}>Food & Dining</SelectItem>
                          <SelectItem value={BUDGET_CATEGORIES.ACTIVITIES}>Activities</SelectItem>
                          <SelectItem value={BUDGET_CATEGORIES.SHOPPING}>Shopping</SelectItem>
                          <SelectItem value={BUDGET_CATEGORIES.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={newExpense.date} onChange={(e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { date: e.target.value }))}/>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paidById">Paid By</Label>
                      <Select value={newExpense.paidById} onValueChange={(value) => setNewExpense(Object.assign(Object.assign({}, newExpense), { paidById: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select person"/></SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (<SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddExpense}>Add Expense</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {isTripLinked && (<Button variant="outline" size="sm" className="w-full gap-1" disabled={!isTripOver || !splitwiseGroupId} onClick={handleSettleUp}>
                  <Wallet2 className="h-4 w-4"/>
                  Settle Up in Splitwise
                </Button>)}
            </div>
          </div>

          {/* --- Column 2: Expense List --- */}
          <div className="md:col-span-2 order-1 md:order-2 mb-6 md:mb-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Expense Log</h3>
              <Badge variant="outline" className="ml-2">{combinedExpenses.length} expenses</Badge>
            </div>
             {combinedExpenses.length > 0 ? (<div className="space-y-2 max-h-[350px] md:max-h-[400px] overflow-y-auto pr-2 border rounded-md p-2 bg-muted/20">
                 {limitItems(combinedExpenses, 15).items.map((expense) => (<div key={`${expense.source}-${expense.id}`} className="flex justify-between items-center p-3 rounded-md border bg-card hover:bg-card/90 transition-colors">
                     <div className="flex-1 pr-2">
                       <div className="font-medium flex items-center gap-2">
                         {expense.title} 
                         {expense.source === 'splitwise' && (<Badge variant="outline" className="text-xs font-normal">Splitwise</Badge>)}
                       </div>
                       <div className="text-xs text-muted-foreground">
                         <span>{expense.category}</span>
                         <span> • </span>
                         <span>{formatDate(expense.date)}</span>
                         <span> • </span>
                         <span>Paid by {expense.paidBy}</span> 
                       </div>
                     </div>
                     <p className="font-bold">{formatCurrency(expense.amount)}</p> 
                   </div>))}
                 {limitItems(combinedExpenses, 15).hasMore && (<div className="text-center pt-2 text-sm text-muted-foreground">
                     And {limitItems(combinedExpenses, 15).hiddenCount} more expenses...
                   </div>)}
               </div>) : (<div className="text-center py-8 text-muted-foreground border rounded-md">
                 <DollarSign className="mx-auto h-12 w-12 opacity-20 mb-2"/>
                 <p>No expenses logged yet. Add one above!</p>
               </div>)}
          </div>
          {/* --- End Column 2 --- */}
        </CardContent>
      </Card>
      {/* End of Trip Budget Card */}
    </div>);
}
