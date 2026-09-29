'use client';

import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Users, ArrowRight, Package, Home, Clock, TrendingUp } from 'lucide-react';

import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { useAdminOrdersQuery } from '@/hooks/admin/useAdminOrdersQuery';
import { useAdminOrderStatsQuery } from '@/hooks/admin/useAdminOrderStatsQuery';
import { useProductsQuery } from '@/hooks/admin/useProductsQuery';
import { useAdminUsersQuery } from '@/hooks/admin/useAdminUsersQuery';

// ─── Stat card skeleton ──────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-24 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const {
    data: ordersData,
    isPending: LoadingOrders,
    isError,
  } = useAdminOrdersQuery({
    page: 1,
    page_size: 5,
    filter: 'order_by_date=true',
  });
  const recentOrders = ordersData?.results ?? [];
  const totalOrders = ordersData?.count ?? null;

  const { data: productsData, isPending: LoadingProducts } = useProductsQuery({
    page: 1,
    search: '',
    categoryId: 'all',
  });
  const totalProducts = productsData?.count ?? null;

  const { data: usersData, isPending: LoadingUsers } = useAdminUsersQuery({ page: 1, search: '' });
  const totalUsers = usersData?.count ?? null;

  const { data: statsData, isPending: LoadingStats } = useAdminOrderStatsQuery();
  const profit = statsData?.profit ?? null;
  const completedCount = statsData?.completed_count ?? 0;
  const pendingCount = statsData?.pending_count ?? null;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: CreditCard,
      sub: 'All time orders',
      href: '/dashboard/orders',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      sub: 'Registered accounts',
      href: '/dashboard/users',
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      sub: 'All time products',
      href: '/dashboard/products',
    },
    {
      title: 'Profit',
      value: profit !== null ? `$ ${parseFloat(profit as any).toFixed(2)}` : null,
      icon: TrendingUp,
      sub: `${completedCount} completed orders`,
      href: '/dashboard/orders',
    },
    {
      title: 'Pending Orders',
      value: pendingCount,
      icon: Clock,
      sub: 'Orders waiting to be processed',
      href: '/dashboard/orders',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here is what&apos;s happening today.
          </p>
        </div>
        <Link href={'/'}>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
            <Home className="me-2 h-4 w-4" /> Go to Store
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {LoadingOrders || LoadingProducts || LoadingUsers || LoadingStats
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value !== null ? (typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value) : '—'}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  {stat.href && (
                    <Link href={stat.href}>
                      <ArrowRight className="h-5 w-5 text-primary cursor-pointer rtl:rotate-180" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Recent Orders */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Orders</CardTitle>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary gap-1">
              View all <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isError && <div className="text-center py-8 text-destructive text-sm">{isError}</div>}
          {LoadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16 ms-auto" />
                </div>
              ))}
            </div>
          ) : !isError && recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No orders yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Order #</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Items</TableHead>
                  <TableHead className="text-end text-muted-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground tracking-tight text-sm">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {order.user.full_name || order.user.email}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {order.items_count}
                    </TableCell>
                    <TableCell className="text-end font-medium text-foreground text-sm">
                      {order.currency}
                      {parseFloat(order.total_price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
