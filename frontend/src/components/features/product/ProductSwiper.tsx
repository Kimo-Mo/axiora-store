'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui';
import { Product } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSwiperProps {
  products?: Product[];
  isLoading?: boolean;
  error?: unknown;
  skeletonCount?: number;
}

export default function ProductSwiper({
  products,
  isLoading,
  error,
  skeletonCount = 6,
}: ProductSwiperProps) {
  const count = products?.length ?? 0;
  // Always loop if there's more than 1 item
  const shouldLoop = count > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: shouldLoop,
      align: 'center',
      skipSnaps: false,
      breakpoints: {
        '(min-width: 768px)': { align: 'start' }
      }
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(!shouldLoop);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(!shouldLoop);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load products. Please check if the API is running.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-10 px-4">
        {[...Array(skeletonCount)].map((_, i) => (
          <Skeleton key={i} className="flex-shrink-0 w-[70vw] sm:w-[240px] md:w-[280px] h-[300px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!count) {
    return <div className="text-center py-10 text-muted-foreground">No products found.</div>;
  }

  return (
    <div className="relative group py-6 -mx-4 sm:mx-0">
      {/* Edge Gradients for stunning depth (hidden on tablet/desktop for a cleaner grid look) */}
      <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
      <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />

      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y" style={{ backfaceVisibility: 'hidden' }}>
          {(products ?? []).map((product, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={`${product.slug ?? index}-${index}`}
                className="flex-none min-w-0 w-[70%] sm:w-[50%] md:w-[35%] lg:w-[25%] xl:w-[20%]"
              >
                {/* The scaling effect wrapper (3D focus on mobile, standard grid on tablet/desktop) */}
                <div
                  className={`h-full w-full px-2 transition-all duration-500 ease-out py-4 md:scale-100 md:opacity-100 md:blur-none md:drop-shadow-none md:z-10 ${isActive
                    ? 'scale-100 opacity-100 z-10 drop-shadow-2xl'
                    : 'scale-90 opacity-40 z-0 blur-[2px]'
                    }`}
                >
                  <ProductCard product={product} priority={index <= 4} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons (Desktop) */}
      <div className="hidden md:block">
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/90 backdrop-blur-md border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-primary hover:text-white hover:scale-110 shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/90 backdrop-blur-md border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-primary hover:text-white hover:scale-110 shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
