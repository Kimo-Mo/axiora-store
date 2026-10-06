'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui';

export default function EmptyCart() {
  const t = useTranslations('cart');

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <ShoppingCart className="size-12 animate-in fade-in zoom-in-75 duration-300" />
        </div>
        <div className="absolute -bottom-1 -inset-e-1 w-7 h-7 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-muted-foreground">
          0
        </div>
      </div>

      <div className="max-w-md space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {t('empty')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {t('emptyHint')}
        </p>
      </div>

      <Button asChild size="lg" className="rounded-xl px-8 shadow-sm group">
        <Link href="/store">
          <span>{t('browseProducts')}</span>
          <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
        </Link>
      </Button>
    </div>
  );
}
