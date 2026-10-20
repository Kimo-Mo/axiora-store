'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ProductListHeader() {
  const t = useTranslations('admin.products');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('subtitle')}
        </p>
      </div>
      <Link href="/dashboard/products/create">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          <span>{t('create')}</span>
        </Button>
      </Link>
    </div>
  );
}
