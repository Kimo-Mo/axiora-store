'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Boxes,
  ChevronLeft,
  ChevronRight,
  History,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import type { InventoryVariantDto, PaginationMeta } from '@/types/admin';

interface InventoryTableProps {
  variants: InventoryVariantDto[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  loading?: boolean;
  onAdjustStock: (variant: InventoryVariantDto) => void;
  onViewHistory: (variant: InventoryVariantDto) => void;
}

export function InventoryTable({
  variants,
  meta,
  onPageChange,
  loading = false,
  onAdjustStock,
  onViewHistory,
}: InventoryTableProps) {
  const t = useTranslations('admin.inventory');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const page = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? variants.length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">{t('variant')}</TableHead>
              <TableHead className="text-xs font-semibold">{t('sku')}</TableHead>
              <TableHead className="text-xs font-semibold text-center">{t('currentStock')}</TableHead>
              <TableHead className="text-xs font-semibold text-center">{t('reservedStock')}</TableHead>
              <TableHead className="text-xs font-semibold text-center">{t('availableStock')}</TableHead>
              <TableHead className="text-xs font-semibold text-center">{t('status')}</TableHead>
              <TableHead className="text-xs font-semibold text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                  <Boxes className="h-6 w-6 animate-pulse mx-auto mb-2 text-primary" />
                  <span>{t('loading')}</span>
                </TableCell>
              </TableRow>
            ) : variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">{t('noResults')}</p>
                </TableCell>
              </TableRow>
            ) : (
              variants.map((v) => {
                const productName = isAr ? v.productNameAr : v.productNameEn;

                return (
                  <TableRow key={v.variantId} className="hover:bg-muted/10">
                    {/* Variant and Product */}
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-md border border-border overflow-hidden bg-muted/40 shrink-0">
                          {v.primaryImageUrl ? (
                            <Image
                              src={v.primaryImageUrl}
                              alt={productName}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <Link
                            href={`/${locale}/dashboard/products/${v.productId}`}
                            className="font-medium text-xs hover:text-primary transition-colors block truncate"
                            title={productName}
                          >
                            {productName}
                          </Link>

                          {v.attributes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {v.attributes.map((attr) => (
                                <Badge
                                  key={attr.attributeSlug}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 font-normal"
                                >
                                  {isAr ? attr.attributeNameAr : attr.attributeNameEn}:{' '}
                                  {isAr ? attr.valueAr : attr.valueEn}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {v.sku}
                      </Badge>
                    </TableCell>

                    {/* On-hand Stock */}
                    <TableCell className="text-center font-mono font-semibold text-xs">
                      {v.stockQuantity}
                    </TableCell>

                    {/* Reserved Stock */}
                    <TableCell className="text-center font-mono text-xs text-amber-600 dark:text-amber-400">
                      {v.reservedQuantity}
                    </TableCell>

                    {/* Available Stock */}
                    <TableCell className="text-center font-mono font-bold text-xs">
                      <span className={v.availableQuantity <= 0 ? 'text-destructive' : 'text-primary'}>
                        {v.availableQuantity}
                      </span>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      {v.isLowStock ? (
                        <Badge
                          variant="destructive"
                          className="gap-1 text-[10px] px-2 py-0.5 font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>{t('lowStockBadge')}</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                        >
                          {t('inStock')}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAdjustStock(v)}
                          className="h-8 px-2.5 text-xs gap-1.5"
                          title={t('adjustStock')}
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('adjustStock')}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewHistory(v)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={t('history')}
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('showingItemCount', { shown: variants.length, total })}</span>

        <div className="flex items-center gap-2">
          <span>{t('pageOf', { page, totalPages })}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
