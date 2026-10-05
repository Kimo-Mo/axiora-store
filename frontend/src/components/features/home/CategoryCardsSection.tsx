'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn, getImageUrl } from '@/lib/utils';
import { useCategories } from '@/hooks/useCatalog';
import { localized } from '@/types/catalog';

/**
 * Homepage category discovery (FR-009).
 *
 * Only top-level categories are shown: a homepage strip of 24 leaf categories is
 * noise, and every leaf is one click away inside the store filter. Each card links
 * to the store pre-filtered by that slug, which the backend widens to include the
 * whole subtree — so "Mobiles & Tablets" lands on phones *and* tablets.
 *
 * A client component because it reads a TanStack Query hook. The tree is small,
 * cached for ten minutes, and shared with the store page's filter, so the extra
 * client boundary costs one cached request rather than a duplicated server fetch.
 */

const MAX_CARDS = 6;

interface CategoryCardsSectionProps {
  className?: string;
}

export function CategoryCardsSection({ className }: CategoryCardsSectionProps) {
  const t = useTranslations('store');
  const locale = useLocale();
  const { data: categories = [] } = useCategories();

  const roots = categories.filter((category) => category.parentId === null).slice(0, MAX_CARDS);
  if (roots.length === 0) return null;

  return (
    <section className={cn('space-y-4', className)} aria-labelledby="category-cards-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="category-cards-heading" className="text-lg font-extrabold tracking-tight text-foreground">
          {t('shopByCategory')}
        </h2>
        <p className="text-xs text-muted-foreground">{t('shopByCategorySubtitle')}</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {roots.map((category) => (
          <li key={category.id}>
            <Link
              href={`/store?category=${category.slug}`}
              className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {category.image ? (
                  <Image
                    src={getImageUrl(category.image)}
                    alt={localized(category, locale)}
                    fill
                    sizes="(max-width: 640px) 50vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div aria-hidden="true" className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    {localized(category, locale).charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-foreground">{localized(category, locale)}</h3>
                {category.productCount > 0 && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t('productsCount', { count: category.productCount })}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CategoryCardsSection;