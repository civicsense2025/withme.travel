'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import OpenReplayProvider with ssr: false
const OpenReplayProvider = dynamic(
  () => import('./openreplay-provider').then((mod) => mod.OpenReplayProvider),
  { ssr: false }
);

export function ClientOpenReplayWrapper({ children }: { children: ReactNode }) {
  return <OpenReplayProvider>{children}</OpenReplayProvider>;
}
