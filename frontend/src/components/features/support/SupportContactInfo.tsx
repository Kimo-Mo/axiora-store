import { Mail, MessageSquare, Clock, AlertCircle, HelpCircle, Send } from 'lucide-react';
import { Card } from '@/components/ui';
import { Link } from '@/i18n/navigation';

export const SupportContactInfo = () => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="p-8 bg-card/60 backdrop-blur-md border-border/50 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 inset-e-0 p-4 opacity-10 pointer-events-none">
          <MessageSquare size={120} className="text-primary rotate-12" />
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Contact Channels</h2>
            <p className="text-sm text-muted-foreground">
              Prefer direct contact? Use any of these channels.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 group hover:border-primary/50 transition-colors">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Email Support
                </p>
                <p className="font-medium">support@axiora-store.com</p>
              </div>
            </div>

            <Link
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 group hover:border-primary/50 transition-colors">
              <div className="size-10 rounded-lg bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2] group-hover:scale-110 transition-transform">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Discord Community
                </p>
                <p className="font-medium">Join our Server</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 group hover:border-primary/50 transition-colors">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Estimated Response
                </p>
                <p className="font-medium">Under 12 Hours</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 text-sm text-primary">
            <AlertCircle size={18} className="shrink-0" />
            <p>
              For order issues, please make sure to include your <strong>Order ID</strong> for
              faster processing.
            </p>
          </div>
        </div>
      </Card>

      {/* FAQ Link */}
      <Link
        href="/legal"
        className="p-6 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted/50 transition-all">
        <div className="flex items-center gap-4">
          <HelpCircle className="text-muted-foreground" />
          <div>
            <p className="font-bold">Check out our FAQ</p>
            <p className="text-xs text-muted-foreground">Quick answers to common questions</p>
          </div>
        </div>
        <Send
          size={16}
          className="text-muted-foreground group-hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform"
        />
      </Link>
    </div>
  );
};
