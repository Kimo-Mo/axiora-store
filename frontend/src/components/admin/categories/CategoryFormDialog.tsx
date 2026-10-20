'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/admin/adminApi';
import { getApiErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';
import type { AdminCategoryDto } from '@/types/admin';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategoryDto | null;
  defaultParentId?: string | null;
  allCategories: AdminCategoryDto[];
  onSubmit: (data: {
    nameAr: string;
    nameEn: string;
    slug: string;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    parentId?: string | null;
    image?: string | null;
    sortOrder?: number;
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

interface FormBodyProps {
  category?: AdminCategoryDto | null;
  defaultParentId?: string | null;
  allCategories: AdminCategoryDto[];
  onSubmit: CategoryFormDialogProps['onSubmit'];
  onCancel: () => void;
  isSubmitting: boolean;
}

function CategoryFormBody({
  category,
  defaultParentId,
  allCategories,
  onSubmit,
  onCancel,
  isSubmitting,
}: FormBodyProps) {
  const t = useTranslations('admin.categories');
  const tToasts = useTranslations('admin.toasts');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nameAr, setNameAr] = useState(category ? category.nameAr : '');
  const [nameEn, setNameEn] = useState(category ? category.nameEn : '');
  const [slug, setSlug] = useState(category ? category.slug : '');
  const [descriptionAr, setDescriptionAr] = useState(category?.descriptionAr ?? '');
  const [descriptionEn, setDescriptionEn] = useState(category?.descriptionEn ?? '');
  const [parentId, setParentId] = useState<string>(
    category ? (category.parentId ?? 'root') : (defaultParentId ?? 'root')
  );
  const [image, setImage] = useState<string | null>(category?.image ?? null);
  const [sortOrder, setSortOrder] = useState(category ? String(category.sortOrder) : '0');
  const [isActive, setIsActive] = useState(category ? category.isActive : true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAutoSlug = () => {
    const source = nameEn || nameAr;
    if (source) setSlug(generateSlug(source));
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(tToasts('imageFileRequired'));
      return;
    }

    setIsUploadingImage(true);
    try {
      const results = await adminApi.uploadBatch([file], 'axiora/categories');
      if (results.length > 0) {
        setImage(results[0].url);
        toast.success(tToasts('categoryImageUploaded'));
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, tToasts('categoryImageUploadFailed')));
    } finally {
      setIsUploadingImage(false);
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
      descriptionAr: descriptionAr.trim() || null,
      descriptionEn: descriptionEn.trim() || null,
      parentId: parentId === 'root' ? null : parentId,
      image,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    });
  };

  // Flatten categories for parent selection (exclude current category)
  const flattenCategories = (cats: AdminCategoryDto[], result: AdminCategoryDto[] = []) => {
    for (const c of cats) {
      if (!category || c.id !== category.id) {
        result.push(c);
        if (c.children) flattenCategories(c.children, result);
      }
    }
    return result;
  };

  const availableParents = flattenCategories(allCategories);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Bilingual Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cat-nameAr" className="text-xs font-medium">
            {t('fields.nameAr', { defaultValue: 'Category Name (Arabic)' })} *
          </Label>
          <Input
            id="cat-nameAr"
            dir="rtl"
            placeholder="مثال: هواتف ذكية"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className={errors.nameAr ? 'border-destructive' : ''}
          />
          {errors.nameAr && <p className="text-[11px] text-destructive">{errors.nameAr}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="cat-nameEn" className="text-xs font-medium">
            {t('fields.nameEn', { defaultValue: 'Category Name (English)' })} *
          </Label>
          <Input
            id="cat-nameEn"
            dir="ltr"
            placeholder="e.g. Smartphones"
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

      {/* Slug & Parent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="cat-slug" className="text-xs font-medium">
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
              Auto
            </Button>
          </div>
          <Input
            id="cat-slug"
            dir="ltr"
            placeholder="smartphones"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={errors.slug ? 'border-destructive' : ''}
          />
          {errors.slug && <p className="text-[11px] text-destructive">{errors.slug}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="cat-parent" className="text-xs font-medium">
            {t('fields.parent', { defaultValue: 'Parent Category' })}
          </Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger id="cat-parent">
              <SelectValue placeholder="Root Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">
                {t('fields.noParent', { defaultValue: '— None (Root Category) —' })}
              </SelectItem>
              {availableParents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {isAr ? parent.nameAr : parent.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          {t('fields.image', { defaultValue: 'Category Cover Image' })}
        </Label>
        <div className="flex items-center gap-3">
          {image ? (
            <div className="relative h-16 w-16 rounded-md border border-border overflow-hidden bg-muted/20 shrink-0">
              <Image src={image} alt="Category" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-1 inset-e-1 bg-destructive/90 text-white p-0.5 rounded shadow-sm hover:bg-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-16 w-28 rounded-md border border-dashed border-border/80 hover:border-primary/60 bg-muted/10 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              {isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <>
                  <UploadCloud className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
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
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
            }}
          />
          <p className="text-[11px] text-muted-foreground">
            Optional square cover image used for storefront collection banners.
          </p>
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cat-descAr" className="text-xs font-medium">
            {t('fields.descAr', { defaultValue: 'Description (Arabic)' })}
          </Label>
          <Textarea
            id="cat-descAr"
            dir="rtl"
            rows={2}
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cat-descEn" className="text-xs font-medium">
            {t('fields.descEn', { defaultValue: 'Description (English)' })}
          </Label>
          <Textarea
            id="cat-descEn"
            dir="ltr"
            rows={2}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />
        </div>
      </div>

      {/* Sort Order & Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <Label htmlFor="cat-sort" className="text-xs font-medium">
            {t('fields.sortOrder', { defaultValue: 'Sort Order' })}
          </Label>
          <Input
            id="cat-sort"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/10 self-end">
          <div>
            <Label htmlFor="cat-active" className="text-xs font-medium cursor-pointer">
              {t('fields.active', { defaultValue: 'Active Status' })}
            </Label>
            <span className="text-[10px] text-muted-foreground block">
              {isActive ? 'Visible in store navigation' : 'Hidden from store'}
            </span>
          </div>
          <Switch id="cat-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <DialogFooter className="pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting || isUploadingImage}>
          {isSubmitting
            ? t('common.saving', { defaultValue: 'Saving...' })
            : category
            ? t('common.update', { defaultValue: 'Update Category' })
            : t('common.create', { defaultValue: 'Create Category' })}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultParentId,
  allCategories,
  onSubmit,
  isSubmitting = false,
}: CategoryFormDialogProps) {
  const t = useTranslations('admin.categories');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category
              ? t('dialog.editTitle', { defaultValue: 'Edit Category' })
              : t('dialog.createTitle', { defaultValue: 'Create New Category' })}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('dialog.description', {
              defaultValue:
                'Set bilingual category names, hierarchical parent category, slug, and status.',
            })}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CategoryFormBody
            key={category ? category.id : `new-${defaultParentId ?? 'root'}`}
            category={category}
            defaultParentId={defaultParentId}
            allCategories={allCategories}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
