'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useProductsQuery } from '@/hooks/admin/useProductsQuery';
import { useDeleteProductMutation } from '@/hooks/admin/useDeleteProductMutation';
import { useCategoriesQuery } from '@/hooks/admin/useCategoriesQuery';

// Extracted Components
import { ProductListHeader } from '@/components/admin/products/ProductListHeader';
import { ProductListFilters } from '@/components/admin/products/ProductListFilters';
import { ProductTable } from '@/components/admin/products/ProductTable';
import { ProductPagination } from '@/components/admin/products/ProductPagination';
import { DeleteProductDialog } from '@/components/admin/products/DeleteProductDialog';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [debouncedSearch, categoryId]);

  const productsQuery = useProductsQuery({ page, search: debouncedSearch, categoryId });
  const deleteMutation = useDeleteProductMutation();
  const categoriesQuery = useCategoriesQuery();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data?.results ?? [];
  const loading = productsQuery.isPending;

  const count = productsQuery.data?.count ?? 0;
  const current_page = productsQuery.data?.current_page ?? 1;
  const total_pages = productsQuery.data?.total_pages ?? 1;

  return (
    <div className="space-y-8">
      <ProductListHeader />

      <Card className="bg-card border-border shadow-sm">
        <ProductListFilters
          search={search}
          setSearch={setSearch}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categories={categories}
          productCount={count}
        />
        {productsQuery.isError ? (
          <div className="text-center py-12 text-destructive text-sm">Failed to load products. Please try again.</div>
        ) : (
          <CardContent>
            <ProductTable products={products} loading={loading} setDeleteSlug={setDeleteSlug} />

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
        deleteSlug={deleteSlug}
        setDeleteSlug={setDeleteSlug}
        deleting={deleteMutation.isPending}
        handleDelete={() => {
          if (deleteSlug) deleteMutation.mutate(deleteSlug);
          setDeleteSlug(null);
        }}
      />
    </div>
  );
}
