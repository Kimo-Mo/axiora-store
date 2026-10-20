'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminProductsQuery, useDeleteProductMutation } from '@/hooks/admin/useProductMutations';
import { useAdminCategoriesQuery } from '@/hooks/admin/useCategoryMutations';

import { ProductListHeader } from '@/components/admin/products/ProductListHeader';
import { ProductListFilters } from '@/components/admin/products/ProductListFilters';
import { ProductTable } from '@/components/admin/products/ProductTable';
import { ProductPagination } from '@/components/admin/products/ProductPagination';
import { DeleteProductDialog } from '@/components/admin/products/DeleteProductDialog';
import type { AdminProductListItemDto } from '@/types/admin';

export default function AdminProductsPage() {
  const t = useTranslations('admin.products');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteProduct, setDeleteProduct] = useState<AdminProductListItemDto | null>(null);

  // Debounce search input and reset pagination
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const productsQuery = useAdminProductsQuery({
    page,
    limit: 15,
    search: debouncedSearch.trim() || undefined,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  const deleteMutation = useDeleteProductMutation();
  const categoriesQuery = useAdminCategoriesQuery();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data?.results ?? [];
  const loading = productsQuery.isPending;

  const count = productsQuery.data?.meta?.total ?? productsQuery.data?.total ?? productsQuery.data?.count ?? 0;
  const current_page = productsQuery.data?.meta?.page ?? page;
  const total_pages = productsQuery.data?.meta?.totalPages ?? (Math.ceil(count / 15) || 1);

  const handleDelete = () => {
    if (deleteProduct) {
      deleteMutation.mutate(deleteProduct.id, {
        onSettled: () => setDeleteProduct(null),
      });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <ProductListHeader />

      <Card className="bg-card border-border shadow-sm">
        <ProductListFilters
          search={search}
          setSearch={setSearch}
          categoryId={categoryId}
          setCategoryId={handleCategoryChange}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusChange}
          categories={categories}
          productCount={count}
        />

        {productsQuery.isError ? (
          <div className="text-center py-12 text-destructive text-sm font-medium">
            {t('errors.loadFailed')}
          </div>
        ) : (
          <CardContent className="p-4 md:p-6 pt-0">
            <ProductTable
              products={products}
              loading={loading}
              onDeleteClick={(p) => setDeleteProduct(p)}
            />

            <ProductPagination
              current_page={current_page}
              total_pages={total_pages}
              count={count}
              loading={loading}
              setPage={setPage}
            />
          </CardContent>
        )}
      </Card>

      <DeleteProductDialog
        product={deleteProduct}
        onClose={() => setDeleteProduct(null)}
        deleting={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
