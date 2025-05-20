'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PlansNavigationProps {
  groupId: string;
  groupName: string;
  planName?: string;
}

export default function PlansNavigation({ groupId, groupName, planName }: PlansNavigationProps) {
  const pathname = usePathname();

  // Check if we're on the plans index page or a specific plan page
  const isPlansIndex = pathname === `/groups/${groupId}/plans`;

  return (
    <nav className="flex items-center text-sm">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={`/groups/${groupId}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
           >
            {groupName}
          </Link>
        </li>

        <li className="text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </li>

        <li>
          {isPlansIndex ? (
            <span className="font-medium">Plans</span>
          ) : (
            <Link
              href={`/groups/${groupId}/plans`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Plans
            </Link>
          )}
        </li>

        {planName && (
          <>
            <li className="text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </li>

            <li>
              <span className="font-medium">{planName}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
