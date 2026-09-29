'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProductSecondaryImagesProps {
  images: { id: number; image: string; is_main: boolean }[] | undefined;
  name: string;
}

export const ProductSecondaryImages = ({ images, name }: ProductSecondaryImagesProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const secondaryImages = images?.filter((img) => !img.is_main) || [];

  if (secondaryImages.length === 0) return null;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? secondaryImages.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === secondaryImages.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-base font-bold text-foreground">Gallery</h3>
      <div className="flex flex-wrap gap-3">
        {secondaryImages.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(index)}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border group hover:border-primary transition-all">
            <Image
              src={getImageUrl(img.image)}
              alt={`${name} gallery image ${index + 1}`}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
          </button>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(isOpen) => !isOpen && setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl bg-transparent border-none shadow-none p-0 flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>
          <DialogDescription className="sr-only">View images of {name}</DialogDescription>
          
          <div className="relative w-full aspect-square md:aspect-[16/9] flex items-center justify-center">
            {selectedIndex !== null && (
              <Image
                src={getImageUrl(secondaryImages[selectedIndex].image)}
                alt={`${name} gallery image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
              />
            )}
            
            {secondaryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm md:-top-10 md:-right-10">
            <X className="w-5 h-5" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

