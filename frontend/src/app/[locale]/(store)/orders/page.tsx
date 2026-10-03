'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { useUser } from '@/hooks/useUser';
import { useAuthModal } from '@/providers/AuthModalProvider';
import {
  OrderDetailsModal,
  OrderList,
  type OrderListItem,
  type OrderStatusFilter,
} from '@/components/features/orders';

export default function OrdersPage() {
  const { data: currentUser } = useUser();
  const isAuthenticated = Boolean(currentUser);
  const { openModal } = useAuthModal();
  const [activeStatus, setActiveStatus] = useState<OrderStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ['orders', 'list', activeStatus],
    queryFn: async (): Promise<OrderListItem[]> =>
      orderService.getOrdersList(
        activeStatus === 'all' ? undefined : { filter: `status=${activeStatus}` }
      ),
    enabled: isAuthenticated,
  });

  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(keyword) ||
        order.user.full_name.toLowerCase().includes(keyword) ||
        order.user.email.toLowerCase().includes(keyword) ||
        order.user.username.toLowerCase().includes(keyword) ||
        order.status.toString().toLowerCase().includes(keyword) ||
        (order.coupon_code ?? '').toLowerCase().includes(keyword) ||
        order.total_price.toLowerCase().includes(keyword) ||
        (order.payment_details?.status ?? '').toLowerCase().includes(keyword)
    );
  }, [ordersQuery.data, search]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold">Login to view your orders</h2>
        <Button onClick={() => openModal('login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track your orders</p>
        </div>

        <OrderList
          orders={filteredOrders}
          search={search}
          activeStatus={activeStatus}
          isLoading={ordersQuery.isLoading}
          isError={ordersQuery.isError}
          error={ordersQuery.error}
          onSearchChange={setSearch}
          onStatusChange={setActiveStatus}
          onViewDetails={setSelectedOrderNumber}
        />
      </div>

      <OrderDetailsModal
        orderNumber={selectedOrderNumber}
        onClose={() => setSelectedOrderNumber(null)}
      />
    </div>
  );
}
