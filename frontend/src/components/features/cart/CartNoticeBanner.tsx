'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { CartNotice } from '@/types/cart';

interface CartNoticeBannerProps {
  notices: CartNotice[];
}

export default function CartNoticeBanner({ notices }: CartNoticeBannerProps) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  const handleDismiss = (key: string) => {
    setDismissedKeys((prev) => new Set(prev).add(key));
  };

  const visibleNotices = notices.filter(
    (notice, idx) => !dismissedKeys.has(`${notice.variantId}-${idx}`)
  );

  if (visibleNotices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleNotices.map((notice, idx) => {
        const isOutOfStock = notice.type === 'OUT_OF_STOCK';
        const isPriceChange = notice.type === 'PRICE_CHANGED';
        const noticeKey = `${notice.variantId}-${idx}`;

        const message = locale === 'ar' ? notice.messageAr : notice.messageEn;
        const productName = locale === 'ar' ? notice.productNameAr : notice.productNameEn;

        return (
          <div
            key={noticeKey}
            role="alert"
            className={`flex items-start justify-between p-4 rounded-xl border text-sm transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : isPriceChange
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-primary/10 border-primary/30 text-foreground'
            }`}>
            <div className="flex items-start gap-3">
              {isOutOfStock ? (
                <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              ) : isPriceChange ? (
                <Info className="size-5 shrink-0 text-amber-500 mt-0.5" />
              ) : (
                <AlertTriangle className="size-5 shrink-0 text-primary mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold leading-tight">
                  {isOutOfStock
                    ? t('outOfStockWarning', { name: productName })
                    : isPriceChange
                      ? t('priceChangedNotice')
                      : t('stockCappedNotice', { name: productName, count: notice.newValue ?? 1 })}
                </p>
                {message && <p className="text-xs opacity-90">{message}</p>}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDismiss(noticeKey)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              aria-label="Dismiss notice">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
