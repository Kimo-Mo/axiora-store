'use client';

import { useTranslations } from 'next-intl';
import { Settings } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Placeholder for the general store settings module.
 *
 * The sidebar (and the Phase 12 spec's nav list) links here, but order, shipping
 * and payment configuration belongs to the next admin phase. This page keeps the
 * link from dead-ending in a 404 until then. The one setting that already works
 * — the inventory low-stock threshold — lives under `/dashboard/inventory`.
 */
export default function AdminSettingsPage() {
  const t = useTranslations('admin.placeholder');

  return (
    <div className="pb-12">
      <h1 className="text-xl font-bold text-foreground">{t('settingsTitle')}</h1>
      <p className="text-xs text-muted-foreground mt-0.5">{t('settingsSubtitle')}</p>

      <Card className="bg-card border-border shadow-xs mt-6">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Settings className="h-8 w-8 animate-[spin_4s_linear_infinite] motion-reduce:animate-none" />
          </div>
          <p className="text-sm text-muted-foreground">{t('settingsSubtitle')}</p>
          <Button type="button" variant="outline" size="sm" asChild className="mt-2">
            <Link href="/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
