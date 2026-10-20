'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  UploadCloud,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { adminApi } from '@/services/admin/adminApi';
import { getApiErrorMessage } from '@/lib/api/error';

export interface ManagedProductImage {
  id?: string;
  url: string;
  publicId?: string | null;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductImageUploaderProps {
  images: ManagedProductImage[];
  onChange: (images: ManagedProductImage[]) => void;
  disabled?: boolean;
}

export function ProductImageUploader({
  images,
  onChange,
  disabled = false,
}: ProductImageUploaderProps) {
  const t = useTranslations('admin.products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (fileArray.length === 0) {
      toast.error(t('images.invalidType', { defaultValue: 'Please select valid image files (JPEG, PNG, WebP)' }));
      return;
    }

    if (images.length + fileArray.length > 10) {
      toast.error(t('images.maxLimit', { defaultValue: 'You can upload a maximum of 10 images per product' }));
      return;
    }

    setIsUploading(true);
    try {
      const uploadedAssets = await adminApi.uploadBatch(fileArray, 'axiora/products');

      const newImages: ManagedProductImage[] = uploadedAssets.map((asset, index) => ({
        url: asset.url,
        publicId: asset.publicId,
        alt: '',
        isPrimary: images.length === 0 && index === 0,
        sortOrder: images.length + index,
      }));

      const combined = [...images, ...newImages];
      // ensure at least one is primary if images exist
      if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
        combined[0].isPrimary = true;
      }

      onChange(combined);
      toast.success(t('images.uploadSuccess', { count: uploadedAssets.length }));
    } catch (error: unknown) {
      const errorMsg = getApiErrorMessage(
        error,
        t('images.uploadFailed', {
          defaultValue: 'Image upload failed. All temporary uploads were rolled back. Please retry.',
        })
      );
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const removedWasPrimary = images[index].isPrimary;
    const remaining = images.filter((_, i) => i !== index);

    if (removedWasPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }

    const reordered = remaining.map((img, idx) => ({ ...img, sortOrder: idx }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const normalized = reordered.map((img, idx) => ({ ...img, sortOrder: idx }));
    onChange(normalized);
  };

  const handleAltChange = (index: number, alt: string) => {
    const updated = images.map((img, i) => {
      if (i === index) return { ...img, alt };
      return img;
    });
    onChange(updated);
  };

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              {t('images.title', { defaultValue: 'Product Gallery & Media' })}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {t('images.subtitle', {
                defaultValue: 'Upload up to 10 images with automatic rollback on failure. Set a primary cover image.',
              })}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {images.length} / 10
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isUploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!disabled && !isUploading && e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => {
            if (!disabled && !isUploading && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-muted/20'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={disabled || isUploading || images.length >= 10}
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm font-medium text-foreground">
              {isUploading
                ? t('images.uploading', { defaultValue: 'Uploading assets to Cloudinary...' })
                : t('images.dragDrop', { defaultValue: 'Click or drag images to upload' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('images.hints', {
                defaultValue: 'Supports JPG, PNG, WebP up to 5MB each. Max 10 images.',
              })}
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {images.map((img, index) => (
              <div
                key={img.id || img.publicId || img.url}
                className={`relative group rounded-lg border overflow-hidden bg-background flex flex-col transition-all ${
                  img.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                {/* Image Preview */}
                <div className="relative aspect-square w-full bg-muted/30">
                  <Image
                    src={img.url}
                    alt={img.alt || t('images.imageAltFallback', { index: index + 1 })}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    className="object-cover"
                  />
                  {img.isPrimary && (
                    <Badge className="absolute top-1.5 inset-s-1.5 text-[10px] bg-primary text-primary-foreground gap-1 px-1.5 py-0.5">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {t('images.primaryBadge', { defaultValue: 'Primary' })}
                    </Badge>
                  )}
                </div>

                {/* Alt Text Input */}
                <div className="p-1.5 border-t border-border/50">
                  <Input
                    placeholder={t('images.altPlaceholder')}
                    value={img.alt || ''}
                    disabled={disabled}
                    onChange={(e) => handleAltChange(index, e.target.value)}
                    className="h-6 text-[11px] px-1.5"
                  />
                </div>

                {/* Actions Toolbar */}
                <div className="p-1 flex items-center justify-between border-t border-border/50 bg-muted/20">
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      disabled={disabled || index === 0}
                      onClick={() => handleMove(index, 'left')}
                      title={t('images.movePrevious')}
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      disabled={disabled || index === images.length - 1}
                      onClick={() => handleMove(index, 'right')}
                      title={t('images.moveNext')}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {!img.isPrimary && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-amber-500 hover:text-amber-600"
                        disabled={disabled}
                        onClick={() => handleSetPrimary(index)}
                        title={t('images.setPrimary')}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      disabled={disabled}
                      onClick={() => handleRemove(index)}
                      title={t('images.delete')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
