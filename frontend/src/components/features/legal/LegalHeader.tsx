import { Scale, Shield } from 'lucide-react';

export const LegalHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/50">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
          <Scale size={14} />
          <span>Legal Framework</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tightest">
          The <span className="text-primary">Legal Hub</span>
        </h1>
        <p className="text-muted-foreground">
          Everything you need to know about our rules, privacy, and policies.
        </p>
      </div>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
        <Shield className="text-primary size-8" />
        <p className="text-xs text-muted-foreground leading-tight">
          Protected by Industry Standard
          <br />
          <span className="text-foreground font-bold">Encrypted Security</span>
        </p>
      </div>
    </div>
  );
};
