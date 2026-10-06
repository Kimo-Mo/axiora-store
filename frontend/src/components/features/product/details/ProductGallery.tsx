'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getImageUrl } from '@/lib/utils';
import type { PublicProductDetail } from '@/types/catalog';

/**
 * Image gallery (FR-006, FR-022).
 *
 * All arrows and the thumbnail strip use logical positioning (`start`/`end`, plus
 * an `rtl:` rotation on the chevrons) so the control reads identically in both
 * directions — the left arrow in Arabic is "previous" just as it is in English.
 */

type ProductImage = PublicProductDetail['images'][number];

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
  className?: string;
}

export const ProductGallery = ({ images, name, className }: ProductGalleryProps) => {
  const t = useTranslations('product');

  // The selected frame is tracked by image id, not by index. A refetch that returns
  // the same images in a different order — or a shorter list — then needs no reset
  // effect to stay pointing at the same picture.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div
        className={`flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-border bg-muted/30 ${className ?? ''}`}>
        <span className="text-sm text-muted-foreground">{t('gallery')}</span>
      </div>
    );
  }

  // Falls back to the first image whenever the remembered one is gone.
  const requestedIndex = selectedId ? images.findIndex((image) => image.id === selectedId) : -1;
  const activeIndex = requestedIndex >= 0 ? requestedIndex : 0;
  const active = images[activeIndex];
  const goTo = (index: number) => {
    const next = ((index % images.length) + images.length) % images.length;
    setSelectedId(images[next].id);
  };

  return (
    <div className={`flex w-full flex-col gap-3 ${className ?? ''}`}>
      <div
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-muted/30"
        onClick={() => setLightboxOpen(true)}>
        <Image
          key={active.id}
          src={getImageUrl(active.url)}
          alt={active.alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-contain transition-opacity duration-300"
          unoptimized
        />

        <span
          aria-hidden="true"
          className="absolute inset-e-3 top-3 rounded-lg bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-4" />
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goTo(activeIndex - 1);
              }}
              aria-label={t('previousImage')}
              className="absolute inset-s-2 top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100">
              <ChevronLeft className="size-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goTo(activeIndex + 1);
              }}
              aria-label={t('nextImage')}
              className="absolute inset-e-2 top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100">
              <ChevronRight className="size-5 rtl:rotate-180" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 inset-s-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden rtl:translate-x-1/2">
            {images.map((image, index) => (
              <span
                key={image.id}
                className={`block size-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'scale-125 bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${t('gallery')} ${index + 1}`}
                aria-current={isActive}
                className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-20 ${
                  isActive ? 'border-primary shadow-[0_0_0_2px] shadow-primary/40' : 'border-border opacity-70 hover:border-primary/60 hover:opacity-100'
                }`}>
                <Image
                  src={getImageUrl(image.url)}
                  alt={image.alt ?? `${name} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="flex max-w-5xl flex-col items-center border-none bg-black/95 p-0 shadow-none">
          <DialogTitle className="sr-only">{t('gallery')}</DialogTitle>
          <DialogDescription className="sr-only">{name}</DialogDescription>

          <div className="relative flex aspect-[4/3] w-full items-center justify-center md:aspect-[16/9]">
            <Image
              src={getImageUrl(active.url)}
              alt={active.alt ?? name}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  aria-label={t('previousImage')}
                  className="absolute inset-s-3 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25">
                  <ChevronLeft className="size-6 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  aria-label={t('nextImage')}
                  className="absolute inset-e-3 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25">
                  <ChevronRight className="size-6 rtl:rotate-180" />
                </button>
              </>
            )}
          </div>

          <p className="pb-4 text-xs text-white/50">
            {activeIndex + 1} / {images.length}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};