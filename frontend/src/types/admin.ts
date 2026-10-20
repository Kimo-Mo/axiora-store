export interface DashboardStatsDto {
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  revenue: {
    total: string;
    thisMonth: string;
    currency: string;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
  };
  inventory: {
    lowStockCount: number;
    threshold: number;
  };
  paymentSplit: {
    codCount: number;
    codAmount: string;
    onlineCount: number;
    onlineAmount: string;
  };
}

export interface InventoryVariantDto {
  variantId: string;
  sku: string;
  productId: string;
  productSlug: string;
  productNameAr: string;
  productNameEn: string;
  primaryImageUrl: string | null;
  price: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  isLowStock: boolean;
  isActive: boolean;
  attributes: Array<{
    attributeSlug: string;
    attributeNameAr: string;
    attributeNameEn: string;
    valueAr: string;
    valueEn: string;
  }>;
}

export interface InventoryAdjustmentDto {
  id: string;
  variantId: string;
  variantSku: string;
  productNameAr: string;
  productNameEn: string;
  quantityChange: number;
  previousStock?: number;
  newStock?: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface AdminCategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  parentId: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  children?: AdminCategoryDto[];
}

export interface AdminBrandDto {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  productCount: number;
}

export interface AdminProductListItemDto {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  brand: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    logo: string | null;
  };
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  primaryImage: {
    url: string;
    alt: string | null;
  } | null;
  minPrice: string;
  maxPrice: string;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  variantCount: number;
}

export interface VariantAttributeInput {
  attributeSlug: string;
  valueAr: string;
  valueEn: string;
}

export interface VariantDto {
  id: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;
  stockQuantity: number;
  reservedQuantity: number;
  isDefault: boolean;
  isActive: boolean;
  attributeValues: Array<{
    attributeId: string;
    attributeSlug: string;
    attributeNameAr: string;
    attributeNameEn: string;
    valueAr: string;
    valueEn: string;
  }>;
}

export interface ProductImageDto {
  id: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface SpecificationDto {
  id?: string;
  keyAr: string;
  keyEn: string;
  valueAr: string;
  valueEn: string;
  sortOrder?: number;
}

export interface AdminProductDetailDto {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  shortDescriptionAr: string | null;
  shortDescriptionEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  brandId: string;
  categoryId: string;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  warranty: string | null;
  brand: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  images: ProductImageDto[];
  variants: VariantDto[];
  specifications: SpecificationDto[];
}

export interface BatchUploadAssetDto {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  results: T[];
  count?: number;
  total?: number;
  meta?: PaginationMeta;
}

