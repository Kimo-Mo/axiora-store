'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { CartItemDto } from '@/types/cart';
import { DEFAULT_CURRENCY, MAX_CART_ITEM_QUANTITY } from '@/types/cart';
import { useCart } from '@/hooks/useCart';
import { Button, Badge } from '@/components/ui';
import { getImageUrl } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItemDto;
  currency?: string;
}

export default function CartItemRow({ item, currency = DEFAULT_CURRENCY }: CartItemRowProps) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { updateQuantity, removeItem } = useCart();
  const [prevQuantity, setPrevQuantity] = useState(item.quantity);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localQuantity when upstream item quantity changes (render phase per React recommendation)
  if (item.quantity !== prevQuantity) {
    setPrevQuantity(item.quantity);
    setLocalQuantity(item.quantity);
  }

  const productName = locale === 'ar' ? item.product.nameAr : item.product.nameEn;
  const isOutOfStock = !item.isAvailable || item.stockStatus === 'OUT_OF_STOCK';
  const isLowStock = item.stockStatus === 'LOW_STOCK';
  const maxStock = Math.min(MAX_CART_ITEM_QUANTITY, item.availableStock ?? MAX_CART_ITEM_QUANTITY);

  const handleQuantityChange = (nextQuantity: number) => {
    const clamped = Math.max(1, Math.min(nextQuantity, maxStock));
    setLocalQuantity(clamped);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void updateQuantity(item.id, clamped);
      debounceTimerRef.current = null;
    }, 300);
  };

  const handleRemove = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    void removeItem(item.id);
  };

  const attributeEntries = Object.entries(item.variant?.attributes || {});

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-border transition-colors">
      {/* Product Image Thumbnail */}
      <Link
        href={`/product/${item.product.slug}`}
        className="relative sm:h-24 h-48 sm:w-28 w-full overflow-hidden rounded-xl border border-border/80 bg-muted shrink-0 group">
        {item.product.primaryImage ? (
          <Image
            src={getImageUrl(item.product.primaryImage)}
            alt={productName}
            fill
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            {productName}
          </div>
        )}
      </Link>

      {/* Item Details */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/product/${item.product.slug}`}
              className="font-semibold text-base md:text-lg leading-snug text-foreground hover:text-primary transition-colors line-clamp-2">
              {productName}
            </Link>

            {/* Variant Attributes Tags */}
            {attributeEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {attributeEntries.map(([key, attr]) => {
                  const label = locale === 'ar' ? attr.nameAr : attr.nameEn;
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-secondary/60 text-secondary-foreground font-normal">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Stock Warnings */}
            {isOutOfStock && (
              <div className="flex items-center gap-1 text-xs font-medium text-destructive pt-1">
                <AlertCircle className="size-3.5" />
                <span>{t('outOfStockWarning', { name: productName })}</span>
              </div>
            )}
            {!isOutOfStock && isLowStock && (
              <p className="text-xs text-amber-500 pt-0.5">
                {t('maxStockReached', { count: item.availableStock })}
              </p>
            )}
          </div>

          {/* Unit / Total Price (desktop) */}
          <div className="text-end shrink-0 hidden sm:block">
            <div className="font-bold text-base md:text-lg text-foreground">
              {item.lineTotal.toFixed(2)} {currency}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-end gap-1.5">
              <span>{item.unitPrice.toFixed(2)} {currency}</span>
              {item.compareAtPrice && item.compareAtPrice > item.unitPrice && (
                <span className="line-through text-muted-foreground/60">
                  {item.compareAtPrice.toFixed(2)} {currency}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Stepper + Mobile Price + Remove */}
        <div className="flex items-center justify-between pt-2">
          {/* Stepper */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              disabled={localQuantity <= 1 || isOutOfStock}
              className="h-8 w-8 rounded-none hover:bg-muted"
              onClick={() => handleQuantityChange(localQuantity - 1)}
              aria-label="Decrease quantity">
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center text-sm font-semibold text-foreground">
              {localQuantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={localQuantity >= maxStock || isOutOfStock}
              className="h-8 w-8 rounded-none hover:bg-muted"
              onClick={() => handleQuantityChange(localQuantity + 1)}
              aria-label="Increase quantity">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile Price Display */}
          <div className="sm:hidden text-end">
            <div className="font-bold text-base text-foreground">
              {item.lineTotal.toFixed(2)} {currency}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-8 px-2"
            onClick={handleRemove}
            aria-label={t('remove')}>
            <Trash2 className="h-4 w-4 me-1.5" />
            <span className="text-xs font-medium">{t('remove')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
