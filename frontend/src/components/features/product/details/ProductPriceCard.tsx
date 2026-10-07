'use client';

import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, Check, Loader2, Minus, Plus, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPrice, stockLabel } from '@/components/features/product/ProductCard';
import type { PublicProductDetail, PublicVariantDto, StockStatus } from '@/types/catalog';
import { localized } from '@/types/catalog';

/**
 * Variant selector, price, and purchase controls (FR-006, FR-007).
 *
 * Variant matching is exact on every selected attribute. When a shopper picks a
 * combination that does not exist — Black in 1 TB, say — the honest answer is to
 * say so rather than silently showing the nearest variant's price, which would be
 * a price for something they did not choose.
 */

const STATUS_TONE: Record<StockStatus, { text: string; dot: string }> = {
  IN_STOCK: { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  LOW_STOCK: { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  OUT_OF_STOCK: { text: 'text-destructive', dot: 'bg-destructive' },
};

/** Ids of variants compatible with the attributes chosen so far. */
export function matchingVariantIds(
  variants: PublicVariantDto[],
  selection: Record<string, string>,
): Set<string> {
  const chosen = Object.entries(selection);
  return new Set(
    variants
      .filter((variant) =>
        chosen.every(([slug, valueEn]) => {
          const assigned = variant.attributes[slug];
          return assigned ? assigned.nameEn === valueEn : true;
        }),
      )
      .map((variant) => variant.id),
  );
}

interface ProductPriceCardProps {
  product: PublicProductDetail;
  /** Attribute slug → chosen English value, as displayed. */
  selection: Record<string, string>;
  onSelect: (slug: string, valueEn: string) => void;
  variant: PublicVariantDto | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  inCartQuantity?: number;
  remainingStock?: number | null;
  isAdding?: boolean;
  className?: string;
}

export const ProductPriceCard = ({
  product,
  selection,
  onSelect,
  variant,
  quantity,
  onQuantityChange,
  onAddToCart,
  inCartQuantity = 0,
  remainingStock = null,
  isAdding = false,
  className,
}: ProductPriceCardProps) => {
  const t = useTranslations('product');
  const tCatalog = useTranslations('catalog');
  const tCart = useTranslations('cart');
  const locale = useLocale();

  const status: StockStatus = variant?.stockStatus ?? 'OUT_OF_STOCK';
  const isPurchasable = variant !== null && status !== 'OUT_OF_STOCK';
  const isMaxInCart = isPurchasable && remainingStock !== null && remainingStock <= 0;
  const hasDiscount = variant?.compareAtPrice != null && variant.price > 0 && variant.compareAtPrice > variant.price;
  const discountPercent = hasDiscount
    ? Math.round(((variant.compareAtPrice! - variant.price) / variant.compareAtPrice!) * 100)
    : 0;

  // An option stays enabled while some variant matching the *other* chosen
  // attributes carries it — that is what makes an axis explorable rather than
  // forcing the shopper to backtrack.
  const isOptionAvailable = (slug: string, valueEn: string) =>
    matchingVariantIds(product.variants, { ...selection, [slug]: valueEn }).size > 0;

  // In the low-stock band or when limited by cart, the stepper caps at remainingStock.
  // Above the threshold the count is withheld, and a plain ceiling
  // stands in until the cart phase validates against real inventory.
  const QUANTITY_CEILING = 10;
  const maxQuantity = remainingStock !== null
    ? Math.max(1, remainingStock)
    : variant
      ? Math.max(1, variant.availableQuantity ?? QUANTITY_CEILING)
      : 1;

  return (
    <Card className={`overflow-hidden border-border ${className ?? ''}`}>
      <div className="flex flex-col gap-5 p-5">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('brand')}: {localized(product.brand, locale)}
          </p>

          {variant ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-bold leading-none text-foreground">
                  {formatPrice(variant.price, locale)} <span className="text-base">{product.currency}</span>
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(variant.compareAtPrice!, locale)}
                    </span>
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-white">
                      {tCatalog('savePercent', { percent: discountPercent })}
                    </span>
                  </>
                )}
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                {t('sku')}: {variant.sku}
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground">{t('selectOptions')}</p>
          )}
        </div>

        {product.attributes.map((attribute) => {
          const chosen = selection[attribute.slug];
          return (
            <fieldset key={attribute.id} className="space-y-2">
              <legend className="text-xs font-semibold text-muted-foreground">
                {localized(attribute, locale)}
              </legend>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => {
                  const isSelected = chosen === value.valueEn;
                  const available = isOptionAvailable(attribute.slug, value.valueEn);
                  return (
                    <button
                      key={value.valueEn}
                      type="button"
                      onClick={() => onSelect(attribute.slug, value.valueEn)}
                      aria-pressed={isSelected}
                      title={available ? undefined : t('unavailableCombination')}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground hover:border-primary/50'
                      } ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                      {locale === 'ar' ? value.valueAr : value.valueEn}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        {variant && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS_TONE[status].text}`}>
              <span aria-hidden="true" className={`size-2 rounded-full ${STATUS_TONE[status].dot}`} />
              {stockLabel(status, variant.availableQuantity, locale, {
                inStock: tCatalog('inStock'),
                lowStock: tCatalog('lowStock'),
                lowStockCount: (count) => tCatalog('onlyXLeft', { count }),
                outOfStock: tCatalog('outOfStock'),
              })}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              {t('warranty')}
            </span>
          </div>
        )}

        {variant && !isPurchasable && (
          <p className="text-xs text-muted-foreground">{t('unavailableCombination')}</p>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground">{t('quantity')}</span>
              {inCartQuantity > 0 && !isMaxInCart && (
                <span className="text-[11px] text-muted-foreground">
                  {tCart('alreadyInCart', { count: inCartQuantity })}
                </span>
              )}
            </div>
            <div className="flex items-center rounded-lg border border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-none"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || !isPurchasable || isMaxInCart}
                aria-label="-1">
                <Minus className="size-3.5" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                {isMaxInCart ? 0 : quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-none"
                onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity || !isPurchasable || isMaxInCart}
                aria-label="+1">
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          {isMaxInCart && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{tCart('maxStockReached', { count: inCartQuantity })}</span>
            </div>
          )}

          <Button
            className="w-full gap-2 font-bold"
            onClick={onAddToCart}
            disabled={!isPurchasable || isMaxInCart || isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{tCart('addingToCart')}</span>
              </>
            ) : isMaxInCart ? (
              <>
                <Check className="size-4" />
                <span>{tCart('maxInCart')}</span>
              </>
            ) : isPurchasable ? (
              <>
                <ShoppingCart className="size-4" />
                <span>{t('addToCart')}</span>
              </>
            ) : (
              <>
                <Check className="size-4" />
                <span>{tCatalog('outOfStock')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};