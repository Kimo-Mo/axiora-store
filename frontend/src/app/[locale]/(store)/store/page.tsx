import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { StoreClient } from '@/components/features/store/StoreClient';
import { isSupportedLocale } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const title = `${t('shop')} | ${tCommon('siteTitle')}`;
  const description = tCommon('siteDescription');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://axiora-store.com/${locale}/store`,
    },
  };
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="container py-12">Loading store...</div>}>
      <StoreClient />
    </Suspense>
  );
}
