'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2, Save, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  PhysicalProductBasicInfo,
  type PhysicalProductFormData,
} from '@/components/admin/products/PhysicalProductBasicInfo';
import {
  ProductImageUploader,
  type ManagedProductImage,
} from '@/components/admin/products/ProductImageUploader';
import { ProductVariantManager } from '@/components/admin/products/ProductVariantManager';
import { ProductSpecificationsRepeater } from '@/components/admin/products/ProductSpecificationsRepeater';
import { DeleteProductDialog } from '@/components/admin/products/DeleteProductDialog';
import { adminApi } from '@/services/admin/adminApi';
import type { SpecificationDto } from '@/types/admin';
import { useAdminProductQuery, useDeleteProductMutation, ADMIN_PRODUCTS_QUERY_KEY } from '@/hooks/admin/useProductMutations';
import { ADMIN_DASHBOARD_STATS_KEY } from '@/hooks/admin/useAdminDashboardStatsQuery';
import { getApiErrorMessage } from '@/lib/api/error';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminProductEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const t = useTranslations('admin.products');
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteProductMutation();

  const { data: product, isLoading, isError } = useAdminProductQuery(id);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Basic Information
  const [formData, setFormData] = useState<PhysicalProductFormData>({
    nameAr: '',
    nameEn: '',
    slug: '',
    sku: '',
    categoryId: '',
    brandId: '',
    shortDescriptionAr: '',
    shortDescriptionEn: '',
    descriptionAr: '',
    descriptionEn: '',
    warranty: '',
    isActive: true,
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
  });

  // Images
  const [images, setImages] = useState<ManagedProductImage[]>([]);

  // Specifications
  const [specifications, setSpecifications] = useState<SpecificationDto[]>([]);

  // Populate data when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        slug: product.slug,
        sku: product.sku,
        categoryId: product.categoryId || product.category?.id || '',
        brandId: product.brandId || product.brand?.id || '',
        shortDescriptionAr: product.shortDescriptionAr ?? '',
        shortDescriptionEn: product.shortDescriptionEn ?? '',
        descriptionAr: product.descriptionAr ?? '',
        descriptionEn: product.descriptionEn ?? '',
        warranty: product.warranty ?? '',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
      });

      setImages(
        product.images.map((img) => ({
          id: img.id,
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        }))
      );

      setSpecifications(
        product.specifications.map((spec) => ({
          id: spec.id,
          keyAr: spec.keyAr,
          keyEn: spec.keyEn,
          valueAr: spec.valueAr,
          valueEn: spec.valueEn,
          sortOrder: spec.sortOrder,
        }))
      );
    }
  }, [product]);

  const handleBasicInfoChange = (fields: Partial<PhysicalProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    if (Object.keys(fields).some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(fields).forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const newErrors: Record<string, string> = {};
    if (!formData.nameAr.trim()) newErrors.nameAr = t('errors.nameArRequired');
    if (!formData.nameEn.trim()) newErrors.nameEn = t('errors.nameEnRequired');
    if (!formData.slug.trim()) newErrors.slug = t('errors.slugRequired');
    if (!formData.sku.trim()) newErrors.sku = t('errors.skuRequired');
    if (!formData.categoryId) newErrors.categoryId = t('errors.categoryRequired');
    if (!formData.brandId) newErrors.brandId = t('errors.brandRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('errors.fixForm'));
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update basic product fields
      await adminApi.updateProduct(id, {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        slug: formData.slug.trim().toLowerCase(),
        sku: formData.sku.trim().toUpperCase(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        shortDescriptionAr: formData.shortDescriptionAr.trim() || null,
        shortDescriptionEn: formData.shortDescriptionEn.trim() || null,
        descriptionAr: formData.descriptionAr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        warranty: formData.warranty.trim() || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
      });

      // 2. Sync Images:
      // Remove any images that were deleted from state
      const initialImageIds = new Set(product.images.map((img) => img.id));
      const currentImageIds = new Set(images.filter((img) => img.id).map((img) => img.id!));

      for (const initialId of initialImageIds) {
        if (!currentImageIds.has(initialId)) {
          await adminApi.deleteProductImage(id, initialId);
        }
      }

      // Add any newly uploaded images that don't have an ID yet
      for (const img of images) {
        if (!img.id) {
          await adminApi.addProductImage(id, {
            url: img.url,
            publicId: img.publicId,
            alt: img.alt || null,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          });
        }
      }

      // Reorder images to preserve the admin's intended arrangement from `images` state
      const savedProduct = await adminApi.getProduct(id);
      if (savedProduct.images.length > 1) {
        const orderedIds = images
          .map((item) => {
            const match = savedProduct.images.find(
              (si) =>
                (item.id && si.id === item.id) ||
                (item.publicId && si.publicId === item.publicId) ||
                si.url === item.url
            );
            return match?.id;
          })
          .filter((imgId): imgId is string => Boolean(imgId));

        for (const si of savedProduct.images) {
          if (!orderedIds.includes(si.id)) {
            orderedIds.push(si.id);
          }
        }

        if (orderedIds.length > 1) {
          await adminApi.reorderProductImages(id, orderedIds);
        }
      }

      // 3. Save Specifications
      const incompleteSpecs = specifications.filter(
        (s) =>
          (s.keyAr.trim() || s.keyEn.trim() || s.valueAr.trim() || s.valueEn.trim()) &&
          !(s.keyAr.trim() && s.keyEn.trim() && s.valueAr.trim() && s.valueEn.trim())
      );
      if (incompleteSpecs.length > 0) {
        toast.error(
          t('errors.incompleteSpecifications', {
            defaultValue: 'Please fill all Arabic and English fields for each specification, or remove empty rows.',
          })
        );
        setIsSaving(false);
        return;
      }

      const cleanSpecs = specifications
        .filter((s) => s.keyAr.trim() && s.keyEn.trim() && s.valueAr.trim() && s.valueEn.trim())
        .map((s, idx) => ({
          keyAr: s.keyAr.trim(),
          keyEn: s.keyEn.trim(),
          valueAr: s.valueAr.trim(),
          valueEn: s.valueEn.trim(),
          sortOrder: s.sortOrder ?? idx,
        }));
      await adminApi.replaceSpecifications(id, cleanSpecs);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });

      toast.success(t('messages.updateSuccess'));
      router.push('/dashboard/products');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('messages.updateFailed')));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {t('common.loading', { defaultValue: 'Loading product details...' })}
        </p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-base font-semibold text-destructive">
          {t('common.notFound', { defaultValue: 'Product not found' })}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4 me-1.5 rtl:rotate-180" />
            {t('common.backToList', { defaultValue: 'Back to Products' })}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{product.nameEn}</h1>
              {product.isActive ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  {t('status.active', { defaultValue: 'Active' })}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                  {t('status.inactive', { defaultValue: 'Inactive' })}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              SKU: <span className="font-mono">{product.sku}</span> • {product.variants.length}{' '}
              {t('variants.countLabel', { defaultValue: 'variants' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              {t('links.viewStorefront', { defaultValue: 'View in Store' })}
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSaving}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('common.delete', { defaultValue: 'Delete' })}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.saving', { defaultValue: 'Saving...' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('common.saveChanges', { defaultValue: 'Save Changes' })}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Edit Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Basic Information */}
        <PhysicalProductBasicInfo
          data={formData}
          onChange={handleBasicInfoChange}
          errors={errors}
          disabled={isSaving}
        />

        {/* 2. Media Gallery */}
        <ProductImageUploader
          images={images}
          onChange={setImages}
          disabled={isSaving}
        />

        {/* 3. Product Variants */}
        <ProductVariantManager
          productId={product.id}
          variants={product.variants}
          disabled={isSaving}
        />

        {/* 4. Technical Specifications */}
        <ProductSpecificationsRepeater
          specifications={specifications}
          onChange={setSpecifications}
          disabled={isSaving}
        />

        {/* Bottom submit button */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            disabled={isSaving}
          >
            <Link href="/dashboard/products">
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Link>
          </Button>

          <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.saving', { defaultValue: 'Saving...' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('common.saveChanges', { defaultValue: 'Save Changes' })}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete product dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={product}
        deleting={deleteMutation.isPending}
        onConfirm={async () => {
          if (product) {
            await deleteMutation.mutateAsync(product.id);
            setDeleteDialogOpen(false);
            router.push('/dashboard/products');
          }
        }}
      />
    </div>
  );
}
