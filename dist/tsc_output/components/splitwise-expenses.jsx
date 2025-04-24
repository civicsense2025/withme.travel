"use client";
import { RefreshCw, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
// Refactor component to be presentational
export function SplitwiseExpenses({ expenses, isLoading, error, groupId, lastUpdated, onRefresh }) {
    // Remove internal state management (useState, useEffect, fetchExpenses)
    const renderCardFooter = () => (<CardFooter className="text-xs text-muted-foreground justify-between items-center pt-4 border-t">
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3"/>
        {lastUpdated ? `Last updated: ${formatRelativeTime(lastUpdated)}` : "Not updated yet"}
      </span>
      {/* Use onRefresh prop for the button */}
      <Button variant="ghost" size="sm" onClick={() => onRefresh(false)} className="gap-1">
        <RefreshCw className={`h-3 w-3 ${isLoading && !error ? 'animate-spin' : ''}`}/>
        Refresh
      </Button>
    </CardFooter>);
    // Check props for rendering decisions
    if (!isLoading && !error && !groupId) {
        // This case should ideally be handled by the parent, 
        // but returning null is safe if the parent might still render it.
        return null;
    }
    if (isLoading) {
        return (
        // Simplified loading state within the Tab content
        <div className="py-6 flex justify-center items-center text-muted-foreground">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
        Loading Splitwise expenses...
          </div>);
    }
    if (error) {
        return (
        // Simplified error state within the Tab content
        <div className="p-4 border rounded-md bg-muted">
        <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {renderCardFooter()}
      </div>);
    }
    if (expenses.length === 0) {
        return (
        // Simplified empty state within the Tab content
        <div className="p-4 border rounded-md bg-muted">
          <div className="text-center py-6 text-muted-foreground">
            <p>No expenses found in your linked Splitwise group.</p>
            <p className="text-sm mt-2">
              Add expenses in Splitwise and they'll appear here automatically.
            </p>
          </div>
          {renderCardFooter()}
      </div>);
    }
    // Calculations remain the same
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
    }, {});
    // Render the content directly, without the outer Card
    return (<div className="space-y-4 p-4 border rounded-md bg-muted">
      {/* Summary Section */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Splitwise Summary</h3>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div>
            <p className="text-muted-foreground">Total spent</p>
            <p className="font-semibold">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
            <p className="text-muted-foreground">Number of expenses</p>
            <p className="font-semibold">{expenses.length}</p>
            </div>
          </div>
        </div>

      {/* Category Section - simplified */}
      {Object.keys(expensesByCategory).length > 0 && (<div className="mb-4">
          <h3 className="text-md font-medium mb-2">By Category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (<Badge key={category} variant="secondary">
                {category}: {formatCurrency(amount)}
              </Badge>))}
          </div>
        </div>)}

      {/* Recent Expenses Table */}
        <div>
        <h3 className="text-md font-medium mb-2">Recent Splitwise Expenses</h3>
        <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {expenses.slice(0, 5).map((expense) => ( // Show top 5 recent
        <TableRow key={expense.id}>
                <TableCell className="font-medium">
                      {expense.description}
                  <Badge variant="outline" className="ml-2 text-xs">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        {groupId && (<div className="text-center mt-2">
             <Button variant="outline" size="sm" asChild>
                <a href={`https://secure.splitwise.com/#/groups/${groupId}`} target="_blank" rel="noopener noreferrer" className="gap-1">
                  View all in Splitwise <ExternalLink className="h-3 w-3"/>
                </a>
            </Button>
          </div>)}
        </div>
      {renderCardFooter()}
    </div>);
}
