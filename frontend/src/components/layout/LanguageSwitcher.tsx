'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = locale === 'ar' ? 'en' : 'ar';

  const switchLocale = () => {
    // Preserve query string via window (avoids useSearchParams Suspense
    // requirements on statically prerendered pages).
    const query = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`${pathname}${query}`, { locale: nextLocale });
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={switchLocale}
      title={t('language')}
      aria-label={t('language')}
      className={cn('relative !h-8 !w-8 md:!h-9 md:!w-9 rounded-full', className)}>
      <Globe className="size-4 md:size-5" />
      <span className="sr-only">{nextLocale === 'ar' ? t('switchToArabic') : t('switchToEnglish')}</span>
    </Button>
  );
}
