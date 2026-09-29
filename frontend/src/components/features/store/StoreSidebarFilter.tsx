'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { ProductCategory, ProductTag } from '@/types';

export interface StoreFilterState {
  category?: string[];
  tag?: string[];
  is_popular: boolean;
  is_available: boolean;
  price_min: number;
  price_max: number;
  ordering: string;
}

interface StoreSidebarFilterProps {
  className?: string;
  filters: StoreFilterState;
  search: string;
  setSearch: (search: string) => void;
  onChange: (filters: StoreFilterState) => void;
}

export default function StoreSidebarFilter({
  className,
  filters,
  search,
  setSearch,
  onChange,
}: StoreSidebarFilterProps) {
  const { data: categoriesResponse } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: () => catalogService.publicCategoriesList(),
  });

  const { data: tagsResponse } = useQuery({
    queryKey: ['publicTags'],
    queryFn: () => catalogService.publicTagsList(),
  });

  const categories: ProductCategory[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : categoriesResponse?.data || [];
  const tags: ProductTag[] = Array.isArray(tagsResponse) ? tagsResponse : tagsResponse?.data || [];

  const handleCategoryChange = (slug: string, checked: boolean) => {
    onChange({
      ...filters,
      category: checked
        ? [...(filters.category || []), slug]
        : (filters.category || []).filter((categorySlug) => categorySlug !== slug),
    });
  };

  const handleTagChange = (slug: string, checked: boolean) => {
    onChange({
      ...filters,
      tag: checked
        ? [...(filters.tag || []), slug]
        : (filters.tag || []).filter((tagSlug) => tagSlug !== slug),
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 bg-card border-border"
        />
      </div>

      {/* Stock & Popularity */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
          <Checkbox
            checked={filters.is_available}
            onCheckedChange={(checked) => onChange({ ...filters, is_available: !!checked })}
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
        <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
          <Checkbox
            checked={filters.is_popular}
            onCheckedChange={(checked) => onChange({ ...filters, is_popular: !!checked })}
          />
          <span className="text-sm font-medium">Popular Items</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-2">
        <h4 className="font-semibold text-sm">Price Range (EGP)</h4>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Input
            type="number"
            id="filter-min-price"
            value={filters.price_min}
            onChange={(e) => onChange({ ...filters, price_min: Number(e.target.value) })}
            className="w-full border-border text-sm h-10 text-center"
          />
          <span>-</span>
          <Input
            type="number"
            id="filter-max-price"
            value={filters.price_max}
            onChange={(e) => onChange({ ...filters, price_max: Number(e.target.value) })}
            className="w-full border-border text-sm h-10 text-center"
          />
        </div>
      </div>

      {/* Accordions (Categories, Tags) */}
      <div className="pt-2">
        <Accordion type="single" defaultValue="categories" className="w-full space-y-2">
          {/* Categories */}
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="hover:no-underline py-3 px-0 font-semibold text-sm cursor-pointer">
              Categories
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3 py-1 ps-1 max-h-48 overflow-y-auto scrollbar-hide">
                {categories.length === 0 ? (
                  <div className="text-sm">None available.</div>
                ) : (
                  categories.map((c) => (
                    <label key={c.id} className="flex items-center space-x-3 cursor-pointer"> rtl:space-x-reverse
                      <Checkbox
                        checked={(filters.category || []).includes(c.slug)}
                        onCheckedChange={(checked) => handleCategoryChange(c.slug, !!checked)}
                      />
                      <span
                        className={`capitalize ${(filters.category || []).includes(c.slug) ? 'text-primary font-bold' : ''}`}
                      >
                        {c.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tags */}
          <AccordionItem value="tags" className="border-none">
            <AccordionTrigger className="hover:no-underline py-3 px-0 font-semibold text-sm cursor-pointer">
              Tags
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3 py-1 ps-1 max-h-48 overflow-y-auto scrollbar-hide">
                {tags.length === 0 ? (
                  <div className="text-sm">None available.</div>
                ) : (
                  tags.map((t) => (
                    <label key={t.id} className="flex items-center space-x-3 cursor-pointer"> rtl:space-x-reverse
                      <Checkbox
                        checked={(filters.tag || []).includes(t.slug)}
                        onCheckedChange={(checked) => handleTagChange(t.slug, !!checked)}
                      />
                      <span
                        className={`capitalize ${(filters.tag || []).includes(t.slug) ? 'text-primary font-bold' : ''}`}
                      >
                        {t.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Clear Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full font-semibold"
          onClick={() => {
            setSearch('');
            onChange({
              category: [],
              tag: [],
              is_popular: false,
              is_available: false,
              price_min: 0,
              price_max: 9999,
              ordering: 'price',
            });
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
