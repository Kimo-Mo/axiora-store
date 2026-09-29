import api from '../lib/api/axios';
import {
  CatalogSearchParams,
  CategoryPayload,
  ProductPayload,
  TagPayload,
  Product,
  PaginatedResponse,
} from '@/types';

// Param alias types re-exported via product.service shim
export interface ProductListParams {
  tag?: string;
  category?: string;
  fulfillment_method?: string;
  featured?: boolean;
  page?: number;
  page_size?: number;
}

export const catalogService = {
  // Public
  simpleSearch: async (search: string) => {
    const { data } = await api.get('/catalog/public/search/simple', { params: { search } });
    return data;
  },
  advancedSearch: async (params?: CatalogSearchParams) => {
    const { data } = await api.get('/catalog/public/search/advanced', { params });
    if (data && data.results) {
      data.results = data.results.map((product: Product) => {
        if (typeof product.main_image === 'string') {
          return {
            ...product,
            main_image: { image: product.main_image },
          };
        }
        return product;
      });
    }
    return data;
  },
  publicCategoriesList: async () => {
    const { data } = await api.get('/catalog/public/categories/');
    return data;
  },
  publicTagsList: async () => {
    const { data } = await api.get('/catalog/public/tags/');
    return data;
  },
  publicProductsList: async (
    params?: Record<string, string | number | boolean>
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get<PaginatedResponse<Product>>('/catalog/public/products', {
      params,
    });
    return data;
  },
  publicProductDetail: async (slug: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/catalog/public/products/${slug}/`);
    return data;
  },
  publicRelatedProducts: async (slug: string, page = 1): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get<PaginatedResponse<Product>>(`/catalog/public/products/${slug}/related/`, {
      params: { page }
    });
    return data;
  },

  // Admin
  adminCategoriesList: async () => {
    const { data } = await api.get('/catalog/admin/categories/');
    return data;
  },
  adminAddCategory: async (payload: CategoryPayload | FormData) => {
    const { data } = await api.post('/catalog/admin/categories/', payload);
    return data;
  },
  adminUpdateCategory: async (slug: string, payload: CategoryPayload | FormData) => {
    const { data } = await api.put(`/catalog/admin/categories/${slug}/`, payload);
    return data;
  },
  adminDeleteCategory: async (payload: { slug: string }) => {
    const { data } = await api.delete('/catalog/admin/categories/', { data: payload });
    return data;
  },
  adminProductsList: async (params?: CatalogSearchParams) => {
    const { data } = await api.get('/catalog/admin/products', { params });
    return data;
  },
  adminAddProduct: async (payload: ProductPayload | FormData) => {
    const { data } = await api.post('/catalog/admin/products/', payload);
    return data;
  },
  adminUpdateProduct: async (slug: string, payload: ProductPayload | FormData) => {
    const { data } = await api.put(`/catalog/admin/products/${slug}/`, payload);
    return data;
  },
  adminGetProduct: async (slug: string) => {
    const { data } = await api.get(`/catalog/admin/products/${slug}`);
    return data;
  },
  adminDeleteProduct: async (slug: string): Promise<boolean> => {
    const { data } = await api.delete(`/catalog/admin/products/${slug}/`);
    return data;
  },
  adminTagsList: async () => {
    const { data } = await api.get('/catalog/admin/tags');
    return data;
  },
  adminAddTag: async (payload: TagPayload) => {
    const { data } = await api.post('/catalog/admin/tags/', payload);
    return data;
  },
  adminDeleteTag: async (slug: string): Promise<void> => {
    await api.delete(`/catalog/admin/tags/${slug}/`);
  },
};
