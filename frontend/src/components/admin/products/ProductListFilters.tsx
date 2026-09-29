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
import type { ProductCategory } from '@/types/catalog';

interface ProductListFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  categories: ProductCategory[];
  productCount: number;
}

export function ProductListFilters({
  search,
  setSearch,
  categoryId,
  setCategoryId,
  categories,
  productCount,
}: ProductListFiltersProps) {
  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <CardTitle className="text-foreground">
          All Products{' '}
          {productCount > 0 && (
            <span className="text-muted-foreground font-normal text-sm ms-1">({productCount})</span>
          )}
        </CardTitle>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="products-search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 bg-background border-border h-9 text-sm"
            />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-40 h-9 bg-background border-border text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
  );
}
