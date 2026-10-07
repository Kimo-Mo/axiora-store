'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Loading from '@/app/loading';
import { orderService } from '@/services/order.service';
import { OrderConfirmation } from '@/components/features/checkout/OrderConfirmation';

/**
 * Order confirmation screen — the sole customer-facing post-order touchpoint
 * this phase. Ownership-scoped detail fetch: foreign or missing orders render
 * the not-found state.
 */
export default function OrderConfirmationPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : '';
  const t = useTranslations('checkout');

  const orderQuery = useQuery({
    queryKey: ['orders', 'detail', orderNumber],
    queryFn: () => orderService.detail(orderNumber),
    enabled: Boolean(orderNumber),
    retry: false,
  });

  if (!orderNumber || orderQuery.isError) {
    return (
      <div className="main_container py-16 md:py-24 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">{t('errors.generic')}</h1>
      </div>
    );
  }

  if (orderQuery.isLoading || !orderQuery.data) {
    return <Loading />;
  }

  return <OrderConfirmation key={orderQuery.data.orderNumber} order={orderQuery.data} />;
}
