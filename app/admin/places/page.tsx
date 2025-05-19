import { redirect } from 'next/navigation';
import { Container } from '@/components/features/layout/organisms/container';
import { checkAdminAuth } from '../utils/auth';
import { TABLES } from '@/utils/constants/tables';

export const metadata = {
  title: 'Manage Places | Admin Panel',
  description: 'Manage places and points of interest on withme.travel',
};

export default async function AdminPlacesPage() {
  // ... rest of the file stays unchanged
} 