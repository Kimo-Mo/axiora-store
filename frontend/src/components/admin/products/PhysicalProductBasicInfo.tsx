'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useAdminCategoriesQuery } from '@/hooks/admin/useCategoryMutations';
import { useAdminBrandsQuery } from '@/hooks/admin/useBrandMutations';
import { flattenCategoryTree } from '@/lib/categories';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PhysicalProductFormData {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  warranty: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

interface PhysicalProductBasicInfoProps {
  data: PhysicalProductFormData;
  onChange: (fields: Partial<PhysicalProductFormData>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function PhysicalProductBasicInfo({
  data,
  onChange,
  errors = {},
  disabled = false,
}: PhysicalProductBasicInfoProps) {
  const t = useTranslations('admin.products');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const { data: categories = [], isLoading: isLoadingCategories } = useAdminCategoriesQuery();
  const { data: brands = [], isLoading: isLoadingBrands } = useAdminBrandsQuery();

  const flattenedCategories = React.useMemo(() => flattenCategoryTree(categories), [categories]);
  const selectedCategory = flattenedCategories.find((c) => c.category.id === data.categoryId);
  const selectedBrand = brands.find((b) => b.id === data.brandId);

  const handleAutoSlug = () => {
    const source = data.nameEn || data.nameAr;
    if (source) {
      onChange({ slug: generateSlug(source) });
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Main Product Information ─── */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground">
            {t('form.basicInfoTitle', { defaultValue: 'General Information' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('form.basicInfoDescription', {
              defaultValue: 'Provide bilingual product names, identifiers, and brand/category hierarchy.',
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Bilingual Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nameAr" className="text-xs font-medium text-foreground">
                {t('fields.nameAr', { defaultValue: 'Product Name (Arabic)' })} *
              </Label>
              <Input
                id="nameAr"
                dir="rtl"
                placeholder="مثال: آيفون 15 برو ماكس"
                value={data.nameAr}
                disabled={disabled}
                onChange={(e) => onChange({ nameAr: e.target.value })}
                className={errors.nameAr ? 'border-destructive' : ''}
              />
              {errors.nameAr && <p className="text-[11px] text-destructive">{errors.nameAr}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nameEn" className="text-xs font-medium text-foreground">
                {t('fields.nameEn', { defaultValue: 'Product Name (English)' })} *
              </Label>
              <Input
                id="nameEn"
                dir="ltr"
                placeholder="e.g. iPhone 15 Pro Max"
                value={data.nameEn}
                disabled={disabled}
                onChange={(e) => {
                  const nameEn = e.target.value;
                  const updates: Partial<PhysicalProductFormData> = { nameEn };
                  if (!data.slug) {
                    updates.slug = generateSlug(nameEn);
                  }
                  onChange(updates);
                }}
                className={errors.nameEn ? 'border-destructive' : ''}
              />
              {errors.nameEn && <p className="text-[11px] text-destructive">{errors.nameEn}</p>}
            </div>
          </div>

          {/* Slug & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-xs font-medium text-foreground">
                  {t('fields.slug', { defaultValue: 'URL Slug' })} *
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[11px] text-primary gap-1"
                  onClick={handleAutoSlug}
                  disabled={disabled || (!data.nameEn && !data.nameAr)}
                >
                  <Sparkles className="h-3 w-3" />
                  {t('form.generateSlug', { defaultValue: 'Auto-generate' })}
                </Button>
              </div>
              <Input
                id="slug"
                dir="ltr"
                placeholder="iphone-15-pro-max"
                value={data.slug}
                disabled={disabled}
                onChange={(e) => onChange({ slug: e.target.value })}
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && <p className="text-[11px] text-destructive">{errors.slug}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs font-medium text-foreground">
                {t('fields.baseSku', { defaultValue: 'Base SKU' })} *
              </Label>
              <Input
                id="sku"
                dir="ltr"
                placeholder="APL-IPH15PM"
                value={data.sku}
                disabled={disabled}
                onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && <p className="text-[11px] text-destructive">{errors.sku}</p>}
            </div>
          </div>

          {/* Category & Brand Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-xs font-medium text-foreground">
                {t('fields.category', { defaultValue: 'Category' })} *
              </Label>
              <Select
                key={`cat-${data.categoryId || 'empty'}-${categories.length}`}
                value={data.categoryId || undefined}
                onValueChange={(val) => onChange({ categoryId: val })}
                disabled={disabled || isLoadingCategories}
              >
                <SelectTrigger id="categoryId" className={`w-full ${errors.categoryId ? 'border-destructive' : ''}`}>
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? t('common.loading', { defaultValue: 'Loading...' })
                        : t('fields.selectCategory', { defaultValue: 'Select a category' })
                    }
                  >
                    {selectedCategory ? (isAr ? selectedCategory.category.nameAr : selectedCategory.category.nameEn) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {flattenedCategories.map(({ category, depth }) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className={depth > 0 ? 'ps-6' : undefined}
                    >
                      {isAr ? category.nameAr : category.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-[11px] text-destructive">{errors.categoryId}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandId" className="text-xs font-medium text-foreground">
                {t('fields.brand', { defaultValue: 'Brand' })} *
              </Label>
              <Select
                key={`brand-${data.brandId || 'empty'}-${brands.length}`}
                value={data.brandId || undefined}
                onValueChange={(val) => onChange({ brandId: val })}
                disabled={disabled || isLoadingBrands}
              >
                <SelectTrigger id="brandId" className={`w-full ${errors.brandId ? 'border-destructive' : ''}`}>
                  <SelectValue
                    placeholder={
                      isLoadingBrands
                        ? t('common.loading', { defaultValue: 'Loading...' })
                        : t('fields.selectBrand', { defaultValue: 'Select a brand' })
                    }
                  >
                    {selectedBrand ? (isAr ? selectedBrand.nameAr : selectedBrand.nameEn) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {isAr ? b.nameAr : b.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brandId && <p className="text-[11px] text-destructive">{errors.brandId}</p>}
            </div>
          </div>

          {/* Warranty Info */}
          <div className="space-y-1.5">
            <Label htmlFor="warranty" className="text-xs font-medium text-foreground">
              {t('fields.warranty', { defaultValue: 'Warranty Policy' })}
            </Label>
            <Input
              id="warranty"
              placeholder={isAr ? 'مثال: ضمان الوكيل المحلي لمدة 12 شهر' : 'e.g. 12 Months Official Local Warranty'}
              value={data.warranty}
              disabled={disabled}
              onChange={(e) => onChange({ warranty: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Descriptions ─── */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground">
            {t('form.descriptionsTitle', { defaultValue: 'Product Descriptions' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('form.descriptionsSubtitle', {
              defaultValue: 'Provide bilingual short summaries for cards and full detailed descriptions.',
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Short Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shortDescAr" className="text-xs font-medium text-foreground">
                {t('fields.shortDescriptionAr', { defaultValue: 'Short Summary (Arabic)' })}
              </Label>
              <Textarea
                id="shortDescAr"
                dir="rtl"
                rows={3}
                placeholder="نبذة سريعة تظهر في كارت المنتج..."
                value={data.shortDescriptionAr}
                disabled={disabled}
                onChange={(e) => onChange({ shortDescriptionAr: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shortDescEn" className="text-xs font-medium text-foreground">
                {t('fields.shortDescriptionEn', { defaultValue: 'Short Summary (English)' })}
              </Label>
              <Textarea
                id="shortDescEn"
                dir="ltr"
                rows={3}
                placeholder="Brief summary shown on product card..."
                value={data.shortDescriptionEn}
                disabled={disabled}
                onChange={(e) => onChange({ shortDescriptionEn: e.target.value })}
              />
            </div>
          </div>

          {/* Full Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="descAr" className="text-xs font-medium text-foreground">
                {t('fields.descriptionAr', { defaultValue: 'Full Description (Arabic)' })}
              </Label>
              <Textarea
                id="descAr"
                dir="rtl"
                rows={6}
                placeholder="تفاصيل ومميزات المنتج الكاملة..."
                value={data.descriptionAr}
                disabled={disabled}
                onChange={(e) => onChange({ descriptionAr: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descEn" className="text-xs font-medium text-foreground">
                {t('fields.descriptionEn', { defaultValue: 'Full Description (English)' })}
              </Label>
              <Textarea
                id="descEn"
                dir="ltr"
                rows={6}
                placeholder="Full comprehensive details and features..."
                value={data.descriptionEn}
                disabled={disabled}
                onChange={(e) => onChange({ descriptionEn: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Merchandising & Status Flags ─── */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground">
            {t('form.flagsTitle', { defaultValue: 'Visibility & Merchandising' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('form.flagsSubtitle', { defaultValue: 'Control product status and promotional tags on storefront.' })}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 border border-border/70 rounded-lg bg-muted/10">
            <div>
              <Label htmlFor="flag-active" className="text-xs font-medium text-foreground block cursor-pointer">
                {t('fields.isActive', { defaultValue: 'Active Status' })}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {data.isActive
                  ? t('status.active', { defaultValue: 'Visible to customers' })
                  : t('status.inactive', { defaultValue: 'Hidden from store' })}
              </span>
            </div>
            <Switch
              id="flag-active"
              checked={data.isActive}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ isActive: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-border/70 rounded-lg bg-muted/10">
            <div>
              <Label htmlFor="flag-featured" className="text-xs font-medium text-foreground block cursor-pointer">
                {t('fields.isFeatured', { defaultValue: 'Featured' })}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {t('fields.isFeaturedDesc', { defaultValue: 'Show in featured section' })}
              </span>
            </div>
            <Switch
              id="flag-featured"
              checked={data.isFeatured}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ isFeatured: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-border/70 rounded-lg bg-muted/10">
            <div>
              <Label htmlFor="flag-new" className="text-xs font-medium text-foreground block cursor-pointer">
                {t('fields.isNew', { defaultValue: 'New Arrival' })}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {t('fields.isNewDesc', { defaultValue: 'Display new arrival badge' })}
              </span>
            </div>
            <Switch
              id="flag-new"
              checked={data.isNew}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ isNew: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-border/70 rounded-lg bg-muted/10">
            <div>
              <Label htmlFor="flag-bestseller" className="text-xs font-medium text-foreground block cursor-pointer">
                {t('fields.isBestSeller', { defaultValue: 'Bestseller' })}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {t('fields.isBestSellerDesc', { defaultValue: 'Highlight as popular seller' })}
              </span>
            </div>
            <Switch
              id="flag-bestseller"
              checked={data.isBestSeller}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ isBestSeller: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
