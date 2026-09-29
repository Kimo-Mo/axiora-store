import { Metadata } from 'next';
import { Smartphone } from 'lucide-react';
import { AboutHero } from '@/components/features/about/AboutHero';
import { AboutValues } from '@/components/features/about/AboutValues';
import { AboutStats } from '@/components/features/about/AboutStats';

export const metadata: Metadata = {
  title: 'About Us | Axiora Store',
  description: 'Learn more about Axiora Store, Egypt’s destination for genuine smartphones and electronics.',
  openGraph: {
    title: 'About Us | Axiora Store',
    description: 'Learn more about Axiora Store, Egypt’s destination for genuine smartphones and electronics.',
    url: 'https://axiora-store.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-20">
      <AboutHero />
      <AboutValues />
      <AboutStats />

      {/* ── Journey Footer ── */}
      <section className="text-center bg-card w-full mx-auto space-y-6 p-10 rounded-xl shadow-sm border border-border">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Smartphone size={32} className="text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold">Join the Axiora Store family today</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Whether you&apos;re looking for the latest smartphone, fast chargers, audio devices, or quality accessories,
          we&apos;ve got you covered with genuine warranty and fast delivery across Egypt.
        </p>
      </section>
    </div>
  );
}
