'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, FolderTree, Package, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CategoryTree } from '@/components/admin/categories/CategoryTree';
import { CategoryFormDialog } from '@/components/admin/categories/CategoryFormDialog';
import { CategoryDeleteDialog } from '@/components/admin/categories/CategoryDeleteDialog';
import {
  useAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/hooks/admin/useCategoryMutations';
import type { AdminCategoryDto } from '@/types/admin';

export default function AdminCategoriesPage() {
  const t = useTranslations('admin.categories');

  const { data: categories = [], isLoading, isError } = useAdminCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryDto | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategoryDto | null>(null);

  // Stats calculation
  const countNodes = (list: AdminCategoryDto[]): { total: number; totalProducts: number } => {
    let total = 0;
    let totalProducts = 0;
    for (const c of list) {
      total += 1;
      totalProducts += c.productCount;
      if (c.children) {
        const sub = countNodes(c.children);
        total += sub.total;
        totalProducts += sub.totalProducts;
      }
    }
    return { total, totalProducts };
  };

  const { total: totalCategories, totalProducts } = countNodes(categories);
  const rootCount = categories.length;

  const handleOpenCreateRoot = () => {
    setEditingCategory(null);
    setDefaultParentId(null);
    setFormDialogOpen(true);
  };

  const handleAddChild = (parent: AdminCategoryDto) => {
    setEditingCategory(null);
    setDefaultParentId(parent.id);
    setFormDialogOpen(true);
  };

  const handleEdit = (category: AdminCategoryDto) => {
    setEditingCategory(category);
    setDefaultParentId(category.parentId);
    setFormDialogOpen(true);
  };

  const handleDelete = (category: AdminCategoryDto) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        payload: data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setFormDialogOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t('pageTitle', { defaultValue: 'Category Taxonomy' })}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('pageSubtitle', {
              defaultValue:
                'Manage hierarchical catalog categories, product associations, and bilingual taxonomy.',
            })}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleOpenCreateRoot}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t('actions.createRoot', { defaultValue: 'Create Root Category' })}
        </Button>
      </div>

      {/* Metric summary pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('stats.totalCategories', { defaultValue: 'Total Categories' })}
              </p>
              <p className="text-lg font-bold text-foreground">{totalCategories}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('stats.rootCategories', { defaultValue: 'Root Categories' })}
              </p>
              <p className="text-lg font-bold text-foreground">{rootCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('stats.assignedProducts', { defaultValue: 'Catalog Products' })}
              </p>
              <p className="text-lg font-bold text-foreground">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Categories Tree Card */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground">
            {t('tree.title', { defaultValue: 'Hierarchical Structure' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {t('tree.description', {
              defaultValue:
                'Expand nodes to view subcategories. Deleting a category with products requires safe reassignment.',
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">{t('common.loading', { defaultValue: 'Loading categories...' })}</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-destructive text-sm font-medium">
              {t('common.error', { defaultValue: 'Failed to load categories' })}
            </div>
          ) : (
            <CategoryTree
              categories={categories}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={editingCategory}
        defaultParentId={defaultParentId}
        allCategories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete & Product Reassignment Dialog */}
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={deletingCategory}
        allCategories={categories}
      />
    </div>
  );
}
