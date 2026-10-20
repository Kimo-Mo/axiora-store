'use client';

import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import type { VariantDto, VariantAttributeInput } from '@/types/admin';

export interface VariantFormData {
  sku: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  stockQuantity: string;
  isDefault: boolean;
  isActive: boolean;
  attributeValues: VariantAttributeInput[];
}

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: VariantDto | null;
  onSubmit: (data: {
    sku: string;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    stockQuantity: number;
    isDefault: boolean;
    isActive: boolean;
    attributeValues: VariantAttributeInput[];
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

const COMMON_ATTRIBUTES = [
  { slug: 'color', labelAr: 'اللون', labelEn: 'Color' },
  { slug: 'storage', labelAr: 'المساحة', labelEn: 'Storage' },
  { slug: 'ram', labelAr: 'الرام', labelEn: 'RAM' },
  { slug: 'size', labelAr: 'المقاس', labelEn: 'Size' },
];

interface VariantFormBodyProps {
  variant?: VariantDto | null;
  onSubmit: VariantFormDialogProps['onSubmit'];
  onCancel: () => void;
  isSubmitting: boolean;
}

function VariantFormBody({
  variant,
  onSubmit,
  onCancel,
  isSubmitting,
}: VariantFormBodyProps) {
  const t = useTranslations('admin.products');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [sku, setSku] = useState(variant ? variant.sku : '');
  const [price, setPrice] = useState(variant ? String(variant.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(variant?.compareAtPrice ? String(variant.compareAtPrice) : '');
  const [costPrice, setCostPrice] = useState(variant?.costPrice ? String(variant.costPrice) : '');
  const [stockQuantity, setStockQuantity] = useState(variant ? String(variant.stockQuantity) : '10');
  const [isDefault, setIsDefault] = useState(variant ? variant.isDefault : false);
  const [isActive, setIsActive] = useState(variant ? variant.isActive : true);
  const [attributeValues, setAttributeValues] = useState<VariantAttributeInput[]>(
    variant
      ? (variant.attributeValues as Array<VariantAttributeInput & { attribute?: { slug?: string } }> || []).map((av) => ({
          attributeSlug: av.attributeSlug || av.attribute?.slug || '',
          valueAr: av.valueAr ?? '',
          valueEn: av.valueEn ?? '',
        }))
      : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddAttribute = (slug = 'color') => {
    setAttributeValues((prev) => [
      ...prev,
      { attributeSlug: slug || '', valueAr: '', valueEn: '' },
    ]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributeValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (
    index: number,
    field: keyof VariantAttributeInput,
    val: string
  ) => {
    setAttributeValues((prev) =>
      prev.map((attr, i) => {
        if (i === index) {
          return { ...attr, [field]: val };
        }
        return attr;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!sku.trim()) {
      newErrors.sku = t('errors.variantsSkuRequired');
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = t('errors.variantsPriceRequired');
    }

    let numCompareAt: number | null = null;
    if (compareAtPrice.trim()) {
      numCompareAt = parseFloat(compareAtPrice);
      if (isNaN(numCompareAt) || numCompareAt <= 0) {
        newErrors.compareAtPrice = t('errors.variantsCompareAtInvalid');
      } else if (!isNaN(numPrice) && numCompareAt <= numPrice) {
        newErrors.compareAtPrice = t('errors.variantsCompareAtNotGreater');
      }
    }

    let numCost: number | null = null;
    if (costPrice.trim()) {
      numCost = parseFloat(costPrice);
      if (isNaN(numCost) || numCost < 0) {
        newErrors.costPrice = t('errors.variantsCostNegative');
      }
    }

    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      newErrors.stockQuantity = t('errors.variantsStockNegative');
    }

    for (let i = 0; i < attributeValues.length; i++) {
      const attr = attributeValues[i];
      const slugVal = (attr?.attributeSlug ?? '').trim();
      const valAr = (attr?.valueAr ?? '').trim();
      const valEn = (attr?.valueEn ?? '').trim();

      if (!slugVal) {
        newErrors[`attr_${i}_slug`] = t('errors.variantsAttributeTypeRequired');
      }
      if (!valAr) {
        newErrors[`attr_${i}_ar`] = t('errors.variantsAttributeArRequired');
      }
      if (!valEn) {
        newErrors[`attr_${i}_en`] = t('errors.variantsAttributeEnRequired');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      sku: sku.trim().toUpperCase(),
      price: numPrice,
      compareAtPrice: numCompareAt,
      costPrice: numCost,
      stockQuantity: numStock,
      isDefault,
      isActive,
      attributeValues: attributeValues.map((av) => ({
        attributeSlug: (av.attributeSlug || '').trim().toLowerCase(),
        valueAr: (av.valueAr || '').trim(),
        valueEn: (av.valueEn || '').trim(),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* SKU & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="variant-sku" className="text-xs font-medium">
            {t('variants.sku', { defaultValue: 'Variant SKU' })} *
          </Label>
          <Input
            id="variant-sku"
            dir="ltr"
            placeholder="e.g. IPH15-BLK-256"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            className={errors.sku ? 'border-destructive' : ''}
          />
          {errors.sku && <p className="text-[11px] text-destructive">{errors.sku}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="variant-stock" className="text-xs font-medium">
            {t('variants.stock', { defaultValue: 'Stock Quantity' })} *
          </Label>
          <Input
            id="variant-stock"
            type="number"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            className={errors.stockQuantity ? 'border-destructive' : ''}
          />
          {errors.stockQuantity && (
            <p className="text-[11px] text-destructive">{errors.stockQuantity}</p>
          )}
        </div>
      </div>

      {/* Pricing: Price, Compare-at, Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="variant-price" className="text-xs font-medium">
            {t('variants.price', { defaultValue: 'Selling Price (EGP)' })} *
          </Label>
          <Input
            id="variant-price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && <p className="text-[11px] text-destructive">{errors.price}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="variant-compare" className="text-xs font-medium">
            {t('variants.compareAtPrice', { defaultValue: 'Compare Price (EGP)' })}
          </Label>
          <Input
            id="variant-compare"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className={errors.compareAtPrice ? 'border-destructive' : ''}
          />
          {errors.compareAtPrice && (
            <p className="text-[11px] text-destructive">{errors.compareAtPrice}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="variant-cost" className="text-xs font-medium">
            {t('variants.costPrice', { defaultValue: 'Cost Price (EGP)' })}
          </Label>
          <Input
            id="variant-cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className={errors.costPrice ? 'border-destructive' : ''}
          />
          {errors.costPrice && (
            <p className="text-[11px] text-destructive">{errors.costPrice}</p>
          )}
        </div>
      </div>

      {/* Switches: Default variant & Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/10">
          <div>
            <Label htmlFor="variant-default" className="text-xs font-medium cursor-pointer">
              {t('variants.isDefault', { defaultValue: 'Default Variant' })}
            </Label>
            <span className="text-[10px] text-muted-foreground block">
              {t('variants.isDefaultDesc', { defaultValue: 'Pre-selected option on storefront' })}
            </span>
          </div>
          <Switch
            id="variant-default"
            checked={isDefault}
            onCheckedChange={setIsDefault}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/10">
          <div>
            <Label htmlFor="variant-active" className="text-xs font-medium cursor-pointer">
              {t('variants.isActive', { defaultValue: 'Active Status' })}
            </Label>
            <span className="text-[10px] text-muted-foreground block">
              {t('variants.isActiveDesc', { defaultValue: 'Purchasable by customers' })}
            </span>
          </div>
          <Switch
            id="variant-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      {/* Attributes section */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-semibold">
              {t('variants.attributes', { defaultValue: 'Attributes & Options' })}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t('variants.attributesSubtitle', {
                defaultValue: 'Color, Storage, or custom specs distinguishing this variant.',
              })}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {COMMON_ATTRIBUTES.map((common) => (
              <Button
                key={common.slug}
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleAddAttribute(common.slug)}
              >
                + {isAr ? common.labelAr : common.labelEn}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => handleAddAttribute('')}
            >
              <Plus className="h-3 w-3 me-1" />
              {t('common.custom', { defaultValue: 'Custom' })}
            </Button>
          </div>
        </div>

        {attributeValues.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-md bg-muted/10">
            {t('variants.noAttributes', {
              defaultValue: 'No attributes added. Single-option variant.',
            })}
          </p>
        ) : (
          <div className="space-y-2">
            {attributeValues.map((attr, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-md border border-border/80 bg-background"
              >
                <div className="w-1/3">
                  <Input
                    placeholder={t('common.attributeSlugPlaceholder')}
                    dir="ltr"
                    value={attr.attributeSlug || ''}
                    onChange={(e) => handleAttributeChange(idx, 'attributeSlug', e.target.value)}
                    className={`text-xs h-8 ${errors[`attr_${idx}_slug`] ? 'border-destructive' : ''}`}
                  />
                </div>
                <div className="w-1/3">
                  <Input
                    placeholder={t('common.attributeValueArPlaceholder')}
                    dir="rtl"
                    value={attr.valueAr || ''}
                    onChange={(e) => handleAttributeChange(idx, 'valueAr', e.target.value)}
                    className={`text-xs h-8 ${errors[`attr_${idx}_ar`] ? 'border-destructive' : ''}`}
                  />
                </div>
                <div className="w-1/3">
                  <Input
                    placeholder={t('common.attributeValueEnPlaceholder')}
                    dir="ltr"
                    value={attr.valueEn || ''}
                    onChange={(e) => handleAttributeChange(idx, 'valueEn', e.target.value)}
                    className={`text-xs h-8 ${errors[`attr_${idx}_en`] ? 'border-destructive' : ''}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveAttribute(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting
            ? t('common.saving', { defaultValue: 'Saving...' })
            : variant
            ? t('common.update', { defaultValue: 'Update Variant' })
            : t('common.create', { defaultValue: 'Add Variant' })}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VariantFormDialog({
  open,
  onOpenChange,
  variant,
  onSubmit,
  isSubmitting = false,
}: VariantFormDialogProps) {
  const t = useTranslations('admin.products');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {variant
              ? t('variants.editTitle', { defaultValue: 'Edit Variant' })
              : t('variants.createTitle', { defaultValue: 'Add New Variant' })}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('variants.dialogDescription', {
              defaultValue:
                'Configure SKU, pricing in EGP, inventory stock, and bilingual variant attributes.',
            })}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <VariantFormBody
            key={variant ? variant.id : 'create-new'}
            variant={variant}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
