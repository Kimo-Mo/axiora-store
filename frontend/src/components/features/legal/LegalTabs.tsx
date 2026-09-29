'use client';

import { ChevronRight, Scale } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LEGAL_DOCS } from './LegalConstants';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export const LegalTabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  
  const activeTab = tabParam && LEGAL_DOCS.some((doc) => doc.id === tabParam) ? tabParam : 'terms';

  const handleTabChange = (value: string) => {
    router.replace(`/legal?tab=${value}`, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="flex flex-col lg:flex-row gap-12 items-start">
      {/* ── Sidebar Navigation ── */}
      <div className="w-full lg:w-72 shrink-0 space-y-6">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2">
          Documents
        </h2>
        <TabsList className="flex flex-col h-auto w-full bg-transparent gap-2 p-0">
          {LEGAL_DOCS.map((doc) => (
            <TabsTrigger
              key={doc.id}
              value={doc.id}
              className={cn(
                'w-full justify-start items-center gap-4 px-4 py-4 rounded-2xl border border-transparent transition-all group',
                'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20',
                'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              )}>
              <div className="size-8 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/50 transition-colors group-data-[state=active]:border-primary/30">
                <doc.icon size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm leading-none">{doc.label}</p>
              </div>
              <ChevronRight
                size={14}
                className="opacity-0 group-data-[state=active]:opacity-100 -translate-x-2 group-data-[state=active]:translate-x-0 transition-all"
              />
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="p-6 bg-primary/5 border-primary/10 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm">Need Clarification?</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you have any questions regarding our legal documents, please contact our legal team.
          </p>
          <Button asChild>
            <Link href="/support">Contact Us</Link>
          </Button>
        </Card>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 w-full min-w-0">
        <Card className="p-8 md:p-12 bg-card/60 backdrop-blur-md border-border/50 rounded-4xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -mr-12 -mt-12">
            <Scale size={300} />
          </div>

          <div className="relative z-10">
            {LEGAL_DOCS.map((doc) => (
              <TabsContent key={doc.id} value={doc.id} className="mt-0 focus-visible:outline-none">
                <div
                  className="prose prose-sm md:prose-base prose-invert max-w-none 
                  prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground
                  prose-h1:text-4xl prose-h1:mb-8
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-li:text-muted-foreground
                  prose-strong:text-primary prose-strong:font-bold">
                  <doc.component />
                </div>

                <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                  <p>© 2026 Axiora Store. All rights reserved.</p>
                </div>
              </TabsContent>
            ))}
          </div>
        </Card>
      </div>
    </Tabs>
  );
};
