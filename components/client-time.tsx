'use client';

import { useState, useEffect } from 'react';

export interface ClientTimeProps {
  timestamp: number | null;
  format?: 'relative' | 'full';
  prefix?: string;
}

/**
 * Client-side time rendering component to prevent hydration mismatches
 */
export function ClientTime({ timestamp, format = 'relative', prefix = '' }: ClientTimeProps) {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (!timestamp) {
      setFormattedTime('N/A');
      return;
    }

    const updateTime = () => {
      if (format === 'relative') {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) setFormattedTime(`${prefix}${seconds}s ago`);
        else if (seconds < 3600) setFormattedTime(`${prefix}${Math.floor(seconds / 60)}m ago`);
        else if (seconds < 86400) setFormattedTime(`${prefix}${Math.floor(seconds / 3600)}h ago`);
        else setFormattedTime(`${prefix}${Math.floor(seconds / 86400)}d ago`);
      } else {
        setFormattedTime(`${prefix}${new Date(timestamp).toISOString()}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timestamp, format, prefix]);

  return <span>{formattedTime}</span>;
}

/**
 * ClientTimeExpiry component that displays a countdown to an expiry time
 * Only renders on the client side to prevent hydration mismatches
 */
export function ClientTimeExpiry({ expiryTime }: { expiryTime: number }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      if (expiryTime <= now) {
        setTimeLeft('Expired');
        return;
      }

      const seconds = Math.floor((expiryTime - now) / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) setTimeLeft(`In ${days}d ${hours % 24}h`);
      else if (hours > 0) setTimeLeft(`In ${hours}h ${minutes % 60}m`);
      else if (minutes > 0) setTimeLeft(`In ${minutes}m ${seconds % 60}s`);
      else setTimeLeft(`In ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  return <span>{timeLeft}</span>;
}

/**
 * ClientOnly component that ensures its children only render on the client
 * Prevents hydration mismatches for components that depend on client-side APIs
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    return () => {
      setHasMounted(false);
    };
  }, []);

  // Don't render children until component has mounted in browser
  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
