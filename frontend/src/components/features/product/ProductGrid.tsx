'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProductCard from './ProductCard';
import type { PublicProductListItem } from '@/types/catalog';

interface ProductGridProps {
  products?: PublicProductListItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  /** Skeleton tile count while the first page loads. */
  skeletonCount?: number;
  onRetry?: () => void;
  onClearFilters?: () => void;
  className?: string;
}

/**
 * Responsive product grid (FR-001).
 *
 * All three of loading, empty and error are first-class: "no results" and "the
 * request failed" look identical otherwise, and the shopper's next move differs —
 * one is to broaden the filters, the other to retry.
 */
export default function ProductGrid({
  products,
  isLoading,
  isFetching,
  error,
  skeletonCount = 8,
  onRetry,
  onClearFilters,
  className,
}: ProductGridProps) {
  const t = useTranslations('store');
  const items = products ?? [];

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4', className)} aria-busy="true">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center', className)}>
        <p className="text-sm font-medium text-destructive">{t('loadProductsFailed')}</p>
        {onRetry && (
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            {t('browseProducts')}
          </Button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-12 text-center', className)}>
        <p className="text-base font-semibold text-foreground">{t('noProductsFound')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('noProductsFoundHint')}</p>
        {onClearFilters && (
          <Button variant="outline" className="mt-5" onClick={onClearFilters}>
            {t('clearFilters')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4',
        // Dim rather than unmount while paging, so the grid does not collapse and
        // reflow under the shopper's cursor.
        isFetching && 'opacity-60 transition-opacity',
        className,
      )}>
      {items.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}