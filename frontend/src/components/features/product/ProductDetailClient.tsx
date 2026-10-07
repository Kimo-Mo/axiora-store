'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useProduct } from '@/hooks/useCatalog';
import { useCart } from '@/hooks/useCart';
import type { PublicVariantDto } from '@/types/catalog';
import { localizedField } from '@/types/catalog';
import { ProductGallery, ProductHeader, ProductPriceCard } from '@/components/features/product/details';
import { ProductSpecifications } from '@/components/features/product/details/ProductSpecifications';
import { ProductDescription } from '@/components/features/product/details/ProductDescription';
import { RelatedProducts } from '@/components/features/product/RelatedProducts';
import { matchingVariantIds } from '@/components/features/product/details/ProductPriceCard';

/**
 * Product detail shell (FR-006, SC-005).
 *
 * Owns the active attribute combination and nothing else. All catalog data comes
 * from one `useProduct` query, so switching a variant re-renders from cache instead
 * of re-fetching — the price, SKU and stock badge update from data already in
 * memory (well inside the 500ms budget in plan.md).
 *
 * The cart is deliberately untouched. Cart lines anchor to a `ProductVariant.id`
 * and the cart API arrives in a later phase, so this wires the button to the
 * existing store and leaves the persistence question to that phase rather than
 * inventing a half-cart here.
 */

/** Default selection: the default variant's attributes, or the first variant's. */
function defaultSelection(
  attributes: Array<{ slug: string }>,
  variants: PublicVariantDto[],
): Record<string, string> {
  const seed = variants.find((variant) => variant.isDefault) ?? variants[0];
  if (!seed) return {};

  const selection: Record<string, string> = {};
  for (const attribute of attributes) {
    const assigned = seed.attributes[attribute.slug];
    if (assigned) selection[attribute.slug] = assigned.nameEn;
  }
  return selection;
}

export function ProductDetailClient({ slug }: { slug: string }) {
  const t = useTranslations('product');
  const router = useRouter();
  const locale = useLocale();

  const { data: product, isLoading, error } = useProduct(slug);

  const [selection, setSelection] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Re-seed whenever the product changes, so a shopper who picked "Black" on one
  // phone does not arrive on the next one still filtering.
  //
  // Adjusted during render rather than in an effect: the reset lands in the same
  // paint as the new product instead of triggering a second render pass, and
  // `syncedFor` records which product the current selection belongs to.
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  if (product && syncedFor !== product.id) {
    setSyncedFor(product.id);
    setSelection(defaultSelection(product.attributes, product.variants));
    setQuantity(1);
  }

  const variant = useMemo(() => {
    if (!product) return null;
    const compatible = matchingVariantIds(product.variants, selection);
    // Prefer an exact match; fall back to the default variant so a partially
    // chosen combination still shows a real SKU rather than a blank card.
    return (
      product.variants.find((candidate) => candidate.isDefault && compatible.has(candidate.id)) ??
      product.variants.find((candidate) => compatible.has(candidate.id)) ??
      null
    );
  }, [product, selection]);

  const handleSelect = useCallback((attributeSlug: string, valueEn: string) => {
    setSelection((current) => ({ ...current, [attributeSlug]: valueEn }));
  }, []);

  const { addItem, items: cartItems } = useCart();
  const tCart = useTranslations('cart');
  const [isAdding, setIsAdding] = useState(false);

  const inCartItem = useMemo(() => {
    if (!variant) return null;
    return cartItems.find((item) => item.variantId === variant.id) ?? null;
  }, [cartItems, variant]);

  const inCartQuantity = inCartItem?.quantity ?? 0;
  // If inCartItem is present, inCartItem.availableStock reflects accurate server stock.
  // Otherwise fall back to variant.availableQuantity (non-null for LOW_STOCK items).
  const availableStock = inCartItem?.availableStock ?? variant?.availableQuantity ?? null;
  const remainingStock = availableStock !== null
    ? Math.max(0, availableStock - inCartQuantity)
    : null;

  // Keep chosen quantity within available limits
  useEffect(() => {
    if (remainingStock !== null && remainingStock > 0 && quantity > remainingStock) {
      setQuantity(remainingStock);
    } else if (remainingStock === 0 && quantity !== 1) {
      setQuantity(1);
    }
  }, [quantity, remainingStock]);

  const handleAddToCart = useCallback(async () => {
    if (!product || !variant || isAdding) return;

    if (remainingStock !== null && remainingStock <= 0) {
      toast.error(tCart('maxStockReached', { count: availableStock ?? 1 }));
      return;
    }

    if (remainingStock !== null && quantity > remainingStock) {
      toast.error(tCart('maxStockReached', { count: availableStock ?? 1 }));
      return;
    }

    try {
      setIsAdding(true);
      await addItem({
        variantId: variant.id,
        quantity,
        product: {
          id: product.id,
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          primaryImage: product.images?.[0]?.url ?? null,
        },
        variant: {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          attributes: variant.attributes,
          stockStatus: variant.stockStatus,
          availableStock: availableStock ?? variant.availableQuantity,
        },
      });

      const productName = locale === 'ar' ? product.nameAr : product.nameEn;
      toast.success(productName, {
        description: tCart('itemAdded'),
        action: {
          label: tCart('viewCart'),
          onClick: () => router.push('/cart'),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to add product to cart:', err);

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
          const count = details?.availableStock ?? availableStock ?? 1;
          toast.error(tCart('maxStockReached', { count }));
          return;
        }

        if (errorMsg) {
          toast.error(errorMsg);
          return;
        }
      } else if (err instanceof Error && (err as Error & { code?: string; availableStock?: number }).code === 'EXCEEDS_AVAILABLE_STOCK') {
        const count = (err as Error & { code?: string; availableStock?: number }).availableStock ?? availableStock ?? 1;
        toast.error(tCart('maxStockReached', { count }));
        return;
      }

      toast.error(tCart('itemAddFailed'));
    } finally {
      setIsAdding(false);
    }
  }, [addItem, availableStock, isAdding, locale, product, quantity, remainingStock, router, tCart, variant]);

  if (isLoading) {
    return (
      <div className="space-y-8 py-8">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="aspect-square w-full rounded-2xl lg:col-span-5" />
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">{t('notFound')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('notFoundHint')}</p>
        <Button className="mt-6" onClick={() => router.push('/store')}>
          {t('backToStore')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6">
      <ProductHeader product={product} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ProductGallery images={product.images} name={product.nameEn} />
        </div>

        <div className="lg:col-span-4">
          <ProductSpecifications specifications={product.specifications} />
        </div>

        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <ProductPriceCard
              product={product}
              selection={selection}
              onSelect={handleSelect}
              variant={variant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              inCartQuantity={inCartQuantity}
              remainingStock={remainingStock}
              isAdding={isAdding}
            />
          </div>
        </div>
      </div>

      <ProductDescription
        description={localizedField(product, 'description', locale)}
        warranty={product.warranty}
      />

      <RelatedProducts slug={slug} />
    </div>
  );
}