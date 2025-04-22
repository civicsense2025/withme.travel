"use client"

import { useState, useEffect } from "react"
import { PlusCircle, DollarSign, PieChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate, formatError } from "@/lib/utils"
import { type Expense, getExpenses, getExpensesByCategory, getTripMembers, addExpense } from "@/lib/db"
import { BUDGET_CATEGORIES, SPLIT_TYPES } from "@/utils/constants"
import { limitItems } from "@/lib/utils"

interface BudgetTabProps {
  tripId: string
}

export function BudgetTab({ tripId }: BudgetTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<{ name: string; amount: number; color: string }[]>([])
  const [members, setMembers] = useState<{ id: string; name: string }[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    paidBy: "",
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [expensesData, categoriesData, membersData] = await Promise.all([
          getExpenses(tripId),
          getExpensesByCategory(tripId),
          getTripMembers(tripId),
        ])

        setExpenses(expensesData)
        setCategories(categoriesData)

        // Format members for the dropdown
        setMembers(
          membersData.map((member) => ({
            id: member.user_id,
            name: member.user?.name || "Unknown User",
          })),
        )

        // Calculate total spent
        const totalSpent = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0)
        setTotalSpent(totalSpent)

        // For now, hardcode total budget - in a real app you'd get this from the trip data
        setTotalBudget(5000)
      } catch (error) {
        console.error("Failed to load budget data:", error)
        toast({
          title: "Error",
          description: formatError(error, "Failed to load budget data"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tripId, toast])

  const handleAddExpense = async () => {
    try {
      if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.paidBy) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const expenseData = {
        trip_id: tripId,
        title: newExpense.title,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        paid_by: newExpense.paidBy,
      }

      await addExpense(expenseData)

      toast({
        title: "Expense added",
        description: "Your expense has been added successfully",
      })

      // Refresh data
      const [expensesData, categoriesData] = await Promise.all([getExpenses(tripId), getExpensesByCategory(tripId)])

      setExpenses(expensesData)
      setCategories(categoriesData)
      setTotalSpent(expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0))

      // Reset form and close dialog
      setNewExpense({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        paidBy: "",
      })
      setIsAddExpenseOpen(false)
    } catch (error) {
      console.error("Failed to add expense:", error)
      toast({
        title: "Error",
        description: formatError(error, "Failed to add expense"),
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading budget data...</div>
  }

  const remainingBudget = totalBudget - totalSpent
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Trip Budget</CardTitle>
          <CardDescription>Track expenses and manage your budget</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Budget</span>
                <span className="font-bold">{formatCurrency(totalBudget)}</span>
              </div>
              <Progress value={100} className="h-2 bg-primary/20" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spent</span>
                <span className="font-bold">{formatCurrency(totalSpent)}</span>
              </div>
              <Progress value={percentSpent} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span className={`font-bold ${remainingBudget < 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(remainingBudget)}
                </span>
              </div>
              <Progress
                value={remainingBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0}
                className={`h-2 ${remainingBudget < 0 ? "bg-destructive" : "bg-green-500"}`}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
              {categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${category.color}`}
                          style={{ width: `${(category.amount / totalSpent) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>No expenses added yet</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Recent Expenses</h3>
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <PlusCircle className="h-4 w-4" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                      <DialogDescription>Add a new expense to your trip budget</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Hotel payment"
                          value={newExpense.title}
                          onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newExpense.category}
                          onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
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
                        <Input
                          id="date"
                          type="date"
                          value={newExpense.date}
                          onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="paidBy">Paid By</Label>
                        <Select
                          value={newExpense.paidBy}
                          onValueChange={(value) => setNewExpense({ ...newExpense, paidBy: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select person" />
                          </SelectTrigger>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddExpense}>Add Expense</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {expenses.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {limitItems(expenses, 10).items.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{expense.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{expense.date ? formatDate(expense.date) : "No date"}</span>
                          <span>•</span>
                          <span>Paid by {expense.paid_by_user?.name || "Unknown"}</span>
                        </div>
                      </div>
                      <p className="font-bold">{formatCurrency(expense.amount)}</p>
                    </div>
                  ))}
                  {limitItems(expenses, 10).hasMore && (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      And {limitItems(expenses, 10).hiddenCount} more expenses...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  <DollarSign className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>No expenses added yet</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
