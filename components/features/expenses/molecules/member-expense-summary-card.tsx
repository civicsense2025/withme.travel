/**
 * Member Expense Summary Card
 * 
 * Displays a summary of expenses for a trip member, including
 * the total amount paid, their share, and their balance.
 */
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExpenseAmount } from '../atoms/expense-amount';

export interface MemberExpenseSummaryProps {
  /**
   * Member's name
   */
  name: string;
  /**
   * Member's ID
   */
  id: string;
  /**
   * URL to member's avatar image
   */
  avatar?: string | null;
  /**
   * Total amount the member has paid
   */
  paid: number;
  /**
   * Member's share of all expenses
   */
  share: number;
  /**
   * Member's balance (positive means others owe this member)
   */
  balance: number;
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * Whether to use a compact layout
   */
  compact?: boolean;
  /**
   * Callback for clicking on the card
   */
  onClick?: () => void;
}

/**
 * Displays an individual member's expense summary including amounts paid and owed
 */
export function MemberExpenseSummaryCard({
  name,
  id,
  avatar,
  paid,
  share,
  balance,
  className = '',
  compact = false,
  onClick
}: MemberExpenseSummaryProps) {
  // Get first initial for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Card 
      className={`${className} ${compact ? 'p-0' : ''} ${onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
            <AvatarImage src={avatar || ''} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className={`font-medium ${compact ? 'text-sm' : ''}`}>{name}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Paid</div>
            <ExpenseAmount 
              amount={paid} 
              className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}
            />
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-1">Share</div>
            <ExpenseAmount 
              amount={share} 
              className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}
            />
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-1">Balance</div>
            <ExpenseAmount 
              amount={balance} 
              className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}
              isBalance={true}
              showPositiveSign={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 