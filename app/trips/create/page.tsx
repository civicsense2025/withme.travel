import { Suspense } from 'react';
import { CreateTripForm } from './components/CreateTripForm';

export default function CreateTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateTripForm />
    </Suspense>
  );
}
