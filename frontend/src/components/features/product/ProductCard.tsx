'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { cn, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
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
  const tProduct = useTranslations('product');
  const tCart = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();
  const { addItem, items: cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const inCartItem = useMemo(() => {
    if (!product.defaultVariantId) return null;
    return cartItems.find((i) => i.variantId === product.defaultVariantId) ?? null;
  }, [cartItems, product.defaultVariantId]);

  const inCartQuantity = inCartItem?.quantity ?? 0;
  const isMaxInCart =
    inCartItem !== null &&
    inCartItem.availableStock !== undefined &&
    inCartItem.availableStock !== null &&
    inCartQuantity >= inCartItem.availableStock;

  const name = localized(product, locale);
  const categoryName = localized(product.category, locale);
  const brandName = localized(product.brand, locale);
  const shortDescription = localizedField(product, 'shortDescription', locale);

  const { fromPrice, compareAtPrice, hasDiscount, discountPercentage } = product.pricing;
  const status = product.stockStatus;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.defaultVariantId || status === 'OUT_OF_STOCK' || isAdding) return;

    if (isMaxInCart) {
      toast.warning(tCart('maxStockReached', { count: inCartItem.availableStock }));
      return;
    }

    try {
      setIsAdding(true);
      await addItem({
        variantId: product.defaultVariantId,
        quantity: 1,
        product: {
          id: product.id,
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          primaryImage: product.primaryImage?.url ?? null,
        },
        variant: {
          id: product.defaultVariantId,
          sku: '',
          price: fromPrice,
          compareAtPrice: compareAtPrice,
          attributes: {},
          stockStatus: status,
          availableStock: inCartItem?.availableStock ?? (status === 'IN_STOCK' ? 99 : 5),
        },
      });

      toast.success(name, {
        description: tCart('itemAdded'),
        action: {
          label: tCart('viewCart'),
          onClick: () => router.push('/cart'),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to add item to cart from card:', err);

      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as {
          error?: {
            message?: string;
            code?: string;
            details?: { code?: string; availableStock?: number };
          };
        } | undefined;

        const errorMsg = errorData?.error?.message;
        const details = errorData?.error?.details;

        if (
          details?.code === 'EXCEEDS_AVAILABLE_STOCK' ||
          (errorMsg && /exceeds available stock/i.test(errorMsg)) ||
          (errorMsg && /out of stock/i.test(errorMsg))
        ) {
          const count = details?.availableStock ?? inCartItem?.availableStock ?? 1;
          toast.error(tCart('maxStockReached', { count }));
          return;
        }

        if (errorMsg) {
          toast.error(errorMsg);
          return;
        }
      } else if (err instanceof Error && (err as Error & { code?: string; availableStock?: number }).code === 'EXCEEDS_AVAILABLE_STOCK') {
        const count = (err as Error & { code?: string; availableStock?: number }).availableStock ?? inCartItem?.availableStock ?? 1;
        toast.error(tCart('maxStockReached', { count }));
        return;
      }

      toast.error(tCart('itemAddFailed'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card',
        'transition-shadow duration-200 hover:shadow-lg focus-within:shadow-lg',
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
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('noImage')}
          </div>
        )}

        <div className="pointer-events-none absolute inset-s-2 top-2 flex flex-col items-start gap-1 z-10">
          {hasDiscount && discountPercentage > 0 && (
            <Badge className="bg-destructive text-white">{t('savePercent', { percent: discountPercentage })}</Badge>
          )}
          {product.isNew && <Badge className="bg-primary text-primary-foreground">{t('new')}</Badge>}
          {product.isBestSeller && !product.isNew && (
            <Badge className="bg-amber-500 text-white">{t('bestseller')}</Badge>
          )}
        </div>

        {status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 z-10">
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
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {name}
          </Link>
        </h3>

        {shortDescription && <p className="line-clamp-2 text-xs text-muted-foreground">{shortDescription}</p>}

        <div className="mt-auto flex flex-col gap-1.5 pt-2">
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

          {/* Quick Add to Cart Button */}
          {product.defaultVariantId && status !== 'OUT_OF_STOCK' && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isAdding || isMaxInCart}
              className="relative z-10 mt-1.5 w-full gap-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={handleAddToCart}>
              {isAdding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isMaxInCart ? (
                <Check className="size-3.5" />
              ) : (
                <ShoppingCart className="size-3.5" />
              )}
              <span>
                {isAdding
                  ? tCart('addingToCart')
                  : isMaxInCart
                  ? tCart('maxInCart')
                  : tProduct('addToCart')}
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}