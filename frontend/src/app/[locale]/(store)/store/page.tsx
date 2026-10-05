import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { StoreClient } from '@/components/features/store/StoreClient';
import { isSupportedLocale } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SITE_URL = 'https://axiora-store.com';

/**
 * Store listing metadata (NFR-005).
 *
 * A search term is folded into the title and description so a shared result link
 * says what it is a link to. The parameter is plain-interpolated into a string, and
 * `title.template` in the root layout caps its length in the rendered `<title>`,
 * so this cannot grow without bound.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: 'store' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const query = await searchParams;

  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 80) : '';
  const title = search ? `${t('searchResultsFor', { query: search })} | ${tCommon('siteTitle')}` : `${t('title')} | ${tCommon('siteTitle')}`;
  const description = t('metaDescription');

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/store`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/store`,
      type: 'website',
    },
  };
}

export default function StorePage() {
  return (
    // `StoreClient` reads `useSearchParams`, which forces the whole subtree into a
    // client boundary and opts it out of static prerendering. A Suspense boundary
    // is what lets Next stream the rest of the page instead of bailing to the
    // nearest static parent.
    <Suspense fallback={<div className="container py-12" />}>
      <StoreClient />
    </Suspense>
  );
}