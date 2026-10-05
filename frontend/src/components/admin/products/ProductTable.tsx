import Image from 'next/image';
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
import { MoreHorizontal, Pencil, Trash2, Package } from 'lucide-react';
import type { LegacyProductImage } from '@/types/legacyCatalog';
import type { LegacyProduct } from '@/types/legacyCatalog';
import { getImageUrl } from '@/lib/utils';

function TableRowSkeleton() {
  return (
    <TableRow className="border-border">
      <TableCell className="w-16">
        <Skeleton className="h-12 w-12 rounded" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-14" />
      </TableCell>
      <TableCell className="text-end">
        <Skeleton className="h-8 w-8 rounded ms-auto" />
      </TableCell>
    </TableRow>
  );
}

interface ProductTableProps {
  products: LegacyProduct[];
  loading: boolean;
  setDeleteSlug: (slug: string) => void;
}

export function ProductTable({ products, loading, setDeleteSlug }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground w-16">Image</TableHead>
            <TableHead className="text-muted-foreground min-w-48">Name</TableHead>
            <TableHead className="text-muted-foreground">Category</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Available</TableHead>
            <TableHead className="text-muted-foreground">Price</TableHead>
            <TableHead className="text-end text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-10 w-10 opacity-30" />
                  <span className="text-sm">No products found.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border border-border overflow-hidden shrink-0">
                    {product.main_image ? (
                      <Image
                        src={getImageUrl((product.main_image as LegacyProductImage).image)}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground text-sm">{product.name}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-xs border-border text-muted-foreground capitalize">
                    {product.categories && product.categories.length > 0
                      ? product.categories[0].name
                      : 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      product.is_active
                        ? 'bg-success/30 text-success hover:bg-success/30 border-none'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted border-none'
                    }>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      product.is_available
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-none'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted border-none'
                    }>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground text-sm">
                  {product.price !== null
                    ? `$${parseFloat(String(product.price)).toFixed(2)}`
                    : '—'}
                </TableCell>
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/products/${product.slug}/edit`}
                          className="flex items-center gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                        onClick={() => setDeleteSlug(product.slug)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
