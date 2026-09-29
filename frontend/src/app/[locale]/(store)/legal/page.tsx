import { Metadata } from 'next';
import { LegalHeader } from '@/components/features/legal/LegalHeader';
import { LegalTabs } from '@/components/features/legal/LegalTabs';

export const metadata: Metadata = {
  title: 'Legal Hub | Axiora Store',
  description: 'Read our terms of service, privacy policy, and other legal documents.',
  openGraph: {
    title: 'Legal Hub | Axiora Store',
    description: 'Read our terms of service, privacy policy, and other legal documents.',
    url: 'https://axiora-store.com/legal',
  },
};

export default function LegalHubPage() {
  return (
    <div className="container py-12 space-y-12">
      <LegalHeader />
      <LegalTabs />
    </div>
  );
}
