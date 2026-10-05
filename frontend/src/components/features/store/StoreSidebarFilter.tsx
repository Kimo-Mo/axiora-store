'use client';

import { useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PublicBrand, PublicCategory } from '@/types/catalog';
import { localized } from '@/types/catalog';

/**
 * Hydration-safe mounted check using useSyncExternalStore (React 19 / Compiler compliant).
 */
const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * The store filter panel (FR-002, FR-009, FR-010).
 *
 * Presentational and fully controlled: it renders whatever `value` says and reports
 * every change upward. The URL is the only place filter state lives, so this
 * component must never hold a second copy of it — otherwise the two drift and the
 * link the shopper shares stops reproducing what they see.
 */

export interface StoreFilterValue {
  /** Single category slug. The backend expands it to include every descendant. */
  category?: string;
  /** Brand slugs, OR-ed together. */
  brands: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
}

interface StoreSidebarFilterProps {
  categories: PublicCategory[];
  brands: PublicBrand[];
  value: StoreFilterValue;
  onChange: (next: StoreFilterValue) => void;
  onClear: () => void;
  className?: string;
  /** Disambiguates element IDs when both desktop sidebar and mobile drawer are mounted. */
  idPrefix?: string;
  /** Hides the search field — the mobile drawer shows search in the page header. */
  showSearch?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  priceBounds: { min: number; max: number };
}

export function categoriesToOptions(categories: PublicCategory[]): Array<PublicCategory & { depth: number }> {
  const options: Array<PublicCategory & { depth: number }> = [];
  const walk = (nodes: PublicCategory[], depth: number) => {
    for (const node of nodes) {
      options.push({ ...node, depth });
      if (node.children.length > 0) walk(node.children, depth + 1);
    }
  };
  walk(categories, 0);
  return options;
}

export default function StoreSidebarFilter({
  categories,
  brands,
  value,
  onChange,
  onClear,
  className,
  idPrefix = 'desktop',
  showSearch = false,
  search = '',
  onSearchChange,
  priceBounds,
}: StoreSidebarFilterProps) {
  const t = useTranslations('store');
  const locale = useLocale();
  const mounted = useMounted();

  const options = categoriesToOptions(categories);

  const toggleBrand = (slug: string, checked: boolean) => {
    onChange({
      ...value,
      brands: checked ? [...value.brands, slug] : value.brands.filter((entry) => entry !== slug),
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {showSearch && onSearchChange && (
        <Input
          id={`${idPrefix}-search-input`}
          name="search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="h-10"
        />
      )}

      <fieldset className="flex flex-col gap-2.5" suppressHydrationWarning>
        <legend className="mb-1 text-sm font-semibold text-foreground">{t('categories')}</legend>
        {!mounted ? (
          <div className="flex flex-col gap-2 py-1">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        ) : options.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('noneAvailable')}</p>
        ) : (
          <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pe-1">
            <label htmlFor={`${idPrefix}-cat-all`} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                id={`${idPrefix}-cat-all`}
                name="category"
                checked={!value.category}
                onCheckedChange={(checked) => checked && onChange({ ...value, category: undefined })}
              />
              <span className={cn(!value.category && 'font-semibold text-primary')}>{t('allCategories')}</span>
            </label>
            {options.map((option) => {
              const checked = value.category === option.slug;
              const inputId = `${idPrefix}-cat-${option.id}`;
              return (
                <label
                  key={option.id}
                  htmlFor={inputId}
                  // Indentation follows document direction, so the tree reads the
                  // same mirrored in Arabic (Constitution Principle V).
                  style={{ paddingInlineStart: `${option.depth * 0.875 + 0.625}rem` }}
                  className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <Checkbox
                    id={inputId}
                    name="category"
                    checked={checked}
                    onCheckedChange={(next) => next && onChange({ ...value, category: option.slug })}
                  />
                  <span className={cn('truncate', checked && 'font-semibold text-primary')}>
                    {localized(option, locale)}
                  </span>
                  {option.productCount > 0 && (
                    <span className="ms-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">
                      {option.productCount}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2.5" suppressHydrationWarning>
        <legend className="mb-1 text-sm font-semibold text-foreground">{t('brands')}</legend>
        {!mounted ? (
          <div className="flex flex-col gap-2 py-1">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        ) : brands.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('noneAvailable')}</p>
        ) : (
          <div className="flex max-h-56 flex-col gap-2.5 overflow-y-auto pe-1">
            {brands.map((brand) => {
              const checked = value.brands.includes(brand.slug);
              const inputId = `${idPrefix}-brand-${brand.id}`;
              return (
                <label key={brand.id} htmlFor={inputId} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <Checkbox
                    id={inputId}
                    name="brands"
                    checked={checked}
                    onCheckedChange={(next) => toggleBrand(brand.slug, next === true)}
                  />
                  <span className={cn('truncate', checked && 'font-semibold text-primary')}>
                    {localized(brand, locale)}
                  </span>
                  <span className="ms-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {brand.productCount}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2.5" suppressHydrationWarning>
        <legend className="mb-1 text-sm font-semibold text-foreground">{t('priceRange')}</legend>
        <div className="flex items-center gap-2">
          <Input
            id={`${idPrefix}-min-price`}
            name="minPrice"
            type="number"
            inputMode="numeric"
            min={priceBounds.min}
            max={priceBounds.max}
            step={100}
            value={value.minPrice ?? priceBounds.min}
            onChange={(event) => onChange({ ...value, minPrice: Number(event.target.value) })}
            aria-label={t('minPrice')}
            placeholder={t('minPrice')}
            className="h-10 text-center"
          />
          <span aria-hidden="true" className="text-muted-foreground">
            —
          </span>
          <Input
            id={`${idPrefix}-max-price`}
            name="maxPrice"
            type="number"
            inputMode="numeric"
            min={priceBounds.min}
            max={priceBounds.max}
            step={100}
            value={value.maxPrice ?? priceBounds.max}
            onChange={(event) => onChange({ ...value, maxPrice: Number(event.target.value) })}
            aria-label={t('maxPrice')}
            placeholder={t('maxPrice')}
            className="h-10 text-center"
          />
        </div>
      </fieldset>

      <label htmlFor={`${idPrefix}-in-stock`} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <Checkbox
          id={`${idPrefix}-in-stock`}
          name="inStock"
          checked={value.inStock}
          onCheckedChange={(checked) => onChange({ ...value, inStock: checked === true })}
        />
        {t('inStockOnly')}
      </label>

      <Button type="button" variant="outline" className="w-full font-semibold" onClick={onClear}>
        {t('clearFilters')}
      </Button>
    </div>
  );
}