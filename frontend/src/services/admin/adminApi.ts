import api from '@/lib/api/axios';
import type {
  AdminBrandDto,
  AdminCategoryDto,
  AdminProductDetailDto,
  AdminProductListItemDto,
  BatchUploadAssetDto,
  DashboardStatsDto,
  InventoryAdjustmentDto,
  InventoryVariantDto,
  PaginatedResult,
  SpecificationDto,
  VariantAttributeInput,
} from '@/types/admin';

export type { PaginatedResult };

export const adminApi = {
  // ─── Dashboard ───────────────────────────────────────────────────────────
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const { data } = await api.get<{ success: boolean; data: DashboardStatsDto }>('/admin/dashboard/stats');
    return data.data;
  },

  // ─── Products ────────────────────────────────────────────────────────────
  async listProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
  }): Promise<PaginatedResult<AdminProductListItemDto>> {
    const { data } = await api.get<{ success: boolean; data: PaginatedResult<AdminProductListItemDto> }>(
      '/admin/products',
      { params }
    );
    return data.data;
  },

  async getProduct(id: string): Promise<AdminProductDetailDto> {
    const { data } = await api.get<{ success: boolean; data: AdminProductDetailDto }>(`/admin/products/${id}`);
    return data.data;
  },

  async createProduct(payload: {
    nameAr: string;
    nameEn: string;
    slug: string;
    sku: string;
    brandId: string;
    categoryId: string;
    shortDescriptionAr?: string | null;
    shortDescriptionEn?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    warranty?: string | null;
    currency?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
  }): Promise<AdminProductDetailDto> {
    const { data } = await api.post<{ success: boolean; data: AdminProductDetailDto }>('/admin/products', payload);
    return data.data;
  },

  async updateProduct(
    id: string,
    payload: Partial<{
      nameAr: string;
      nameEn: string;
      slug: string;
      sku: string;
      brandId: string;
      categoryId: string;
      shortDescriptionAr: string | null;
      shortDescriptionEn: string | null;
      descriptionAr: string | null;
      descriptionEn: string | null;
      warranty: string | null;
      currency: string;
      isActive: boolean;
      isFeatured: boolean;
      isNew: boolean;
      isBestSeller: boolean;
    }>
  ): Promise<AdminProductDetailDto> {
    const { data } = await api.put<{ success: boolean; data: AdminProductDetailDto }>(`/admin/products/${id}`, payload);
    return data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  async updateProductStatus(id: string, isActive: boolean): Promise<{ id: string; isActive: boolean }> {
    const { data } = await api.patch<{ success: boolean; data: { id: string; isActive: boolean } }>(
      `/admin/products/${id}/status`,
      { isActive }
    );
    return data.data;
  },

  // ─── Variants ────────────────────────────────────────────────────────────
  async createVariant(
    productId: string,
    payload: {
      sku: string;
      price: number;
      compareAtPrice?: number | null;
      costPrice?: number | null;
      stockQuantity?: number;
      isDefault?: boolean;
      isActive?: boolean;
      attributeValues?: VariantAttributeInput[];
    }
  ): Promise<AdminProductDetailDto> {
    const { data } = await api.post<{ success: boolean; data: AdminProductDetailDto }>(
      `/admin/products/${productId}/variants`,
      payload
    );
    return data.data;
  },

  async updateVariant(
    productId: string,
    variantId: string,
    payload: Partial<{
      sku: string;
      price: number;
      compareAtPrice: number | null;
      costPrice: number | null;
      stockQuantity: number;
      reservedQuantity: number;
      isDefault: boolean;
      isActive: boolean;
      attributeValues: VariantAttributeInput[];
    }>
  ): Promise<AdminProductDetailDto> {
    const { data } = await api.put<{ success: boolean; data: AdminProductDetailDto }>(
      `/admin/products/${productId}/variants/${variantId}`,
      payload
    );
    return data.data;
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await api.delete(`/admin/products/${productId}/variants/${variantId}`);
  },

  // ─── Product Images & Specs ──────────────────────────────────────────────
  async addProductImage(
    productId: string,
    payload: { url: string; publicId?: string | null; alt?: string | null; isPrimary?: boolean; sortOrder?: number }
  ): Promise<AdminProductDetailDto> {
    const { data } = await api.post<{ success: boolean; data: AdminProductDetailDto }>(
      `/admin/products/${productId}/images`,
      payload
    );
    return data.data;
  },

  async reorderProductImages(productId: string, images: string[]): Promise<AdminProductDetailDto> {
    const { data } = await api.put<{ success: boolean; data: AdminProductDetailDto }>(
      `/admin/products/${productId}/images/order`,
      { images }
    );
    return data.data;
  },

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    await api.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  async replaceSpecifications(
    productId: string,
    specifications: SpecificationDto[]
  ): Promise<AdminProductDetailDto> {
    const { data } = await api.post<{ success: boolean; data: AdminProductDetailDto }>(
      `/admin/products/${productId}/specifications`,
      { specifications }
    );
    return data.data;
  },

  // ─── Batch Media Upload ──────────────────────────────────────────────────
  async uploadBatch(files: File[], folder = 'axiora/products'): Promise<BatchUploadAssetDto[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const { data } = await api.post<{ success: boolean; data: BatchUploadAssetDto[] }>(
      '/admin/uploads/batch',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.data;
  },

  // ─── Categories ──────────────────────────────────────────────────────────
  async listCategories(): Promise<AdminCategoryDto[]> {
    const { data } = await api.get<{ success: boolean; data: AdminCategoryDto[] }>('/admin/categories');
    return data.data;
  },

  async createCategory(payload: {
    nameAr: string;
    nameEn: string;
    slug: string;
    parentId?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    image?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<AdminCategoryDto> {
    const { data } = await api.post<{ success: boolean; data: AdminCategoryDto }>('/admin/categories', payload);
    return data.data;
  },

  async updateCategory(
    id: string,
    payload: Partial<{
      nameAr: string;
      nameEn: string;
      slug: string;
      parentId: string | null;
      descriptionAr: string | null;
      descriptionEn: string | null;
      image: string | null;
      sortOrder: number;
      isActive: boolean;
    }>
  ): Promise<AdminCategoryDto> {
    const { data } = await api.put<{ success: boolean; data: AdminCategoryDto }>(`/admin/categories/${id}`, payload);
    return data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  async reassignCategoryProducts(
    id: string,
    targetCategoryId: string
  ): Promise<{ reassignedCount: number; sourceCategoryId: string; targetCategoryId: string }> {
    const { data } = await api.post<{
      success: boolean;
      data: { reassignedCount: number; sourceCategoryId: string; targetCategoryId: string };
    }>(`/admin/categories/${id}/reassign-products`, { targetCategoryId });
    return data.data;
  },

  // ─── Brands ──────────────────────────────────────────────────────────────
  async listBrands(): Promise<AdminBrandDto[]> {
    const { data } = await api.get<{ success: boolean; data: AdminBrandDto[] }>('/admin/brands');
    return data.data;
  },

  async createBrand(payload: {
    nameAr: string;
    nameEn: string;
    slug: string;
    logo?: string | null;
    isActive?: boolean;
  }): Promise<AdminBrandDto> {
    const { data } = await api.post<{ success: boolean; data: AdminBrandDto }>('/admin/brands', payload);
    return data.data;
  },

  async updateBrand(
    id: string,
    payload: Partial<{
      nameAr: string;
      nameEn: string;
      slug: string;
      logo: string | null;
      isActive: boolean;
    }>
  ): Promise<AdminBrandDto> {
    const { data } = await api.put<{ success: boolean; data: AdminBrandDto }>(`/admin/brands/${id}`, payload);
    return data.data;
  },

  async deleteBrand(id: string): Promise<void> {
    await api.delete(`/admin/brands/${id}`);
  },

  // ─── Inventory ───────────────────────────────────────────────────────────
  async listInventory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    lowStockOnly?: boolean;
  }): Promise<PaginatedResult<InventoryVariantDto>> {
    const { data } = await api.get<{ success: boolean; data: PaginatedResult<InventoryVariantDto> }>(
      '/admin/inventory',
      { params }
    );
    return data.data;
  },

  async adjustStock(payload: {
    variantId: string;
    quantityChange: number;
    reason: string;
  }): Promise<{ adjustment: InventoryAdjustmentDto; variant: { id: string; stockQuantity: number; reservedQuantity: number; availableQuantity: number } }> {
    const { data } = await api.post<{
      success: boolean;
      data: { adjustment: InventoryAdjustmentDto; variant: { id: string; stockQuantity: number; reservedQuantity: number; availableQuantity: number } };
    }>('/admin/inventory/adjustments', payload);
    return data.data;
  },

  async listInventoryAdjustments(params?: {
    page?: number;
    limit?: number;
    variantId?: string;
  }): Promise<PaginatedResult<InventoryAdjustmentDto>> {
    const { data } = await api.get<{ success: boolean; data: PaginatedResult<InventoryAdjustmentDto> }>(
      '/admin/inventory/adjustments',
      { params }
    );
    return data.data;
  },

  async getLowStockThreshold(): Promise<{ lowStockThreshold: number }> {
    const { data } = await api.get<{ success: boolean; data: { lowStockThreshold: number } }>(
      '/admin/inventory/settings'
    );
    return data.data;
  },

  async updateLowStockThreshold(lowStockThreshold: number): Promise<{ lowStockThreshold: number }> {
    const { data } = await api.put<{ success: boolean; data: { lowStockThreshold: number } }>(
      '/admin/inventory/settings',
      { lowStockThreshold }
    );
    return data.data;
  },
};
