'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderList, type OrderStatusFilter } from '@/components/features/orders';
import { useOrdersQuery } from '@/hooks/orders/useOrdersQuery';
import { useUser } from '@/hooks/useUser';
import { useAuthModal } from '@/providers/AuthModalProvider';

/**
 * Customer order history (US1).
 *
 * Paginated newest-first list with server-side status filtering. Un signed-in
 * visitors get the login gate; the signed-in empty state lives in
 * `OrdersEmptyState` so it stays inviting in both locales.
 */
export default function AccountOrdersPage() {
  const t = useTranslations('orders');
  const tAccount = useTranslations('account');
  const tAuth = useTranslations('auth');
  const { data: currentUser, isLoading: userLoading } = useUser();
  const { openModal } = useAuthModal();
  const [page, setPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState<OrderStatusFilter>('ALL');

  const ordersQuery = useOrdersQuery(page, activeStatus);
  const pagination = ordersQuery.data?.pagination;

  const handleStatusChange = (status: OrderStatusFilter) => {
    setActiveStatus(status);
    setPage(1);
  };

  if (!userLoading && !currentUser) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <Shield size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-bold">{tAccount('signInRequired')}</h2>
        <p className="text-sm text-muted-foreground">{tAccount('signInRequiredHint')}</p>
        <Button onClick={() => openModal('login')}>{tAuth('signIn')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('list.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('list.subtitle')}</p>
      </div>

      <OrderList
        orders={ordersQuery.data?.orders ?? []}
        activeStatus={activeStatus}
        isLoading={ordersQuery.isLoading || ordersQuery.isFetching}
        isError={ordersQuery.isError}
        error={ordersQuery.error}
        onStatusChange={handleStatusChange}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {t('list.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label={t('list.previousPage')}>
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              aria-label={t('list.nextPage')}>
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
