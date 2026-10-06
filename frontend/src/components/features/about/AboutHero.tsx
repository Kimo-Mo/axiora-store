import { Sparkles } from 'lucide-react';

export const AboutHero = () => {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border/50 p-8 md:p-16 text-center space-y-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-pulse">
          <Sparkles size={16} />
          <span>Your trusted electronics partner</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tightest text-foreground">
          Premium Tech <span className="text-primary">& Mobile Devices</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Axiora Store is Egypt’s trusted destination for genuine smartphones, fast chargers,
          audio gear, and mobile accessories with authentic warranty and prompt delivery.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute -inset-s-20 -top-20 size-64 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute -inset-e-20 -bottom-20 size-64 bg-primary/20 rounded-full blur-[100px]" />
    </section>
  );
};
