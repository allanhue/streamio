import { Suspense } from 'react';
import DashboardUI from './ui/dashboard';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardUI />
    </Suspense>
  );
}