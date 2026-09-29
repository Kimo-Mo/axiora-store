'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { useCartStore } from '@/lib/stores/useCartStore';
import { Button, Separator } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  ProductGallery,
  ProductHeader,
  ProductInfo,
  ProductPriceCard,
  ProductDescription,
} from '@/components/features/product';
import { ProductSpecifications } from '@/components/features/product/details/ProductSpecifications';
import { RelatedProducts } from '@/components/features/product/RelatedProducts';
import { getImageUrl } from '@/lib/utils';

interface ProductDetailClientProps {
  slug: string;
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogService.publicProductDetail(slug),
  });

  const onAddToCart = () => {
    if (!product) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const onBuyNow = async () => {
    if (!product) return;
    await clearCart();
    await addItem(product, 1);
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="py-8 space-y-8">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button onClick={() => router.push('/store')} className="mt-4">Return to Store</Button>
      </div>
    );
  }

  // Resolve hero background image (main image or first image)
  const heroImages = product.images ?? [];
  const heroImgObj =
    heroImages.find((img) => img.is_main) ?? heroImages[0] ?? null;
  const heroSrc = heroImgObj
    ? getImageUrl(heroImgObj.image)
    : typeof product.main_image === 'object' && product.main_image !== null
      ? getImageUrl((product.main_image as { image: string }).image)
      : null;

  return (
    // pb-20 lg:pb-0 reserves clearance for the mobile sticky bottom bar
    <div className="space-y-10 pb-20 lg:pb-0">

      {/* ──────────────────────────────────────────────────────────
          Hero Section — blurred product image as background
      ────────────────────────────────────────────────────────── */}
      <div className="relative -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 -mt-6 pt-6 pb-8 overflow-hidden">
        {/* Background artwork — positioned absolute with full coverage */}
        {heroSrc && (
          <>
            <div 
              className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover opacity-50 blur-[1.5px] scale-[1.5] md:scale-110 pointer-events-none select-none"
              style={{ backgroundImage: `url(${heroSrc})` }}
            />
            {/* 1. Vertical Gradient: Sharp focus at top, fades to background at bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
            
            {/* 2. Side Gradients: Blends the left/right edges into the background to hide image boundaries */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </>
        )}

        {/* Actual content sits above the blurred layer */}
        <div className="relative z-10 space-y-5">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/store" className="hover:text-primary transition-colors">Store</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>

          <ProductHeader product={product} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left — Gallery */}
            <div className="lg:col-span-5">
              <ProductGallery images={product.images} name={product.name} />
            </div>

            {/* Center — Specs & short info */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <ProductSpecifications product={product} className="w-full" />
              <Separator />
              {/* Short info: help note, short_description, tags only */}
              <ProductInfo product={product} hideDescription />
            </div>

            {/* Right — Price card */}
            <div className="lg:col-span-3">
              <ProductPriceCard product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          Below-the-fold section: About + Related (desktop side-by-side)
          On mobile: stacked — About first, Related at the bottom
      ────────────────────────────────────────────────────────── */}
      {(product.description || true) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Related Products — 1/3 on desktop, hidden on mobile (shown at bottom) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <RelatedProducts slug={slug} />
          </div>

          {/* About this product — 2/3 on desktop, full width on mobile */}
          <div id="product-full-description" className="lg:col-span-2">
            <ProductDescription description={product.description} />
          </div>
        </div>
      )}

      {/* ── Related Products on mobile (below price card) ── */}
      <div className="lg:hidden">
        <RelatedProducts slug={slug} />
      </div>
    </div>
  );
}
