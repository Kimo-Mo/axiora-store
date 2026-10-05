import api from '@/lib/api/axios';
import type {
  CatalogPaginatedResponse,
  CatalogSearchParams,
  CreateBrandPayload,
  CreateCategoryPayload,
  CreateProductPayload,
  CreateVariantPayload,
  PublicBrand,
  PublicCategory,
  PublicCategoryDetail,
  PublicProductDetail,
  PublicProductListItem,
  RelatedProduct,
  UploadedAsset,
} from '@/types/catalog';

/**
 * Public and admin catalog API client for the Express backend (`/api/v1/…`).
 *
 * Envelope handling lives here and nowhere else: every catalog endpoint answers
 * `{ success, data, meta? }`, and unwrapping it at each call site is how a
 * component ends up reading `.data.data`.
 *
 * `api`'s base URL is `/api` in the browser (proxied by `proxy.ts`) and
 * `http://127.0.0.1:5000/api/v1` during SSR, so paths below are written relative
 * to that prefix without a leading `/api/v1`.
 */

/** Drop keys whose value is `undefined` so they never reach the query string. */
function compact(params: CatalogSearchParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query[key] = value as string | number | boolean;
  }
  return query;
}

export const catalogService = {
  // ─── Categories ────────────────────────────────────────────────────────────

  /**
   * Active categories as a nested tree rooted at the top-level categories.
   * `tree: false` returns a flat list, which is what the store filter renders.
   */
  async categories(options: { tree?: boolean; flat?: boolean } = {}): Promise<PublicCategory[]> {
    const { data } = await api.get<{ data: PublicCategory[] }>('/categories', {
      params: { tree: options.tree ?? true, flat: options.flat ?? false },
    });
    return data.data;
  },

  async category(slug: string): Promise<PublicCategoryDetail> {
    const { data } = await api.get<{ data: PublicCategoryDetail }>(`/categories/${slug}`);
    return data.data;
  },

  // ─── Brands ────────────────────────────────────────────────────────────────

  /** Active brands that have at least one active product. */
  async brands(): Promise<PublicBrand[]> {
    const { data } = await api.get<{ data: PublicBrand[] }>('/brands');
    return data.data;
  },

  // ─── Products ──────────────────────────────────────────────────────────────

  async products(
    params: CatalogSearchParams = {},
  ): Promise<CatalogPaginatedResponse<PublicProductListItem>> {
    const { data } = await api.get<CatalogPaginatedResponse<PublicProductListItem>>('/products', {
      params: compact(params),
    });
    return data;
  },

  async product(slug: string): Promise<PublicProductDetail> {
    const { data } = await api.get<{ data: PublicProductDetail }>(`/products/${slug}`);
    return data.data;
  },

  async relatedProducts(slug: string): Promise<RelatedProduct[]> {
    const { data } = await api.get<{ data: RelatedProduct[] }>(`/products/${slug}/related`);
    return data.data;
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async createCategory(payload: CreateCategoryPayload) {
    const { data } = await api.post<{ data: PublicCategory }>('/admin/categories', payload);
    return data.data;
  },

  async updateCategory(id: string, payload: Partial<CreateCategoryPayload>) {
    const { data } = await api.put<{ data: PublicCategory }>(`/admin/categories/${id}`, payload);
    return data.data;
  },

  /** Rejects with a 409 when products are still assigned to the category. */
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  async createBrand(payload: CreateBrandPayload) {
    const { data } = await api.post<{ data: PublicBrand }>('/admin/brands', payload);
    return data.data;
  },

  async updateBrand(id: string, payload: Partial<CreateBrandPayload>) {
    const { data } = await api.put<{ data: PublicBrand }>(`/admin/brands/${id}`, payload);
    return data.data;
  },

  /** Rejects with a 409 when products are still assigned to the brand. */
  async deleteBrand(id: string): Promise<void> {
    await api.delete(`/admin/brands/${id}`);
  },

  async createProduct(payload: CreateProductPayload) {
    const { data } = await api.post('/admin/products', payload);
    return data.data;
  },

  async updateProduct(id: string, payload: Partial<CreateProductPayload>) {
    const { data } = await api.put(`/admin/products/${id}`, payload);
    return data.data;
  },

  async setProductActive(id: string, isActive: boolean) {
    const { data } = await api.patch(`/admin/products/${id}/status`, { isActive });
    return data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  async createVariant(productId: string, payload: CreateVariantPayload) {
    const { data } = await api.post(`/admin/products/${productId}/variants`, payload);
    return data.data;
  },

  async replaceSpecifications(
    productId: string,
    specifications: Array<{ keyAr: string; keyEn: string; valueAr: string; valueEn: string }>,
  ) {
    const { data } = await api.post(`/admin/products/${productId}/specifications`, { specifications });
    return data.data;
  },

  async attachProductImage(
    productId: string,
    payload: { url: string; publicId?: string | null; alt?: string | null; isPrimary?: boolean },
  ) {
    const { data } = await api.post(`/admin/products/${productId}/images`, payload);
    return data.data;
  },

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    await api.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  // ─── Media ─────────────────────────────────────────────────────────────────

  /**
   * Upload one image straight to Cloudinary.
   *
   * Content-Type is deliberately left unset: axios derives the multipart
   * boundary itself, and forcing `multipart/form-data` by hand produces a request
   * the server cannot parse.
   */
  async uploadImage(file: File, folder?: 'axiora/products' | 'axiora/categories' | 'axiora/brands') {
    const form = new FormData();
    form.append('file', file);
    if (folder) form.append('folder', folder);

    const { data } = await api.post<{ data: UploadedAsset }>('/admin/uploads', form);
    return data.data;
  },

  /**
   * Destroy a Cloudinary asset by public id.
   *
   * The id is passed through whole: it is folder-prefixed (`axiora/products/…`)
   * and the route is a wildcard precisely because a path segment cannot hold it.
   */
  async destroyUpload(publicId: string) {
    const { data } = await api.delete(`/admin/uploads/${publicId}`);
    return data.data;
  },
};

export default catalogService;