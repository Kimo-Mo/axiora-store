import { Zap, ShieldCheck, Headphones, Globe, Target } from 'lucide-react';
import { Card } from '@/components/ui';

export const AboutValues = () => {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Our Core Values</h2>
        <p className="text-muted-foreground">The pillars that define the Axiora Store experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Card 1: Fast Delivery (Large) */}
        <Card className="md:col-span-2 md:row-span-2 group relative overflow-hidden bg-card backdrop-blur-sm border-border/50 p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-500">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
            <Zap size={32} fill="currentColor" className="opacity-20" />
            <Zap size={32} className="absolute" />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tight">Fast Nationwide Delivery</h3>
            <p className="text-muted-foreground leading-relaxed">
              Safe, fast, and insured doorstep delivery across all Egyptian governorates.
              Track your package from our warehouse right to your door.
            </p>
          </div>
          <div className="absolute top-0 inset-e-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={200} />
          </div>
        </Card>

        {/* Card 2: Secure Payments */}
        <Card className="group bg-card backdrop-blur-sm border-border/50 p-6 hover:border-primary/50 transition-all duration-300">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:rotate-12 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
          <p className="text-sm text-muted-foreground">
            Industry-standard encryption for every transaction. Your data is always protected.
          </p>
        </Card>

        {/* Card 3: 24/7 Support */}
        <Card className="group bg-card backdrop-blur-sm border-border/50 p-6 hover:border-primary/50 transition-all duration-300">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:-rotate-12 transition-transform">
            <Headphones size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
          <p className="text-sm text-muted-foreground">
            Our dedicated team is always here to assist you with any inquiries or issues.
          </p>
        </Card>

        {/* Card 4: Global Access */}
        <Card className="group bg-card backdrop-blur-sm border-border/50 p-6 hover:border-primary/50 transition-all duration-300 lg:col-span-1">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Global Access</h3>
          <p className="text-sm text-muted-foreground">
            Supporting games and platforms from all around the world.
          </p>
        </Card>

        {/* Card 5: Our Mission (Wide) */}
        <Card className="lg:col-span-full group bg-linear-to-br from-primary/20 to-transparent backdrop-blur-sm border-primary/20 p-8 flex items-center gap-6 hover:border-primary/40 transition-all">
          <div className="shrink-0 size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Target size={32} />
          </div>
          <div>
            <h3 className="text-xl lg:text-center font-bold mb-2">Our Mission</h3>
            <p className="text-muted-foreground">
              To be the premier, most trusted electronics and mobile device store in Egypt,
              providing 100% genuine products, authentic manufacturer warranty, and unmatched customer care.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
