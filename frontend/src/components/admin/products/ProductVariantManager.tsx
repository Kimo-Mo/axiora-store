'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Tag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VariantFormDialog } from './VariantFormDialog';
import type { VariantDto, VariantAttributeInput } from '@/types/admin';
import {
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} from '@/hooks/admin/useVariantMutations';

export interface LocalVariantDraft {
  id?: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stockQuantity: number;
  isDefault: boolean;
  isActive: boolean;
  attributeValues: VariantAttributeInput[];
}

type AnyVariant = VariantDto | LocalVariantDraft;

interface ProductVariantManagerProps {
  productId?: string;
  variants: AnyVariant[];
  onLocalVariantsChange?: (variants: LocalVariantDraft[]) => void;
  disabled?: boolean;
}

export function ProductVariantManager({
  productId,
  variants,
  onLocalVariantsChange,
  disabled = false,
}: ProductVariantManagerProps) {
  const t = useTranslations('admin.products');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantDto | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  /** Server-mode variant currently being deleted, for row-level busy feedback. */
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // TanStack mutations if productId exists
  const createMutation = useCreateVariantMutation(productId ?? '');
  const updateMutation = useUpdateVariantMutation(productId ?? '');
  const deleteMutation = useDeleteVariantMutation(productId ?? '');

  const isServerMode = Boolean(productId);

  const handleOpenCreate = () => {
    setEditingVariant(null);
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (v: AnyVariant, index: number) => {
    // Coerce to VariantDto format for editing dialog
    const dto: VariantDto = {
      id: v.id ?? `draft-${index}`,
      sku: v.sku,
      price: String(v.price),
      compareAtPrice: v.compareAtPrice !== null && v.compareAtPrice !== undefined ? String(v.compareAtPrice) : null,
      costPrice: v.costPrice !== null && v.costPrice !== undefined ? String(v.costPrice) : null,
      stockQuantity: v.stockQuantity,
      reservedQuantity: 'reservedQuantity' in v ? v.reservedQuantity : 0,
      isDefault: v.isDefault,
      isActive: v.isActive,
      attributeValues: ((v.attributeValues || []) as Array<{
        attributeId?: string;
        attributeSlug?: string;
        attributeNameAr?: string;
        attributeNameEn?: string;
        valueAr?: string;
        valueEn?: string;
        attribute?: { id?: string; slug?: string; nameAr?: string; nameEn?: string };
      }>).map((av) => ({
        attributeId: av.attributeId ?? '',
        attributeSlug: av.attributeSlug || av.attribute?.slug || '',
        attributeNameAr: av.attributeNameAr || av.attribute?.nameAr || av.attributeSlug || '',
        attributeNameEn: av.attributeNameEn || av.attribute?.nameEn || av.attributeSlug || '',
        valueAr: av.valueAr ?? '',
        valueEn: av.valueEn ?? '',
      })),
    };
    setEditingVariant(dto);
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleDelete = async (v: AnyVariant, index: number) => {
    if (variants.length <= 1) {
      alert(t('variants.cannotDeleteLast', { defaultValue: 'A product must keep at least one variant.' }));
      return;
    }

    if (isServerMode && v.id) {
      setDeletingId(v.id);
      // The hook toasts the error; the catch only stops the rejection from
      // bubbling as an unhandled exception.
      try {
        await deleteMutation.mutateAsync(v.id);
      } catch {
        return;
      } finally {
        setDeletingId(null);
      }
    } else if (onLocalVariantsChange) {
      const remaining = (variants as LocalVariantDraft[]).filter((_, i) => i !== index);
      if (v.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      onLocalVariantsChange(remaining);
    }
  };

  const handleSubmitVariant = async (data: {
    sku: string;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    stockQuantity: number;
    isDefault: boolean;
    isActive: boolean;
    attributeValues: VariantAttributeInput[];
  }) => {
    if (isServerMode && productId) {
      // The hooks toast their own errors; the catch stops the rejection from
      // bubbling as an unhandled exception and keeps the dialog open so the
      // user's input is not lost.
      try {
        if (editingVariant?.id && !editingVariant.id.startsWith('draft-')) {
          await updateMutation.mutateAsync({
            variantId: editingVariant.id,
            payload: data,
          });
        } else {
          await createMutation.mutateAsync(data);
        }
      } catch {
        return;
      }
    } else if (onLocalVariantsChange) {
      const list = [...(variants as LocalVariantDraft[])];
      if (editingIndex !== null) {
        list[editingIndex] = { ...list[editingIndex], ...data };
      } else {
        list.push({ ...data });
      }

      // If marked default, make sure others are not
      if (data.isDefault) {
        list.forEach((item, idx) => {
          if (editingIndex !== null ? idx !== editingIndex : idx !== list.length - 1) {
            item.isDefault = false;
          }
        });
      } else if (!list.some((item) => item.isDefault) && list.length > 0) {
        list[0].isDefault = true;
      }

      onLocalVariantsChange(list);
    }
    setDialogOpen(false);
  };

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/50">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            {t('variants.title', { defaultValue: 'Product Variants & Inventory' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {t('variants.subtitle', {
              defaultValue:
                'Every product has at least one variant holding SKU, pricing in EGP, and stock count.',
            })}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenCreate}
          disabled={disabled}
          className="gap-1.5 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('variants.add', { defaultValue: 'Add Variant' })}
        </Button>
      </CardHeader>

      <CardContent className="pt-4">
        {variants.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-foreground">
              {t('variants.noVariantsTitle', { defaultValue: 'No variants configured' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('variants.noVariantsHelp', {
                defaultValue:
                  'Physical products require at least one variant to be purchasable. Click "Add Variant" to begin.',
              })}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold">SKU</TableHead>
                  <TableHead className="text-xs font-semibold">
                    {t('variants.attributes', { defaultValue: 'Attributes' })}
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    {t('variants.price', { defaultValue: 'Price (EGP)' })}
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    {t('variants.stock', { defaultValue: 'Stock' })}
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    {t('variants.status', { defaultValue: 'Status' })}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-end">
                    {t('common.actions', { defaultValue: 'Actions' })}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {variants.map((v: AnyVariant, index: number) => {
                  const attrs = v.attributeValues || [];
                  const price = typeof v.price === 'string' ? parseFloat(v.price) : v.price;
                  const compareAt =
                    typeof v.compareAtPrice === 'string'
                      ? parseFloat(v.compareAtPrice)
                      : v.compareAtPrice;
                  const stock = v.stockQuantity ?? 0;
                  const isLow = stock <= 5;

                  return (
                    <TableRow key={v.id || v.sku || index} className="hover:bg-muted/10">
                      <TableCell className="font-mono text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{v.sku}</span>
                          {v.isDefault && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-primary/10 text-primary border-primary/20 gap-0.5 px-1 py-0"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {t('variants.defaultBadge', { defaultValue: 'Default' })}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        {attrs.length === 0 ? (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {attrs.map((attr, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] font-normal gap-1 px-1.5 py-0"
                              >
                                <Tag className="h-2.5 w-2.5 text-muted-foreground" />
                                <span>{isAr ? attr.valueAr : attr.valueEn}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-xs font-mono">
                        <div>
                          <span className="font-semibold text-foreground">
                            {price.toLocaleString()} EGP
                          </span>
                          {compareAt && compareAt > price && (
                            <span className="block text-[10px] text-muted-foreground line-through">
                              {compareAt.toLocaleString()} EGP
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              isLow ? 'text-amber-500' : 'text-foreground'
                            }`}
                          >
                            {stock}
                          </span>
                          {isLow && (
                            <Badge
                              variant="outline"
                              className="text-[9px] border-amber-500/40 text-amber-500 px-1 py-0"
                            >
                              {t('variants.lowStock', { defaultValue: 'Low' })}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        {v.isActive ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          >
                            {t('status.active', { defaultValue: 'Active' })}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-muted text-muted-foreground"
                          >
                            {t('status.inactive', { defaultValue: 'Inactive' })}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            disabled={disabled || deletingId !== null}
                            onClick={() => handleOpenEdit(v, index)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            disabled={disabled || variants.length <= 1 || deletingId !== null}
                            onClick={() => handleDelete(v, index)}
                            title={
                              variants.length <= 1
                                ? t('variants.deleteOnlyVariantTitle')
                                : t('variants.deleteTitle')
                            }
                          >
                            {v.id && deletingId === v.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <VariantFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={editingVariant}
        onSubmit={handleSubmitVariant}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </Card>
  );
}
