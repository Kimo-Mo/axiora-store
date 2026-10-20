'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Search, Building2, Package } from 'lucide-react';
import type { AdminBrandDto } from '@/types/admin';

interface BrandTableProps {
  brands: AdminBrandDto[];
  onEdit: (brand: AdminBrandDto) => void;
  onDelete: (brand: AdminBrandDto) => void;
  loading?: boolean;
}

export function BrandTable({
  brands,
  onEdit,
  onDelete,
  loading = false,
}: BrandTableProps) {
  const t = useTranslations('admin.brands');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrands = brands.filter((brand) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      brand.nameEn.toLowerCase().includes(term) ||
      brand.nameAr.toLowerCase().includes(term) ||
      brand.slug.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute inset-s-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder', { defaultValue: 'Search brands by name or slug...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-8 text-xs h-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredBrands.length} {t('countLabel', { defaultValue: 'brands' })}
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">{t('columns.logo', { defaultValue: 'Logo' })}</TableHead>
              <TableHead className="text-xs font-semibold">{t('columns.brand', { defaultValue: 'Brand Name' })}</TableHead>
              <TableHead className="text-xs font-semibold">{t('columns.slug', { defaultValue: 'Slug' })}</TableHead>
              <TableHead className="text-xs font-semibold">{t('columns.products', { defaultValue: 'Products' })}</TableHead>
              <TableHead className="text-xs font-semibold">{t('columns.status', { defaultValue: 'Status' })}</TableHead>
              <TableHead className="text-xs font-semibold text-end">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                  {t('common.loading', { defaultValue: 'Loading brands...' })}
                </TableCell>
              </TableRow>
            ) : filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">
                    {searchTerm
                      ? t('noResults', { defaultValue: 'No brands match your search.' })
                      : t('empty', { defaultValue: 'No brands registered yet.' })}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id} className="hover:bg-muted/10">
                  <TableCell className="w-16">
                    {brand.logo ? (
                      <div className="relative h-10 w-10 rounded-md overflow-hidden border border-border/80 bg-background shrink-0">
                        <Image
                          src={brand.logo}
                          alt={brand.nameEn}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted/40 border border-border flex items-center justify-center text-muted-foreground">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div>
                      <span className="font-semibold text-sm text-foreground block">
                        {isAr ? brand.nameAr : brand.nameEn}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isAr ? brand.nameEn : brand.nameAr}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    /{brand.slug}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-[11px] gap-1 px-2 py-0.5 bg-muted/50 border-border/60">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{brand.productCount}</span>
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {brand.isActive ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      >
                        {t('status.active', { defaultValue: 'Active' })}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
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
                        onClick={() => onEdit(brand)}
                        title={t('edit')}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(brand)}
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
