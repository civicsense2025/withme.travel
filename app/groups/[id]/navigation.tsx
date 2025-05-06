'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Calendar, 
  Map, 
  Settings, 
  LightbulbIcon,
  Pencil
} from 'lucide-react';
import { useEffect } from 'react';

interface GroupNavigationProps {
  groupId: string;
}

export default function GroupNavigation({ groupId }: GroupNavigationProps) {
  const pathname = usePathname();
  
  // Debug log for pathname and groupId
  useEffect(() => {
    console.log('[group-navigation] Current pathname:', pathname);
    console.log('[group-navigation] Group ID:', groupId);
  }, [pathname, groupId]);
  
  const links = [
    {
      href: `/groups/${groupId}`,
      label: 'Overview',
      icon: <Users className="w-4 h-4 mr-2" />,
      exact: true
    },
    {
      href: `/groups/${groupId}/ideas`,
      label: 'Ideas',
      icon: <LightbulbIcon className="w-4 h-4 mr-2" />,
      exact: false
    },
    {
      href: `/groups/${groupId}/trips`,
      label: 'Trips',
      icon: <Calendar className="w-4 h-4 mr-2" />,
      exact: false
    },
    {
      href: `/groups/${groupId}/members`,
      label: 'Members',
      icon: <Users className="w-4 h-4 mr-2" />,
      exact: false
    },
    {
      href: `/groups/${groupId}/settings`,
      label: 'Settings',
      icon: <Settings className="w-4 h-4 mr-2" />,
      exact: false
    }
  ];
  
  return (
    <nav className="flex space-x-1 overflow-x-auto pb-2 mb-6">
      {links.map((link) => {
        const isActive = link.exact 
          ? pathname === link.href
          : pathname?.startsWith(link.href) || false;
        
        console.log(`[group-navigation] Link: ${link.label}, href: ${link.href}, isActive: ${isActive}`);
          
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-md flex items-center text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
            onClick={() => {
              console.log(`[group-navigation] Clicked on ${link.label} tab`);
            }}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
} 