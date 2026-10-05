import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { catalogService } from '@/services/catalog.service';
import { isSupportedLocale } from '@/i18n/routing';
import { ProductDetailClient } from '@/components/features/product/ProductDetailClient';
import { localized, localizedField } from '@/types/catalog';
import type { PublicProductDetail } from '@/types/catalog';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const SITE_URL = 'https://axiora-store.com';

/**
 * Load the product once per render pass and reuse it for both metadata and the
 * page. The detail endpoint is the only source here — there is no separate admin
 * call — so metadata and body can never disagree about a product that changed
 * between the two fetches.
 */
async function loadProduct(slug: string): Promise<{ product: PublicProductDetail } | { missing: true }> {
  try {
    const product = await catalogService.product(slug);
    return { product };
  } catch (error) {
    // 404 means absent or deactivated — the backend refuses to distinguish, and
    // neither should the storefront. Anything else (a database blip, the backend
    // being down) is *not* a missing product: reporting 404 there would tell a
    // shopper their product does not exist when it does.
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return { missing: true };
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale) || !slug) return {};

  try {
const result = await loadProduct(slug);
    if ('missing' in result) {
      const t = await getTranslations({ locale, namespace: 'product' });
      return { title: `${t('notFound')} | Axiora Store`, robots: { index: false } };
    }

    const { product } = result;
    const title = `${localized(product, locale)} | Axiora Store`;
    const description =
      localizedField(product, 'shortDescription', locale) ?? `${localized(product, locale)} — ${product.sku}`;
    const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/${locale}/product/${product.slug}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${locale}/product/${product.slug}`,
        type: 'website',
        ...(primaryImage ? { images: [{ url: primaryImage.url, alt: primaryImage.alt ?? title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(primaryImage ? { images: [primaryImage.url] } : {}),
      },
    };
  } catch {
    // A metadata failure must not take the page down; the body will surface the
    // real error through its own error boundary.
    return { title: 'Axiora Store', robots: { index: false } };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const result = await loadProduct(slug);
  if ('missing' in result) notFound();

  return <ProductDetailClient slug={slug} />;
}