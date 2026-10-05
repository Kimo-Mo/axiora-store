'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ProductCardData, StockStatus } from '@/types/catalog';
import { localized, localizedField } from '@/types/catalog';

/**
 * Storefront product card (FR-001).
 *
 * Every price and stock word here comes from the server. The card does not derive a
 * discount from two numbers or decide whether anything is purchasable — `pricing`
 * and `stockStatus` are already resolved, and the raw inventory count above the
 * low-stock threshold never reaches the browser at all.
 */

/** EGP prices are quoted in whole pounds; minor units add noise, not precision. */
export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: 0 }).format(amount);
}

/**
 * Label for a stock band.
 *
 * `availableQuantity` is only ever non-null in the `LOW_STOCK` band, and only on
 * the detail endpoint — a listing card receives the aggregate `stockStatus` with
 * no count, which is why a low-stock card falls back to a qualitative label.
 */
export function stockLabel(
  status: StockStatus,
  availableQuantity: number | null,
  locale: string,
  labels: { inStock: string; lowStock: string; lowStockCount: (count: string) => string; outOfStock: string },
): string {
  if (status === 'OUT_OF_STOCK') return labels.outOfStock;
  if (status === 'LOW_STOCK') {
    if (availableQuantity === null) return labels.lowStock;
    const count = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(availableQuantity);
    return labels.lowStockCount(count);
  }
  return labels.inStock;
}

const STOCK_TONE: Record<StockStatus, string> = {
  IN_STOCK: 'text-emerald-600 dark:text-emerald-400',
  LOW_STOCK: 'text-amber-600 dark:text-amber-400',
  OUT_OF_STOCK: 'text-destructive',
};

const STOCK_DOT: Record<StockStatus, string> = {
  IN_STOCK: 'bg-emerald-500',
  LOW_STOCK: 'bg-amber-500',
  OUT_OF_STOCK: 'bg-destructive',
};

interface ProductCardProps {
  product: ProductCardData;
  /** Eager-load the first row's images; everything below the fold stays lazy. */
  priority?: boolean;
  className?: string;
}

export default function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();

  const name = localized(product, locale);
  const categoryName = localized(product.category, locale);
  const brandName = localized(product.brand, locale);
  const shortDescription = localizedField(product, 'shortDescription', locale);

  const { fromPrice, compareAtPrice, hasDiscount, discountPercentage } = product.pricing;
  const status = product.stockStatus;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card',
        'transition-shadow duration-200 hover:shadow-lg focus-within:shadow-lg ',
        className,
      )}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.primaryImage ? (
          <Image
            src={getImageUrl(product.primaryImage.url)}
            alt={product.primaryImage.alt ?? name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            // Cloudinary already serves correctly sized derivatives; re-encoding
            // them through the Next optimiser costs build time and CDN churn for no
            // visual gain.
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('noImage')}
          </div>
        )}

        <div className="pointer-events-none absolute inset-start-2 top-2 flex flex-col items-start gap-1">
          {hasDiscount && discountPercentage > 0 && (
            <Badge className="bg-destructive text-white">{t('savePercent', { percent: discountPercentage })}</Badge>
          )}
          {product.isNew && <Badge className="bg-primary text-primary-foreground">{t('new')}</Badge>}
          {product.isBestSeller && !product.isNew && (
            <Badge className="bg-amber-500 text-white">{t('bestseller')}</Badge>
          )}
        </div>

        {status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <span className="truncate">{brandName}</span>
          {categoryName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{categoryName}</span>
            </>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground" title={name}>
          {/* The overlay pseudo-element makes the whole card clickable while only
              this anchor is in the tab order. */}
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {name}
          </Link>
        </h3>

        {shortDescription && <p className="line-clamp-2 text-xs text-muted-foreground">{shortDescription}</p>}

        <div className="mt-auto flex flex-col gap-1 pt-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-bold leading-none text-foreground">
              {t('fromPrice', { price: `${formatPrice(fromPrice, locale)} ${product.currency}` })}
            </span>
            {hasDiscount && compareAtPrice !== null && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(compareAtPrice, locale)}
              </span>
            )}
          </div>

          <span
            className={cn('inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold', STOCK_TONE[status])}>
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', STOCK_DOT[status])} />
            {stockLabel(status, null, locale, {
              inStock: t('inStock'),
              lowStock: t('lowStock'),
              lowStockCount: (count) => t('onlyXLeft', { count }),
              outOfStock: t('outOfStock'),
            })}
          </span>
        </div>
      </div>
    </article>
  );
}