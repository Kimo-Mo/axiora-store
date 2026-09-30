'use client';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useTranslations } from 'next-intl';

interface StoreSortSelectProps {
  className?: string;
  value: string;
  onChange: (val: string) => void;
}

export default function StoreSortSelect({ className, value, onChange }: StoreSortSelectProps) {
  const t = useTranslations('store');

  const sortOptions = [
    { label: t('priceLowHigh'), value: 'price' },
    { label: t('priceHighLow'), value: '-price' },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-4 text-sm whitespace-nowrap overflow-x-auto scrollbar-hide',
        className
      )}>
      <span className="hidden md:inline font-bold shrink-0">{t('sortBy')}</span>
      <div className="flex items-center gap-6">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-45 bg-card border-border font-medium">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
