'use client';

import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { ShoppingCart, Zap, Headphones, ShieldCheck, Tag, Clock } from 'lucide-react';
import { Product } from '@/types';
import { useEffect, useRef, useState } from 'react';

interface ProductPriceCardProps {
  product: Product;
  onAddToCart: () => void;
  onBuyNow: () => void;
  showAddToCart?: boolean;
  buyButtonText?: string;
}

export const ProductPriceCard = ({
  product,
  onAddToCart,
  onBuyNow,
  showAddToCart = true,
  buyButtonText = 'Buy Now',
}: ProductPriceCardProps) => {
  const hasPrice = product.price !== null && product.price !== undefined;
  const fulfillmentTime = product.manual_fulfillment_time ?? 'Instant';
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCardVisible, setIsCardVisible] = useState(true);

  const displayPrice = Number(product.price);
  const originalPrice = product.price_before_offer
    ? Number(product.price_before_offer)
    : Number(product.price);
  const hasDiscount = !!product.price_before_offer && Number(product.price_before_offer) > Number(product.price);
  const discountPct = product.offer_value ? Number(product.offer_value).toFixed(0) : null;
  const currencySymbol = product.currency === 'USD' ? '$' : (product.currency ?? '$');

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsCardVisible(isVisible);
        // Notify global ScrollToTopButton so it can shift above the sticky bar
        window.dispatchEvent(
          new CustomEvent('stickybar:change', { detail: { visible: !isVisible } })
        );
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      // Clean up: tell ScrollToTopButton the bar is gone when component unmounts
      window.dispatchEvent(
        new CustomEvent('stickybar:change', { detail: { visible: false } })
      );
    };
  }, []);

  return (
    <>
      {/* ── Main price card ── */}
      <div ref={cardRef} className="space-y-3 lg:sticky lg:top-24">
        <Card className="overflow-hidden border-2 border-border bg-card shadow-xl">

          {/* Discount banner — only shown when there's an offer */}
          {hasDiscount && discountPct && (
            <div className="bg-gradient-to-r from-destructive/80 to-rose-600/80 px-4 py-2 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-bold tracking-wide uppercase">
                Limited offer — Save {discountPct}%
              </span>
            </div>
          )}

          <div className="p-5">
            {/* Price label */}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Price
            </p>

            {hasPrice ? (
              <div className="mb-4">
                {hasDiscount ? (
                  <>
                    {/* Strikethrough original */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground line-through decoration-destructive/70 decoration-2">
                        {currencySymbol} {originalPrice.toFixed(2)}
                      </span>
                      {discountPct && (
                        <span className="bg-destructive text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                    {/* Final price */}
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-black tracking-tight text-foreground leading-none">
                        {currencySymbol} {displayPrice.toFixed(2).split('.')[0]}
                      </span>
                      <span className="text-2xl font-black text-foreground pb-1">
                        .{displayPrice.toFixed(2).split('.')[1]}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black tracking-tight text-foreground leading-none">
                      {currencySymbol}{displayPrice.toFixed(2).split('.')[0]}
                    </span>
                    <span className="text-2xl font-black text-foreground pb-1">
                      .{displayPrice.toFixed(2).split('.')[1]}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground mb-4">Select a package</p>
            )}

            {/* Stock & Delivery row */}
            <div className="flex items-center justify-between mb-5 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.is_available ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]' : 'bg-destructive'}`} />
                <span className="text-xs font-semibold">
                  {product.is_available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">
                  {product.stock_mode === 'manual' ? `${fulfillmentTime} min` : 'Instant'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              {showAddToCart && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-none px-4 border-2 border-border hover:bg-muted hover:border-primary/50 transition-all"
                  onClick={onAddToCart}
                  disabled={!product.is_available}
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 font-bold text-base tracking-wide shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={onBuyNow}
                disabled={!product.is_available}
              >
                {buyButtonText}
              </Button>
            </div>
          </div>
        </Card>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-0 border-2 border-border bg-card rounded-2xl overflow-hidden shadow-md">
          {[
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: 'Instant', sub: 'Delivery', color: 'text-yellow-400' },
            { icon: <Headphones className="w-5 h-5 text-green-400" />, label: '24/7', sub: 'Support', color: 'text-green-400' },
            { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, label: 'Verified', sub: 'Seller', color: 'text-blue-400' },
          ].map(({ icon, label, sub }, i) => (
            <div key={i} className={`flex flex-col items-center gap-1.5 py-3.5 ${i !== 2 ? 'border-e border-border' : ''}`}>
              {icon}
              <div className="text-center">
                <p className="text-[11px] font-bold leading-none">{label}</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div
        className={`lg:hidden fixed bottom-0 start-0 end-0 z-50 transition-transform duration-300 ease-in-out ${isCardVisible ? 'translate-y-full' : 'translate-y-0'
          }`}
      >
        <div className="bg-card/95 backdrop-blur-lg border-t-2 border-border px-4 py-3 flex items-center gap-3 shadow-[0_-6px_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col flex-1 min-w-0">
            {hasPrice ? (
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground/50 uppercase tracking-tighter mb-0.5 leading-none">Price</span>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                  <span className="font-black text-2xl text-foreground leading-none tracking-tighter">
                    {currencySymbol} {displayPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground line-through decoration-destructive/60 decoration-1.5">
                        {currencySymbol} {originalPrice.toFixed(2)}
                      </span>
                      {discountPct && (
                        <span className="bg-destructive text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="font-bold text-sm text-muted-foreground">Select package</span>
            )}
          </div>
          {showAddToCart && (
            <Button
              size="default"
              variant="outline"
              className="flex-none px-4 h-12 border-2"
              onClick={onAddToCart}
              disabled={!product.is_available}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          )}
          <Button
            size="default"
            className="flex-1 h-12 bg-primary hover:bg-primary/90 font-black text-base shadow-lg shadow-primary/25 min-w-[130px]"
            onClick={onBuyNow}
            disabled={!product.is_available}
          >
            {buyButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
