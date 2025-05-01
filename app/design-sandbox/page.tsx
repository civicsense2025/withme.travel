import React from 'react';
import { Metadata } from 'next';
import DesignSandboxClient from './design-sandbox-client';

export const metadata: Metadata = {
  title: 'Design Sandbox | withme.travel',
  description: 'A sandbox for exploring Tiptap-inspired design elements',
};

export default function DesignSandboxPage() {
  return <DesignSandboxClient />;
}
