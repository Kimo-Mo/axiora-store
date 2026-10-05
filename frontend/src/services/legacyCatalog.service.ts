import api from '@/lib/api/axios';
import type { PaginatedResponse } from '@/types';
import type {
  LegacyCatalogSearchParams,
  LegacyProduct,
  LegacyProductCategory,
  LegacyProductTag,
  LegacyTagPayload,
} from '@/types/legacyCatalog';

/**
 * Call sites for the **retired Django catalog API** (`/catalog/…`).
 *
 * Nothing here is reachable any more: the Express backend has no `/catalog`
 * namespace, so every method below answers 404 — exactly as it did before the
 * Express migration. They exist so the not-yet-migrated screens (the navbar search
 * box, the cart store, the admin dashboard tag and product screens) still compile
 * against their own shape while they wait for the phase that rewrites them.
 *
 * Every caller here is slated for a rewrite. Nothing new should be added to this
 * file; delete it — and the matching entries in `types/legacyCatalog.ts` — as each
 * consumer is migrated.
 *
 * The response types are the retired API's own shapes rather than `any`, because
 * each caller already branches on which shape it got (bare array vs `{ results }`),
 * and a typed envelope makes that branch explicit instead of hiding it.
 */

/** The retired API's tag list, which some callers received bare and some wrapped. */
export type LegacyTagListResponse = LegacyProductTag[] | { results: LegacyProductTag[] };

export const legacyCatalogService = {
  /** Navbar search box. Returns `{ products: [...] }`, not a bare list. */
  async simpleSearch(search: string): Promise<{ products: LegacyProduct[] }> {
    const { data } = await api.get<{ products: LegacyProduct[] }>('/catalog/public/search/simple', {
      params: { search },
    });
    return data;
  },

  async publicTagsList(): Promise<LegacyProductTag[]> {
    const { data } = await api.get<LegacyProductTag[]>('/catalog/public/tags/');
    return data;
  },

  /** Rehydrated by the cart store for every line, so it stays on the old shape. */
  async publicProductDetail(slug: string): Promise<LegacyProduct> {
    const { data } = await api.get<LegacyProduct>(`/catalog/public/products/${slug}/`);
    return data;
  },

  async adminCategoriesList(): Promise<LegacyProductCategory[]> {
    const { data } = await api.get<LegacyProductCategory[]>('/catalog/admin/categories/');
    return data;
  },

  async adminProductsList(params?: LegacyCatalogSearchParams): Promise<PaginatedResponse<LegacyProduct>> {
    const { data } = await api.get<PaginatedResponse<LegacyProduct>>('/catalog/admin/products', { params });
    return data;
  },

  async adminGetProduct(slug: string): Promise<LegacyProduct> {
    const { data } = await api.get<LegacyProduct>(`/catalog/admin/products/${slug}`);
    return data;
  },

  async adminDeleteProduct(slug: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/catalog/admin/products/${slug}/`);
    return data;
  },

  async adminTagsList(): Promise<LegacyTagListResponse> {
    const { data } = await api.get<LegacyTagListResponse>('/catalog/admin/tags');
    return data;
  },

  async adminAddTag(payload: LegacyTagPayload): Promise<LegacyProductTag> {
    const { data } = await api.post<LegacyProductTag>('/catalog/admin/tags/', payload);
    return data;
  },

  async adminDeleteTag(slug: string): Promise<void> {
    await api.delete(`/catalog/admin/tags/${slug}/`);
  },
};

export default legacyCatalogService;