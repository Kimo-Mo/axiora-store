'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBrands, useCategories, useProducts } from '@/hooks/useCatalog';
import ProductGrid from '@/components/features/product/ProductGrid';
import StoreSidebarFilter, { type StoreFilterValue } from './StoreSidebarFilter';
import MobileStoreFilter from './MobileStoreFilter';
import StoreSortSelect from './StoreSortSelect';
import {
  CATALOG_PAGE_SIZE,
  DEFAULT_CATALOG_SORT,
  SEARCH_DEBOUNCE_MS,
  type CatalogSearchParams,
  type CatalogSort,
} from '@/types/catalog';

/**
 * Store listing shell (research.md D-6).
 *
 * The URL query string is the single source of truth. Every control in this tree
 * does one thing: turn a user action into a new URL. Nothing here holds filter state
 * that is not derivable from `useSearchParams`, which is what makes results
 * bookmarkable, shareable, and correct under the browser's back button.
 *
 * The only local state is the raw text in the search box. Typing updates it
 * immediately (so the field stays responsive) and a timer mirrors it into the URL
 * 350ms later — otherwise every keystroke would be a request.
 */

const PRICE_FLOOR = 0;
const PRICE_CEILING = 150_000;

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Read filter state out of the URL. Every default here means "param absent". */
function readFilters(params: URLSearchParams) {
  const sort = params.get('sort');
  const page = Number(params.get('page'));

  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? undefined,
    brands: params.get('brands')?.split(',').filter(Boolean) ?? [],
    minPrice: parseNumber(params.get('minPrice')),
    maxPrice: parseNumber(params.get('maxPrice')),
    inStock: params.get('inStock') === 'true',
    sort: (sort as CatalogSort | null) ?? DEFAULT_CATALOG_SORT,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/**
 * Build the next query string, dropping anything at its default.
 *
 * Omitting defaults keeps shared links short and means "reset" is simply the URL
 * with no params — no special-casing a reset flag.
 */
function writeFilters(filters: ReturnType<typeof readFilters>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.brands.length > 0) params.set('brands', filters.brands.join(','));
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.sort !== DEFAULT_CATALOG_SORT) params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function StoreClient() {
  const t = useTranslations('store');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = useMemo(() => readFilters(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [searchText, setSearchText] = useState(filters.search);

  // Adopt an externally changed `search` (back button, a shared link, the language
  // switcher) without fighting the shopper mid-keystroke.
  //
  // Adjusted during render rather than in an effect: React re-runs this component
  // before painting, so the field never shows a stale value, and there is no
  // cascading second render. `syncedSearch` records what the box currently mirrors.
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setSearchText(filters.search);
  }

  /** Every navigation goes through here, so `scroll: false` and page reset are uniform. */
  const navigate = useCallback(
    (next: ReturnType<typeof readFilters>) => {
      const query = writeFilters(next).toString();
      router.replace(query ? `/store?${query}` : '/store', { scroll: false });
    },
    [router],
  );

  // Debounced mirror of the search box into the URL.
  useEffect(() => {
    if (searchText === filters.search) return;

    const timer = setTimeout(() => {
      // Page resets to 1: a shopper who searched from page 4 means page 1 of the
      // new result set, and staying on page 4 would usually show nothing.
      navigate({ ...filters, search: searchText, page: 1 });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchText, filters, navigate]);

  const query: CatalogSearchParams = useMemo(
    () => ({
      page: filters.page,
      limit: CATALOG_PAGE_SIZE,
      search: filters.search || undefined,
      category: filters.category,
      brands: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock || undefined,
      sort: filters.sort,
    }),
    [filters],
  );

  const { data, isLoading, isFetching, error, refetch } = useProducts(query);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const filterValue: StoreFilterValue = {
    category: filters.category,
    brands: filters.brands,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock,
  };

  /** Any filter change other than paging starts again from page 1. */
  const applyFilters = useCallback(
    (next: StoreFilterValue) => {
      navigate({
        ...filters,
        category: next.category,
        brands: next.brands,
        minPrice: next.minPrice,
        maxPrice: next.maxPrice,
        inStock: next.inStock,
        page: 1,
      });
    },
    [filters, navigate],
  );

  const clearFilters = useCallback(() => {
    setSearchText('');
    navigate({
      search: '',
      category: undefined,
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
      sort: DEFAULT_CATALOG_SORT,
      page: 1,
    });
  }, [navigate]);

  const meta = data?.meta;
  const totalCount = meta?.totalCount ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const rangeStart = totalCount === 0 ? 0 : (filters.page - 1) * CATALOG_PAGE_SIZE + 1;
  const rangeEnd = Math.min(filters.page * CATALOG_PAGE_SIZE, totalCount);
  const hasFilters = Boolean(filters.search || filters.category || filters.brands.length || filters.inStock || filters.minPrice !== undefined || filters.maxPrice !== undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {filters.search
            ? t('searchResultsFor', { query: filters.search })
            : t('showingRange', { start: rangeStart, end: rangeEnd, total: totalCount })}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden w-72 shrink-0 lg:sticky lg:top-24 lg:block">
          <div className="rounded-xl border border-border bg-card p-5">
            <StoreSidebarFilter
              categories={categories}
              brands={brands}
              value={filterValue}
              onChange={applyFilters}
              onClear={clearFilters}
              priceBounds={{ min: PRICE_FLOOR, max: PRICE_CEILING }}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col gap-3">
            <div className="flex gap-2 lg:hidden">
              <MobileStoreFilter
                categories={categories}
                brands={brands}
                value={filterValue}
                onApply={applyFilters}
                priceBounds={{ min: PRICE_FLOOR, max: PRICE_CEILING }}
              />
              <StoreSortSelect
                value={filters.sort}
                onChange={(sort) => navigate({ ...filters, sort, page: 1 })}
                className="min-w-0 flex-1"
                showLabel={false}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto size-4 text-muted-foreground" />
                <Input
                  id="store-main-search"
                  name="search"
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchPlaceholder')}
                  className="h-11 border-border bg-card ps-9 pe-9"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    aria-label={t('clearSearch')}
                    className="absolute inset-y-0 inset-e-3 my-auto cursor-pointer text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <StoreSortSelect
                value={filters.sort}
                onChange={(sort) => navigate({ ...filters, sort, page: 1 })}
                className="hidden lg:flex"
              />
            </div>

            {hasFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>

          <ProductGrid
            products={data?.data}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            onRetry={() => void refetch()}
            onClearFilters={clearFilters}
          />

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4" aria-label={t('pageOf', { page: filters.page, totalPages })}>
              <Button
                variant="outline"
                disabled={filters.page <= 1 || isFetching}
                onClick={() => navigate({ ...filters, page: filters.page - 1 })}>
                {tCommon('previous')}
              </Button>
              <span className="text-sm font-medium text-foreground">
                {t('pageOf', { page: filters.page, totalPages })}
              </span>
              <Button
                variant="outline"
                disabled={filters.page >= totalPages || isFetching}
                onClick={() => navigate({ ...filters, page: filters.page + 1 })}>
                {tCommon('next')}
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}