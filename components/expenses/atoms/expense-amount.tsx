/**
 * Expense Amount
 * 
 * Displays a formatted currency amount for expenses.
 */

export interface ExpenseAmountProps {
  /**
   * The amount to format
   */
  amount: number | string | null | undefined;
  /**
   * Currency code (ISO 4217)
   */
  currency?: string;
  /**
   * Optional CSS class to apply to the component
   */
  className?: string;
  /**
   * Display positive amounts with a "+" prefix
   */
  showPositiveSign?: boolean;
  /**
   * For balance amounts, highlight positive values as green and negative as red
   */
  isBalance?: boolean;
}

/**
 * Formats a currency amount for display
 */
export function ExpenseAmount({ 
  amount, 
  currency = 'USD', 
  className = '',
  showPositiveSign = false,
  isBalance = false
}: ExpenseAmountProps) {
  // Parse the amount to a number
  let numericAmount: number;
  
  if (amount === null || amount === undefined) {
    return <span className={className}>N/A</span>;
  }

  if (typeof amount === 'string') {
    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount)) {
      return <span className={className}>N/A</span>;
    }
    numericAmount = parsedAmount;
  } else {
    numericAmount = amount;
  }
  
  // Format the currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(numericAmount);
  
  // Apply sign if needed
  const displayValue = showPositiveSign && numericAmount > 0 ? 
    `+${formattedAmount}` : formattedAmount;

  // Apply appropriate color class if this is a balance
  let colorClass = '';
  if (isBalance) {
    if (numericAmount > 0) {
      colorClass = 'text-green-600 dark:text-green-400';
    } else if (numericAmount < 0) {
      colorClass = 'text-red-600 dark:text-red-400';
    }
  }

  return (
    <span className={`${className} ${colorClass}`.trim()}>
      {displayValue}
    </span>
  );
} 