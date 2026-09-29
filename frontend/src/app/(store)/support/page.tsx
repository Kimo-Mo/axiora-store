import { Metadata } from 'next';
import { SupportHeader } from '@/components/features/support/SupportHeader';
import { SupportClient } from '@/components/features/support/SupportClient';

export const metadata: Metadata = {
  title: 'Support | Axiora Store',
  description: 'Get help with your electronics orders, warranty, account, or any other questions.',
  openGraph: {
    title: 'Support | Axiora Store',
    description: 'Get help with your electronics orders, warranty, account, or any other questions.',
    url: 'https://axiora-store.com/support',
  },
};

export default function SupportPage() {
  return (
    <div>
      <SupportHeader />
      <SupportClient />
    </div>
  );
}
