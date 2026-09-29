'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { useCartStore } from '@/lib/stores/useCartStore';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { getImageUrl } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const t = useTranslations('cart');
  const { updateQuantity, removeItem } = useCartStore();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (localQuantity === item.quantity) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void updateQuantity(item.id, localQuantity);
      debounceTimerRef.current = null;
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [item.id, item.quantity, localQuantity, updateQuantity]);

  const handleQuantityChange = (nextQuantity: number) => {
    setLocalQuantity(Math.max(1, nextQuantity));
  };

  const handleRemove = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    void removeItem(item.id);
  };

  if (!item?.product) {
    return null;
  }

  const mainImg = typeof item.product.main_image === 'string'
    ? item.product.main_image
    : item.product.main_image?.image;
  const imgSrc = mainImg || item.product.images?.[0]?.image;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-border">
      <div className="relative sm:h-24 h-60 sm:w-40 w-full overflow-hidden rounded-lg border border-border bg-muted">
        {imgSrc ? (
          <Image
            src={getImageUrl(imgSrc)}
            alt={item?.product.name}
            fill
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {t('noImage')}
          </div>
        )}
      </div>

      <div className="flex-1 w-full space-y-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none text-foreground capitalize">
              {item.product.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-secondary/50">
                {item.product.categories.length > 0
                  ? item.product.categories[0].name
                  : t('uncategorized')}
              </Badge>
            </div>
          </div>
          <div className="font-bold whitespace-nowrap hidden sm:block">
            {item.product.currency === 'USD' ? '$' : (item.product.currency || 'EGP')}{' '}
            {((item.product.price || 0) * localQuantity).toFixed(2)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center">
            <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-muted"
                onClick={() => handleQuantityChange(localQuantity - 1)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center text-sm font-medium text-foreground">
                {localQuantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-muted"
                onClick={() => handleQuantityChange(localQuantity + 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors"
            onClick={handleRemove}>
            <Trash2 className="h-4 w-4 me-2" />
            {t('remove')}
          </Button>
        </div>
      </div>
    </div>
  );
}
