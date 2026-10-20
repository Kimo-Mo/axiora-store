'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Package, Eye, Archive, CheckCircle } from 'lucide-react';
import type { AdminProductListItemDto } from '@/types/admin';
import { useUpdateProductStatusMutation } from '@/hooks/admin/useProductMutations';

function TableRowSkeleton() {
  return (
    <TableRow className="border-border h-16">
      <TableCell className="w-16">
        <Skeleton className="h-12 w-12 rounded-lg" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-44 mb-1" />
        <Skeleton className="h-3 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-end">
        <Skeleton className="h-8 w-8 rounded ms-auto" />
      </TableCell>
    </TableRow>
  );
}

interface ProductTableProps {
  products: AdminProductListItemDto[];
  loading: boolean;
  onDeleteClick: (product: AdminProductListItemDto) => void;
}

export function ProductTable({ products, loading, onDeleteClick }: ProductTableProps) {
  const locale = useLocale();
  const t = useTranslations('admin.products');
  const updateStatusMutation = useUpdateProductStatusMutation();

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border">
            <TableHead className="w-16"></TableHead>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('category')}</TableHead>
            <TableHead>{t('brand')}</TableHead>
            <TableHead>{t('price')}</TableHead>
            <TableHead>{t('stock')}</TableHead>
            <TableHead>{t('status.label', { defaultValue: 'Status' })}</TableHead>
            <TableHead className="text-end">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                <p className="text-sm font-medium">{t('noProducts')}</p>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const name = locale === 'ar' ? product.nameAr : product.nameEn;
              const categoryName = locale === 'ar' ? product.category.nameAr : product.category.nameEn;
              const brandName = locale === 'ar' ? product.brand.nameAr : product.brand.nameEn;
              const isStockOut = product.totalStock === 0;
              const isLowStock = product.totalStock > 0 && product.totalStock <= 5;

              return (
                <TableRow key={product.id} className="border-border hover:bg-muted/30 transition-colors">
                  {/* Thumbnail */}
                  <TableCell className="w-16">
                    <div className="relative h-12 w-12 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                      {product.primaryImage?.url ? (
                        <Image
                          src={product.primaryImage.url}
                          alt={product.primaryImage.alt ?? name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>

                  {/* Name & SKU */}
                  <TableCell>
                    <div className="font-semibold text-foreground leading-tight hover:text-primary transition-colors">
                      <Link href={`/dashboard/products/${product.id}`}>{name}</Link>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {product.sku}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20">
                          {t('featured')}
                        </Badge>
                      )}
                      {product.isNew && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          {t('isNew')}
                        </Badge>
                      )}
                      {product.isBestSeller && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          {t('bestSeller')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="text-sm text-foreground">
                    {categoryName}
                  </TableCell>

                  {/* Brand */}
                  <TableCell className="text-sm text-foreground">
                    {brandName}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-sm font-semibold">
                    {product.minPrice === product.maxPrice
                      ? `${Number(product.minPrice).toLocaleString()} EGP`
                      : `${Number(product.minPrice).toLocaleString()} - ${Number(product.maxPrice).toLocaleString()} EGP`}
                  </TableCell>

                  {/* Stock */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isStockOut
                          ? 'bg-destructive/10 text-destructive border-destructive/20 font-medium'
                          : isLowStock
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium'
                      }
                    >
                      {product.totalStock}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }
                    >
                      {product.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/store/${product.slug}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>View in Store</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            <span>{t('edit')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: product.id,
                              isActive: !product.isActive,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {product.isActive ? (
                            <>
                              <Archive className="h-4 w-4 text-muted-foreground" />
                              <span>{t('archive')}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span>{t('activate')}</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(product)}
                          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('deleteTitle')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
