'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { flattenCategoryTree } from '@/lib/categories';
import type { AdminCategoryDto } from '@/types/admin';

interface ProductListFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categories: AdminCategoryDto[];
  productCount: number;
}

export function ProductListFilters({
  search,
  setSearch,
  categoryId,
  setCategoryId,
  statusFilter,
  setStatusFilter,
  categories,
  productCount,
}: ProductListFiltersProps) {
  const locale = useLocale();
  const t = useTranslations('admin.products');

  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <CardTitle className="text-foreground text-lg">
          {t('title')}{' '}
          {productCount > 0 && (
            <span className="text-muted-foreground font-normal text-sm ms-1">({productCount})</span>
          )}
        </CardTitle>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="products-search"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 bg-background border-border h-9 text-sm"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-44 h-9 bg-background border-border text-sm">
              <SelectValue placeholder={t('categoryFilter')} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">{t('categoryFilter')}</SelectItem>
              {flattenCategoryTree(categories).map(({ category, depth }) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className={depth > 0 ? 'ps-6' : undefined}
                >
                  {locale === 'ar' ? category.nameAr : category.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9 bg-background border-border text-sm">
              <SelectValue placeholder={t('statusFilter')} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">{t('statusFilter')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
  );
}
