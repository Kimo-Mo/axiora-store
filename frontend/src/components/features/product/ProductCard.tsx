'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Product, ProductImage } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/stores/useCartStore';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const category = product.categories?.[0]?.name ?? '';
  const href = `/product/${product.slug}`;

  // Pricing logic
  const displayPrice = Number(product.price ?? 0);
  const discountPercentFromApi = Number(product.discount_percent ?? 0);

  let originalPrice: number | null = null;
  if (product.price_before_offer !== null && product.price_before_offer !== undefined) {
    const parsed = Number(product.price_before_offer);
    if (!isNaN(parsed) && parsed > displayPrice) {
      originalPrice = parsed;
    }
  }
  if (!originalPrice && discountPercentFromApi > 0 && displayPrice > 0) {
    originalPrice = displayPrice / (1 - discountPercentFromApi / 100);
  }

  const hasDiscount =
    (originalPrice !== null && originalPrice > displayPrice) || discountPercentFromApi > 0;
  const discountPercent =
    discountPercentFromApi > 0
      ? discountPercentFromApi
      : hasDiscount
        ? Math.round(((originalPrice! - displayPrice) / originalPrice!) * 100)
        : 0;

  const currencySymbol = product.currency === 'USD' ? '$' : (product.currency || 'EGP');
  const isUnavailable = product.is_available === false;

  // ── Add to Cart ──
  const addItem = useCartStore((s) => s.addItem);
  const [cartState, setCartState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartState !== 'idle' || isUnavailable) return;
    setCartState('loading');
    await addItem(product, 1);
    setCartState('done');
    setTimeout(() => setCartState('idle'), 1800);
  };

  const mainImg = typeof product.main_image === 'string'
    ? product.main_image
    : (product.main_image as ProductImage)?.image;

  return (
    <Link href={href} className="product-card-link group h-full">
      <article className="product-card h-full">
        {/* ─── Discount ribbon ─── */}
        {hasDiscount && (
          <div className="discount-ribbon">
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* ─── Image ─── */}
        <div className="product-card-image-wrap">
          {mainImg ? (
            <Image
              src={getImageUrl(mainImg)}
              alt={product.name}
              fill
              priority={priority}
              className="product-card-img"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="product-card-no-img flex items-center justify-center h-full bg-muted">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="opacity-20"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="product-card-overlay" />

          {/* Out of stock overlay */}
          {isUnavailable && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <span className="px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase border-2 border-white/30 rounded-md">
                Out of Stock
              </span>
            </div>
          )}

          {/* ─── Add to Cart — Ribbon Banner ─── */}
          {!isUnavailable && (
            <div className="product-card-add-ribbon">
              <button
                onClick={handleAddToCart}
                className="product-card-ribbon-btn"
                aria-label="Add to cart"
              >
                <span className="ribbon-icon">
                  {cartState === 'loading' ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : cartState === 'done' ? (
                    <Check size={15} strokeWidth={3} />
                  ) : (
                    <ShoppingCart size={15} strokeWidth={1.8} />
                  )}
                  {cartState === 'idle' && <span className="ribbon-plus">+</span>}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ─── Info ─── */}
        <div className="product-card-info flex flex-col h-full">
          <div className="space-y-1 mb-2">
            <span className="product-card-category font-black tracking-tighter opacity-50">
              {category || 'Product'}
            </span>
            <h4 className="product-card-name line-clamp-2" title={product.name}>
              {product.name}
            </h4>
          </div>

          <div className="product-card-price-wrap mt-auto pt-2">
            <div className="product-card-price-row flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="product-card-price font-black text-lg leading-none">
                {currencySymbol} {displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-1.5">
                  <span className="product-card-original-price text-xs line-through opacity-40">
                    {currencySymbol} {originalPrice!.toFixed(2)}
                  </span>
                  <span className="product-card-discount-tag bg-destructive text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
