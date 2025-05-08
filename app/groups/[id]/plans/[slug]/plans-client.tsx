import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Plan } from '../../types/plan';

const PlansClient: React.FC = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);

  // Navigate to a plan's ideas
  const handlePlanClick = (plan: Plan) => {
    router.push(`/groups/${groupId}/plans/${plan.slug}`);
  };

  return (
    <div>
      {/* Render your plans component here */}
    </div>
  );
};

export default PlansClient; 