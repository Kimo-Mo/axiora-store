'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import type {
  CatalogPaginatedResponse,
  CatalogSearchParams,
  PublicBrand,
  PublicCategory,
  PublicProductDetail,
  PublicProductListItem,
  RelatedProduct,
} from '@/types/catalog';

/**
 * Storefront catalog queries (research.md D-6).
 *
 * Every piece of filter state lives in the URL, so the query key is derived from
 * the params object the URL produced. That makes the cache key and the shareable
 * link the same thing by construction: two visitors on identical URLs share one
 * cache entry, and the browser's back button is a normal cache lookup rather than
 * a refetch.
 *
 * Nothing here is mirrored into Zustand. Filter state is not server state, and
 * duplicating it in a store is how the two drift apart.
 */

/** Taxonomy and brand lists change rarely; hold them well past a navigation. */
const TAXONOMY_STALE_MS = 1000 * 60 * 10;

/** Detail pages are revisited often (shared links, related-product hops). */
const DETAIL_STALE_MS = 1000 * 60 * 2;

/** Keep the previous page on screen while the next one loads, so paging is not a flash. */
const LISTING_PLACEHOLDER_MS = 1000 * 60 * 2;

export const catalogKeys = {
  products: (params: CatalogSearchParams) => ['catalog', 'products', params] as const,
  categories: (flat: boolean) => ['catalog', 'categories', { flat }] as const,
  brands: () => ['catalog', 'brands'] as const,
  product: (slug: string) => ['catalog', 'product', slug] as const,
  related: (slug: string) => ['catalog', 'related', slug] as const,
};

export function useProducts(
  params: CatalogSearchParams,
): UseQueryResult<CatalogPaginatedResponse<PublicProductListItem>> {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogService.products(params),
    // Hold the previous page while the next one loads. Paging the store is a
    // frequent, expected interaction, and without this every page change blanks
    // the grid before the next set arrives.
    placeholderData: (previous) => previous,
    staleTime: LISTING_PLACEHOLDER_MS,
  });
}

/** Active categories as a tree. Pass `flat: true` for a list to group client-side. */
export function useCategories(flat = false): UseQueryResult<PublicCategory[]> {
  return useQuery({
    queryKey: catalogKeys.categories(flat),
    queryFn: () => catalogService.categories({ flat, tree: !flat }),
    staleTime: TAXONOMY_STALE_MS,
  });
}

export function useBrands(): UseQueryResult<PublicBrand[]> {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => catalogService.brands(),
    staleTime: TAXONOMY_STALE_MS,
  });
}

export function useProduct(slug: string): UseQueryResult<PublicProductDetail> {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => catalogService.product(slug),
    staleTime: DETAIL_STALE_MS,
  });
}

export function useRelatedProducts(slug: string): UseQueryResult<RelatedProduct[]> {
  return useQuery({
    queryKey: catalogKeys.related(slug),
    queryFn: () => catalogService.relatedProducts(slug),
    // Refetching related products on every window focus would be noise; the list
    // only changes when the catalogue does.
    staleTime: TAXONOMY_STALE_MS,
  });
}