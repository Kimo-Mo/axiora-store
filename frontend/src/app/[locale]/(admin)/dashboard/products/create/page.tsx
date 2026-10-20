'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api/error';
import {
  PhysicalProductBasicInfo,
  type PhysicalProductFormData,
} from '@/components/admin/products/PhysicalProductBasicInfo';
import {
  ProductImageUploader,
  type ManagedProductImage,
} from '@/components/admin/products/ProductImageUploader';
import {
  ProductVariantManager,
  type LocalVariantDraft,
} from '@/components/admin/products/ProductVariantManager';
import { ProductSpecificationsRepeater } from '@/components/admin/products/ProductSpecificationsRepeater';
import { adminApi } from '@/services/admin/adminApi';
import type { SpecificationDto } from '@/types/admin';
import { useQueryClient } from '@tanstack/react-query';
import { ADMIN_PRODUCTS_QUERY_KEY } from '@/hooks/admin/useProductMutations';
import { ADMIN_DASHBOARD_STATS_KEY } from '@/hooks/admin/useAdminDashboardStatsQuery';

export default function AdminProductCreatePage() {
  const router = useRouter();
  const t = useTranslations('admin.products');
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
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
    isActive: true, // Default to active per Clarification Q1
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
  });

  // Images
  const [images, setImages] = useState<ManagedProductImage[]>([]);

  // Variants (at least 1 required)
  const [variants, setVariants] = useState<LocalVariantDraft[]>([
    {
      sku: '',
      price: 0,
      compareAtPrice: null,
      costPrice: null,
      stockQuantity: 10,
      isDefault: true,
      isActive: true,
      attributeValues: [],
    },
  ]);

  // Specifications
  const [specifications, setSpecifications] = useState<SpecificationDto[]>([]);

  const handleBasicInfoChange = (fields: Partial<PhysicalProductFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      // Keep first variant SKU in sync if not manually changed
      if (fields.sku && variants.length === 1 && (!variants[0].sku || variants[0].sku.startsWith(prev.sku))) {
        setVariants([
          {
            ...variants[0],
            sku: fields.sku,
          },
        ]);
      }
      return next;
    });

    // Clear related errors
    if (Object.keys(fields).some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(fields).forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nameAr.trim()) newErrors.nameAr = t('errors.nameArRequired');
    if (!formData.nameEn.trim()) newErrors.nameEn = t('errors.nameEnRequired');
    if (!formData.slug.trim()) newErrors.slug = t('errors.slugRequired');
    if (!formData.sku.trim()) newErrors.sku = t('errors.skuRequired');
    if (!formData.categoryId) newErrors.categoryId = t('errors.categoryRequired');
    if (!formData.brandId) newErrors.brandId = t('errors.brandRequired');

    if (variants.length === 0) {
      toast.error(t('errors.atLeastOneVariant'));
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.sku.trim()) {
        toast.error(t('errors.variantSkuRequired', { index: i + 1 }));
        return;
      }
      if (v.price <= 0) {
        toast.error(t('errors.variantPriceRequired', { sku: v.sku || `#${i + 1}` }));
        return;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('errors.fixForm'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the master physical product
      const created = await adminApi.createProduct({
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
        currency: 'EGP',
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
      });

      const productId = created.id;

      // 2. Add uploaded gallery images
      for (const img of images) {
        await adminApi.addProductImage(productId, {
          url: img.url,
          publicId: img.publicId,
          alt: img.alt || null,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        });
      }

      // 3. Create configured variants
      for (const variant of variants) {
        await adminApi.createVariant(productId, {
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          costPrice: variant.costPrice,
          stockQuantity: variant.stockQuantity,
          isDefault: variant.isDefault,
          isActive: variant.isActive,
          attributeValues: variant.attributeValues,
        });
      }

      // 4. Save specifications if any
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
        setIsSubmitting(false);
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
      if (cleanSpecs.length > 0) {
        await adminApi.replaceSpecifications(productId, cleanSpecs);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });

      toast.success(t('messages.createSuccess'));
      router.push('/dashboard/products');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t('messages.createFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t('createTitle', { defaultValue: 'Create New Physical Product' })}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('createSubtitle', {
                defaultValue:
                  'Enter bilingual catalog details, images, initial inventory variants, and specifications.',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/dashboard/products">
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Link>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.saving', { defaultValue: 'Creating Product...' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('common.save', { defaultValue: 'Save & Publish Product' })}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Form Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Information */}
        <PhysicalProductBasicInfo
          data={formData}
          onChange={handleBasicInfoChange}
          errors={errors}
          disabled={isSubmitting}
        />

        {/* 2. Media Gallery */}
        <ProductImageUploader
          images={images}
          onChange={setImages}
          disabled={isSubmitting}
        />

        {/* 3. Product Variants */}
        <ProductVariantManager
          variants={variants}
          onLocalVariantsChange={setVariants}
          disabled={isSubmitting}
        />

        {/* 4. Technical Specifications */}
        <ProductSpecificationsRepeater
          specifications={specifications}
          onChange={setSpecifications}
          disabled={isSubmitting}
        />

        {/* Bottom submit button */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/dashboard/products">
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Link>
          </Button>

          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.saving', { defaultValue: 'Creating Product...' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('common.save', { defaultValue: 'Save & Publish Product' })}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
