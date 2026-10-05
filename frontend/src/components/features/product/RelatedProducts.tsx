'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRelatedProducts } from '@/hooks/useCatalog';
import ProductCard from '@/components/features/product/ProductCard';

/**
 * Related products from the same category (FR-008).
 *
 * The endpoint caps the list at eight and the product detail response already
 * carries the category id, so there is nothing to filter here — one query, no
 * client-side pagination. Renders nothing when the category has no other active
 * products rather than an empty section heading.
 */
export function RelatedProducts({ slug }: { slug: string }) {
  const t = useTranslations('product');
  const { data, isLoading } = useRelatedProducts(slug);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="related-heading">
      <div className="flex items-center justify-between">
        <h2 id="related-heading" className="text-lg font-extrabold tracking-tight text-foreground">
          {t('relatedProducts')}
        </h2>
        <Link
          href="/store"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80">
          {t('seeAll')}
          <ChevronRight className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}