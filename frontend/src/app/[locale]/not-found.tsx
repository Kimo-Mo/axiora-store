'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocalizedNotFound() {
  const t = useTranslations('store');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
      {/* Big 404 */}
      <div className="relative select-none">
        <span className="text-[9rem] font-black leading-none text-muted/60 tracking-tighter">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none bg-clip-text text-transparent bg-linear-to-br from-primary to-primary/30 tracking-tighter">
          404
        </span>
      </div>

      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">{t('pageNotFound')}</h1>
        <p className="text-muted-foreground text-sm">{t('pageNotFoundDesc')}</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/">
            <Home size={16} className="me-2" />
            {t('backToHome')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/store">
            <Search size={16} className="me-2" />
            {t('browseProducts')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
