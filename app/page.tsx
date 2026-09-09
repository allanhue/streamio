import { Suspense } from 'react';
import HomeUI from './ui/home';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeUI />
    </Suspense>
  );
}