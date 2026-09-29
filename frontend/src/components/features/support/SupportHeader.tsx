import { LifeBuoy } from 'lucide-react';

export const SupportHeader = () => {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
        <LifeBuoy size={14} />
        <span>Support Hub</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tightest">
        How can we <span className="text-primary">help you?</span>
      </h1>
      <p className="text-muted-foreground text-lg">
        Have a question or encounter an issue? Our support team is available 24/7 to help you get
        back to gaming.
      </p>
    </div>
  );
};
