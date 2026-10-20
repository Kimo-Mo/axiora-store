'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Building2, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandTable } from '@/components/admin/brands/BrandTable';
import { BrandFormDialog } from '@/components/admin/brands/BrandFormDialog';
import { BrandDeleteDialog } from '@/components/admin/brands/BrandDeleteDialog';
import {
  useAdminBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from '@/hooks/admin/useBrandMutations';
import type { AdminBrandDto } from '@/types/admin';

export default function AdminBrandsPage() {
  const t = useTranslations('admin.brands');

  const { data: brands = [], isLoading } = useAdminBrandsQuery();
  const createMutation = useCreateBrandMutation();
  const updateMutation = useUpdateBrandMutation();

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrandDto | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<AdminBrandDto | null>(null);

  // Stats
  const totalBrands = brands.length;
  const activeBrands = brands.filter((b) => b.isActive).length;
  const totalAssignedProducts = brands.reduce((acc, b) => acc + b.productCount, 0);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (brand: AdminBrandDto) => {
    setEditingBrand(brand);
    setFormDialogOpen(true);
  };

  const handleDelete = (brand: AdminBrandDto) => {
    setDeletingBrand(brand);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    if (editingBrand) {
      await updateMutation.mutateAsync({
        id: editingBrand.id,
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
            {t('pageTitle', { defaultValue: 'Brand Directory' })}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('pageSubtitle', {
              defaultValue:
                'Manage product brand manufacturers, official logos, and storefront availability.',
            })}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t('actions.create', { defaultValue: 'Add New Brand' })}
        </Button>
      </div>

      {/* Metric summary pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('stats.totalBrands', { defaultValue: 'Total Brands' })}
              </p>
              <p className="text-lg font-bold text-foreground">{totalBrands}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('stats.activeBrands', { defaultValue: 'Active Brands' })}
              </p>
              <p className="text-lg font-bold text-foreground">{activeBrands}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('stats.assignedProducts', { defaultValue: 'Assigned Products' })}
              </p>
              <p className="text-lg font-bold text-foreground">{totalAssignedProducts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Brands Card */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground">
            {t('table.title', { defaultValue: 'Registered Brands' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {t('table.subtitle', {
              defaultValue:
                'Search and manage brands. Brands in active use cannot be deleted without reassigning products.',
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <BrandTable
            brands={brands}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <BrandFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        brand={editingBrand}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Guard Dialog */}
      <BrandDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        brand={deletingBrand}
      />
    </div>
  );
}
