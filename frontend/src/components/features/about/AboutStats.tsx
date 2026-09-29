export const AboutStats = () => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-border">
      <div className="text-center space-y-1">
        <p className="text-4xl font-black text-primary tracking-tighter">50K+</p>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Gamers Served
        </p>
      </div>
      <div className="text-center space-y-1">
        <p className="text-4xl font-black text-primary tracking-tighter">100%</p>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Secure</p>
      </div>
      <div className="text-center space-y-1">
        <p className="text-4xl font-black text-primary tracking-tighter">Instant</p>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Delivery
        </p>
      </div>
      <div className="text-center space-y-1">
        <p className="text-4xl font-black text-primary tracking-tighter">24/7</p>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Human Help
        </p>
      </div>
    </section>
  );
};
