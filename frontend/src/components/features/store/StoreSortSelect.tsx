'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATALOG_SORT_OPTIONS, type CatalogSort } from '@/types/catalog';

interface StoreSortSelectProps {
  value: CatalogSort;
  onChange: (value: CatalogSort) => void;
  className?: string;
  /** Hidden on the narrow layout, where the control sits full width instead. */
  showLabel?: boolean;
}

/** Every option maps 1:1 to a backend `sort` value, so the label is the contract. */
const SORT_LABELS: Record<CatalogSort, string> = {
  newest: 'newest',
  price_asc: 'priceLowHigh',
  price_desc: 'priceHighLow',
  name_asc: 'nameLowHigh',
  name_desc: 'nameHighLow',
  bestseller: 'bestseller',
};

export default function StoreSortSelect({ value, onChange, className, showLabel = true }: StoreSortSelectProps) {
  const t = useTranslations('store');

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      {showLabel && <span className="hidden shrink-0 font-bold md:inline">{t('sortBy')}</span>}
      <Select value={value} onValueChange={(next) => onChange(next as CatalogSort)}>
        <SelectTrigger className="w-full min-w-44 border-border font-medium" aria-label={t('sortBy')}>
          <SelectValue placeholder={t('sortBy')} />
        </SelectTrigger>
        <SelectContent>
          {CATALOG_SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(SORT_LABELS[option])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}