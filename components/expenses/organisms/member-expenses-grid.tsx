/**
 * Member Expenses Grid
 * 
 * Displays a grid of member expense summaries showing who owes whom.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpenseAmount } from '../atoms/expense-amount';
import { MemberExpenseSummaryCard } from '../molecules/member-expense-summary-card';
import { UsersRound, Receipt, CircleDollarSign } from 'lucide-react';

export interface MemberExpense {
  memberId: string;
  name: string;
  avatar?: string | null;
  paid: number;
  share: number;
  balance: number;
}

export interface MemberDebt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

export interface MemberExpensesGridProps {
  /**
   * Array of member expense summaries
   */
  members: MemberExpense[];
  /**
   * Array of debts between members
   */
  debts: MemberDebt[];
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * Default active tab (members or debts)
   */
  defaultTab?: 'members' | 'debts';
  /**
   * If true, renders without the Card wrapper (for use inside CollapsibleSection)
   */
  noCardWrapper?: boolean;
}

/**
 * Displays a grid of member expense summaries and who owes whom
 */
export function MemberExpensesGrid({
  members,
  debts,
  className = '',
  defaultTab = 'members',
  noCardWrapper = false
}: MemberExpensesGridProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Find the selected member
  const selectedMember = members.find(m => m.memberId === selectedMemberId);
  
  // Filter debts for the selected member
  const memberDebts = debts.filter(
    debt => debt.fromMemberId === selectedMemberId || debt.toMemberId === selectedMemberId
  );

  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const handleCloseDialog = () => {
    setSelectedMemberId(null);
  };

  // The main content component
  const content = (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="members" className="flex items-center gap-1">
          <UsersRound className="h-4 w-4" />
          <span>Members</span>
        </TabsTrigger>
        <TabsTrigger value="debts" className="flex items-center gap-1">
          <CircleDollarSign className="h-4 w-4" />
          <span>Settlements</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="members" className="mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member) => (
            <Dialog key={member.memberId} open={selectedMemberId === member.memberId} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <div>
                  <MemberExpenseSummaryCard
                    id={member.memberId}
                    name={member.name}
                    avatar={member.avatar}
                    paid={member.paid}
                    share={member.share}
                    balance={member.balance}
                    onClick={() => handleMemberClick(member.memberId)}
                    compact
                  />
                </div>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Expense Details: {member.name}</DialogTitle>
                </DialogHeader>
                
                <div className="mt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Total Paid</p>
                      <div className="text-xl font-bold">
                        <ExpenseAmount amount={member.paid} />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Equal Share</p>
                      <div className="text-xl font-bold">
                        <ExpenseAmount amount={member.share} />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Settlements</p>
                    {memberDebts.length > 0 ? (
                      <div className="space-y-2">
                        {memberDebts.map((debt, index) => {
                          const isReceiving = debt.toMemberId === member.memberId;
                          const otherMember = isReceiving ? debt.fromMemberName : debt.toMemberName;
                          
                          return (
                            <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/50">
                              <div className="flex items-center">
                                {isReceiving ? (
                                  <span className="text-sm">{otherMember} owes {member.name}</span>
                                ) : (
                                  <span className="text-sm">{member.name} owes {otherMember}</span>
                                )}
                              </div>
                              <ExpenseAmount 
                                amount={debt.amount} 
                                isBalance={true}
                                showPositiveSign={isReceiving}
                                className="font-medium"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No settlements required.</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="debts" className="mt-4">
        {debts.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {debts.map((debt, index) => (
                <Card key={index} className="p-0">
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{debt.fromMemberName} → {debt.toMemberName}</span>
                    </div>
                    <ExpenseAmount 
                      amount={debt.amount} 
                      className="font-medium"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No settlements required</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );

  // Render without card wrapper
  if (noCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  // Render with card wrapper
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Member Expenses</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
} 