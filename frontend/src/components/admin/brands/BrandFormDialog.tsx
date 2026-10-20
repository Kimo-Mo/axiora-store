'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/admin/adminApi';
import { getApiErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';
import type { AdminBrandDto } from '@/types/admin';

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: AdminBrandDto | null;
  onSubmit: (data: {
    nameAr: string;
    nameEn: string;
    slug: string;
    logo?: string | null;
    isActive?: boolean;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface BrandFormBodyProps {
  brand?: AdminBrandDto | null;
  onSubmit: BrandFormDialogProps['onSubmit'];
  onCancel: () => void;
  isSubmitting: boolean;
}

function BrandFormBody({ brand, onSubmit, onCancel, isSubmitting }: BrandFormBodyProps) {
  const t = useTranslations('admin.brands');
  const tToasts = useTranslations('admin.toasts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nameAr, setNameAr] = useState(brand ? brand.nameAr : '');
  const [nameEn, setNameEn] = useState(brand ? brand.nameEn : '');
  const [slug, setSlug] = useState(brand ? brand.slug : '');
  const [logo, setLogo] = useState<string | null>(brand?.logo ?? null);
  const [isActive, setIsActive] = useState(brand ? brand.isActive : true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAutoSlug = () => {
    const source = nameEn || nameAr;
    if (source) setSlug(generateSlug(source));
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(tToasts('imageFileRequired'));
      return;
    }

    setIsUploadingLogo(true);
    try {
      const results = await adminApi.uploadBatch([file], 'axiora/brands');
      if (results.length > 0) {
        setLogo(results[0].url);
        toast.success(tToasts('brandLogoUploaded'));
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, tToasts('brandLogoUploadFailed')));
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nameAr.trim()) newErrors.nameAr = t('errors.nameArRequired');
    if (!nameEn.trim()) newErrors.nameEn = t('errors.nameEnRequired');
    if (!slug.trim()) newErrors.slug = t('errors.slugRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      slug: slug.trim().toLowerCase(),
      logo,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Bilingual Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="brand-nameAr" className="text-xs font-medium">
            {t('fields.nameAr', { defaultValue: 'Brand Name (Arabic)' })} *
          </Label>
          <Input
            id="brand-nameAr"
            dir="rtl"
            placeholder="مثال: آبل"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className={errors.nameAr ? 'border-destructive' : ''}
          />
          {errors.nameAr && <p className="text-[11px] text-destructive">{errors.nameAr}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="brand-nameEn" className="text-xs font-medium">
            {t('fields.nameEn', { defaultValue: 'Brand Name (English)' })} *
          </Label>
          <Input
            id="brand-nameEn"
            dir="ltr"
            placeholder="e.g. Apple"
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (!slug) setSlug(generateSlug(e.target.value));
            }}
            className={errors.nameEn ? 'border-destructive' : ''}
          />
          {errors.nameEn && <p className="text-[11px] text-destructive">{errors.nameEn}</p>}
        </div>
      </div>

      {/* Slug */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="brand-slug" className="text-xs font-medium">
            {t('fields.slug', { defaultValue: 'URL Slug' })} *
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-primary gap-1"
            onClick={handleAutoSlug}
          >
            <Sparkles className="h-2.5 w-2.5" />
            {t('fields.autoSlug')}
          </Button>
        </div>
        <Input
          id="brand-slug"
          dir="ltr"
          placeholder="apple"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={errors.slug ? 'border-destructive' : ''}
        />
        {errors.slug && <p className="text-[11px] text-destructive">{errors.slug}</p>}
      </div>

      {/* Logo upload */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          {t('fields.logo', { defaultValue: 'Brand Logo' })}
        </Label>
        <div className="flex items-center gap-3">
          {logo ? (
            <div className="relative h-16 w-16 rounded-md border border-border overflow-hidden bg-background shrink-0 p-1">
              <Image src={logo} alt="Brand Logo" fill className="object-contain" />
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="absolute top-1 inset-e-1 bg-destructive/90 text-white p-0.5 rounded shadow-sm hover:bg-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-16 w-24 rounded-md border border-dashed border-border/80 hover:border-primary/60 bg-muted/10 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              {isUploadingLogo ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <>
                  <UploadCloud className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">{t('fields.uploadLogo')}</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
            }}
          />
          <p className="text-[11px] text-muted-foreground">
            {t('fields.logoHint')}
          </p>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/10 pt-1">
        <div>
          <Label htmlFor="brand-active" className="text-xs font-medium cursor-pointer">
            {t('fields.active', { defaultValue: 'Active Status' })}
          </Label>
          <span className="text-[10px] text-muted-foreground block">
            {isActive ? t('fields.activeDescOn') : t('fields.activeDescOff')}
          </span>
        </div>
        <Switch id="brand-active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <DialogFooter className="pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting || isUploadingLogo}>
          {isSubmitting
            ? t('common.saving', { defaultValue: 'Saving...' })
            : brand
            ? t('common.update', { defaultValue: 'Update Brand' })
            : t('common.create', { defaultValue: 'Create Brand' })}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BrandFormDialog({
  open,
  onOpenChange,
  brand,
  onSubmit,
  isSubmitting = false,
}: BrandFormDialogProps) {
  const t = useTranslations('admin.brands');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {brand
              ? t('dialog.editTitle', { defaultValue: 'Edit Brand' })
              : t('dialog.createTitle', { defaultValue: 'Create New Brand' })}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('dialog.description', {
              defaultValue: 'Add bilingual brand names, transparent logo, and availability status.',
            })}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BrandFormBody
            key={brand ? brand.id : 'new-brand'}
            brand={brand}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
