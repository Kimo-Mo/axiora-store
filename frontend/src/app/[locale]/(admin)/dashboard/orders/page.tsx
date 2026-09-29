'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderDetailsModal } from '@/components/admin/modals/OrderDetailsModal';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { useAdminOrdersQuery } from '@/hooks/admin/useAdminOrdersQuery';

const PAGE_SIZE = 10;

type TabStatus = 'all' | 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'cancelled';

function TableRowSkeleton() {
  return (
    <TableRow className="border-border">
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell className="text-end">
        <Skeleton className="h-4 w-16 ms-auto" />
      </TableCell>
      <TableCell className="text-end">
        <Skeleton className="h-8 w-16 ms-auto rounded" />
      </TableCell>
    </TableRow>
  );
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = (searchParams.get('status') ?? 'all') as TabStatus;
  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(search);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Keep a stable ref so the debounce effect doesn't re-run every time
  // updateParams gets a new reference (which would create an infinite loop).
  const updateParamsRef = useRef(updateParams);
  useEffect(() => {
    updateParamsRef.current = updateParams;
  }, [updateParams]);

  // Sync the controlled input when the URL changes externally (Back/Forward nav).
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const id = setTimeout(() => {
      // Only push if the URL value actually differs to avoid no-op history pushes.
      if ((searchInput || null) !== (search || null)) {
        updateParamsRef.current({ search: searchInput || null, page: null });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput, search]);

  const { data, isPending, isError } = useAdminOrdersQuery({
    filter: activeTab !== 'all' ? `status=${activeTab},order_by_date=true` : 'order_by_date=true',
    search: search || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const orders = data?.results ?? [];
  const pagination = {
    count: data?.count ?? 0,
    total_pages: data?.total_pages ?? 1,
    current_page: data?.current_page ?? 1,
  };

  const tabs: { value: TabStatus; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Management</h1>
        <p className="text-muted-foreground mt-1">Review and manage customer orders.</p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-foreground">Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select
                value={activeTab}
                onValueChange={(v) => updateParams({ status: v === 'all' ? null : v, page: null })}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border h-9 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="orders-search"
                  placeholder="Search by username or email"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="ps-9 bg-background border-border h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="text-center py-12 text-destructive text-sm">
              Failed to load orders. Please try again.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Order #</TableHead>
                      <TableHead className="text-muted-foreground font-medium">User</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Items</TableHead>
                      <TableHead className="text-end text-muted-foreground font-medium">
                        Amount
                      </TableHead>
                      <TableHead className="text-end text-muted-foreground font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPending ? (
                      Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground text-sm">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className="border-border hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground tracking-tight text-sm">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {order.user.full_name || order.user.email || (
                              <span className="text-muted-foreground italic">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm text-center">
                            {order.items_count}
                          </TableCell>
                          <TableCell className="text-end font-medium text-foreground text-sm">
                            {order.currency} {parseFloat(order.total_price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary-hover hover:bg-primary/10 gap-2 h-8"
                              onClick={() => setSelectedOrderId(order.order_number)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.current_page} of {pagination.total_pages} ({pagination.count}{' '}
                    total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                      disabled={page <= 1 || isPending}
                      className="border-border h-8">
                      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateParams({
                          page: String(Math.min(pagination.total_pages, page + 1)),
                        })
                      }
                      disabled={page >= pagination.total_pages || isPending}
                      className="border-border h-8">
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailsModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId || ''}
      />
    </div>
  );
}
