import { Metadata } from 'next';
import { Suspense } from 'react';
import { StoreClient } from '@/components/features/store/StoreClient';

export const metadata: Metadata = {
  title: 'Store | Axiora Store',
  description: 'Browse our catalog of genuine smartphones, electronics, chargers, and mobile accessories.',
  openGraph: {
    title: 'Store | Axiora Store',
    description: 'Browse our catalog of genuine smartphones, electronics, chargers, and mobile accessories.',
    url: 'https://axiora-store.com/store',
  },
};

export default function StorePage() {
  return (
    <Suspense fallback={<div className="container py-12">Loading store...</div>}>
      <StoreClient />
    </Suspense>
  );
}
