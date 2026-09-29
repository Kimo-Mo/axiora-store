'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProductGalleryProps {
  images: { id: number; image: string; is_main: boolean }[] | undefined;
  name: string;
}

export const ProductGallery = ({ images, name }: ProductGalleryProps) => {
  const allImages = images && images.length > 0 ? images : [];
  const mainIndex = allImages.findIndex((img) => img.is_main);
  const [activeIndex, setActiveIndex] = useState(mainIndex >= 0 ? mainIndex : 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const activeImage = allImages[activeIndex]?.image || '/placeholder-product.png';

  const goToPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    },
    [allImages.length]
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    },
    [allImages.length]
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const lightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Display */}
      <div
        className="relative group aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted/30 border border-border cursor-zoom-in"
        onClick={() => openLightbox(activeIndex)}
      >
        <Image
          key={activeImage}
          src={getImageUrl(activeImage)}
          alt={name}
          fill
          className="object-contain transition-all duration-500"
          priority
          unoptimized
        />

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 bg-black/50 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Prev/Next arrows — only show if more than 1 image */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all backdrop-blur-sm z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all backdrop-blur-sm z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot indicator for mobile */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`block w-1.5 h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails — only render if more than 1 image */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border">
          {allImages.map((img, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={img.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'border-primary shadow-[0_0_0_2px] shadow-primary/40 scale-[1.04]'
                    : 'border-border hover:border-primary/60 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={getImageUrl(img.image)}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-0.5"
                  unoptimized
                />
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none rounded-[10px]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-black/95 border-none shadow-none p-0 flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">Image Gallery — {name}</DialogTitle>
          <DialogDescription className="sr-only">Full-size image viewer</DialogDescription>
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] flex items-center justify-center">
            {allImages[lightboxIndex] && (
              <Image
                src={getImageUrl(allImages[lightboxIndex].image)}
                alt={`${name} — image ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
              />
            )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={lightboxNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          {/* Lightbox thumbnails */}
          <div className="flex gap-2 py-3 px-4 overflow-x-auto max-w-full">
            {allImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === lightboxIndex ? 'border-primary opacity-100' : 'border-white/20 opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={getImageUrl(img.image)}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </button>
            ))}
          </div>
          <div className="text-white/50 text-xs pb-4">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
