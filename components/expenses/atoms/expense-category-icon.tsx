/**
 * Expense Category Icon
 * 
 * Displays the appropriate icon for an expense category.
 */
import { 
  Utensils, 
  Train, 
  Bed, 
  Ticket, 
  ShoppingBag, 
  Home,
  Plane,
  Bus,
  Car,
  Coffee,
  Music,
  Wine,
  DollarSign,
  Activity,
  Gift,
  Globe
} from 'lucide-react';
import { ENUMS } from '@/utils/constants/status';

export interface ExpenseCategoryIconProps {
  /**
   * The expense category to display an icon for
   */
  category: string;
  /**
   * Optional CSS class to apply to the icon
   */
  className?: string;
  /**
   * Size of the icon in pixels
   */
  size?: number;
}

/**
 * Returns the appropriate icon for a given expense category
 */
export function ExpenseCategoryIcon({ 
  category, 
  className = '', 
  size = 16 
}: ExpenseCategoryIconProps) {
  // Map categories to their respective icons
  switch (category) {
    case ENUMS.BUDGET_CATEGORY.FOOD:
      return <Utensils className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.TRANSPORTATION:
      return <Train className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.ACCOMMODATION:
      return <Bed className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.ENTERTAINMENT:
      return <Ticket className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.ACTIVITIES:
      return <Activity className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.GIFTS:
      return <Gift className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.TRAVEL:
      return <Globe className={className} size={size} />;
    case ENUMS.BUDGET_CATEGORY.OTHER:
    default:
      return <DollarSign className={className} size={size} />;
  }
} 