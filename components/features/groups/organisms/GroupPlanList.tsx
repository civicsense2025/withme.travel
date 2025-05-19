import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Wine, 
  Map, 
  Calendar, 
  ThumbsUp, 
  ChevronRight 
} from 'lucide-react';

export interface GroupPlan {
  id: string;
  title: string;
  status: string;
  icon: string;
  votes: number;
}

export interface GroupPlanListProps {
  plans: GroupPlan[];
  onVote: (id: string) => void;
  onClick: (id: string) => void;
}

export function GroupPlanList({ plans, onVote, onClick }: GroupPlanListProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'food':
        return <Utensils className="h-5 w-5" />;
      case 'wine':
        return <Wine className="h-5 w-5" />;
      case 'map':
        return <Map className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Group Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {plans.map((plan) => (
            <li 
              key={plan.id} 
              className="flex items-center justify-between p-4 border rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-3" onClick={() => onClick(plan.id)}>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100">
                  {getIcon(plan.icon)}
                </div>
                <div>
                  <p className="font-medium">{plan.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(plan.status)}
                    <span className="text-sm text-muted-foreground flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" /> {plan.votes} votes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(plan.id);
                  }}
                  title="Vote for this plan"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Vote
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClick(plan.id)}
                  title="View details"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 