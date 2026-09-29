'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import StoreSidebarFilter, {
  StoreFilterState,
} from '@/components/features/store/StoreSidebarFilter';
import MobileStoreFilter from '@/components/features/store/MobileStoreFilter';
import StoreSortSelect from '@/components/features/store/StoreSortSelect';
import ProductGrid from '@/components/features/product/ProductGrid';
import { catalogService } from '@/services/catalog.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';

export function StoreClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const parseMultiValueParam = (param: string | null) =>
    param
      ? param
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

  const [filters, setFilters] = useState<StoreFilterState>({
    category: parseMultiValueParam(searchParams.get('category')),
    tag: parseMultiValueParam(searchParams.get('tag')),
    is_popular: searchParams.get('is_popular') === 'true',
    is_available: searchParams.get('is_available') === 'true',
    price_min: Number(searchParams.get('price_min')) || 0,
    price_max: Number(searchParams.get('price_max')) || 9999,
    ordering: searchParams.get('ordering') || 'price',
  });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setFilters({
      category: parseMultiValueParam(searchParams.get('category')),
      tag: parseMultiValueParam(searchParams.get('tag')),
      is_popular: searchParams.get('is_popular') === 'true',
      is_available: searchParams.get('is_available') === 'true',
      price_min: Number(searchParams.get('price_min')) || 0,
      price_max: Number(searchParams.get('price_max')) || 9999,
      ordering: searchParams.get('ordering') || 'price',
    });
    setSearch(searchParams.get('search') || '');
    setPage(1);
  }, [searchParams]);

  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isLoading, error } = useQuery({
    queryKey: ['storeSearch', filters, page, debouncedSearch],
    queryFn: () =>
      catalogService.advancedSearch({
        search: debouncedSearch || undefined,
        categories: filters.category?.length ? filters.category.join(',') : undefined,
        tags: filters.tag?.length ? filters.tag.join(',') : undefined,
        price_min: filters.price_min > 0 ? filters.price_min : undefined,
        price_max: filters.price_max === 9999 ? undefined : filters.price_max,
        ordering: filters.ordering,
        is_popular: filters.is_popular ? true : undefined,
        is_available: filters.is_available ? true : undefined,
        page,
        page_size: limit,
      }),
  });

  const products = data?.results || [];
  const total = data?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const handleApplyFilters = (newFilters: StoreFilterState) => {
    setFilters(newFilters);
    setPage(1);

    const params = new URLSearchParams();
    if (newFilters.category?.length) params.set('category', newFilters.category.join(','));
    if (newFilters.tag?.length) params.set('tag', newFilters.tag.join(','));
    if (newFilters.is_popular) params.set('is_popular', 'true');
    if (newFilters.is_available) params.set('is_available', 'true');
    if (newFilters.price_min > 0) params.set('price_min', newFilters.price_min.toString());
    if (newFilters.price_max < 9999) params.set('price_max', newFilters.price_max.toString());
    if (newFilters.ordering && newFilters.ordering !== 'price') {
      params.set('ordering', newFilters.ordering);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, total);

  const clearFilters = () => {
    setSearch('');
    handleApplyFilters({
      category: [],
      tag: [],
      is_popular: false,
      is_available: false,
      price_min: 0,
      price_max: 9999,
      ordering: 'price',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Store{' '}
          <span className="text-sm font-normal text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `(Showing ${showingStart} - ${showingEnd} products of ${total} products)`}
          </span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="lg:hidden w-full flex flex-col gap-4 mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="mobile-main-search"
              placeholder="Search products..."
              className="pl-9 border-border text-sm h-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value || '')}
            />
          </div>
          <div className="flex justify-between items-center w-full">
            <MobileStoreFilter
              search={search}
              setSearch={setSearch}
              filters={filters}
              onChange={handleApplyFilters}
            />
            <StoreSortSelect
              value={filters.ordering}
              onChange={(val) => handleApplyFilters({ ...filters, ordering: val })}
              className="flex-1 ml-4"
            />
          </div>
        </div>

        <aside className="hidden lg:block w-70 shrink-0 sticky top-24">
          <StoreSidebarFilter
            filters={filters}
            onChange={handleApplyFilters}
            search={search}
            setSearch={setSearch}
            className="bg-card w-full rounded-xl p-5 border border-border"
          />
        </aside>

        <main className="flex-1 w-full min-w-0">
          <div className="hidden lg:flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="main-search"
                placeholder="Search products..."
                className="pl-9 border-border text-sm h-10 w-full bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value || '')}
              />
            </div>
            <StoreSortSelect
              value={filters.ordering}
              onChange={(val) => handleApplyFilters({ ...filters, ordering: val })}
            />
          </div>

          <ProductGrid products={products} isLoading={isLoading} error={error} />
          {products.length === 0 && !isLoading && (
            <Button onClick={clearFilters} className="mx-auto flex mt-8">
              Clear Filters
            </Button>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-4 items-center">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-border">
                Previous
              </Button>
              <span className="text-foreground text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="border-border">
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
