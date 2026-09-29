import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import type { ImageState } from './types';
import { getImageUrl } from '@/lib/utils';
import { useState } from 'react';

interface ProductImagesProps {
  images: ImageState[];
  handleImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setMainImage: (index: number) => void;
  removeImage: (index: number) => void;
  isEditMode?: boolean;
  imageError?: string;
}

export function ProductImages({
  images,
  handleImageAdd,
  setMainImage,
  removeImage,
  isEditMode = false,
  imageError,
}: ProductImagesProps) {
  const [failedIndexes, setFailedIndexes] = useState<number[]>([]);

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground text-base">Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer w-fit">
          <Button type="button" variant="outline" className="border-border gap-2" asChild>
            <span>
              <Upload className="h-4 w-4" />
              Upload Images
            </span>
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageAdd}
            className="hidden"
          />
        </label>
        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    failedIndexes.includes(i)
                      ? 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                      : img.file
                        ? img.url
                        : img.url
                          ? getImageUrl(img.url)
                          : 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                  }
                  alt={`preview-${i}`}
                  className={`w-20 h-20 object-cover rounded-lg border-2 transition-colors ${img.isMain ? 'border-primary' : 'border-border'}`}
                  onError={() =>
                    setFailedIndexes((prev) => (prev.includes(i) ? prev : [...prev, i]))
                  }
                />
                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMainImage(i)}
                    title="Set as main"
                    className="text-white text-xs bg-primary/80 rounded px-1.5 py-0.5">
                    Main
                  </button>
                  <button type="button" onClick={() => removeImage(i)} className="text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {img.isMain && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5">
                    Main
                  </Badge>
                )}
                {isEditMode && img.file && (
                  <Badge
                    variant="outline"
                    className="absolute -bottom-2 -right-2 bg-background shadow-sm text-[10px] px-1 border-primary/50 text-foreground">
                    New
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
        {isEditMode && (
          <p className="text-xs text-muted-foreground italic">
            * Any images removed here will be deleted when you save.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
