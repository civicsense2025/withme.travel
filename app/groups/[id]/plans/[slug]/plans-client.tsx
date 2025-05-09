import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plan } from '../../types/plan';

const PlansClient: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.id as string;
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