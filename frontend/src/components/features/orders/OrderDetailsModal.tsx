'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import type { InitPaymentPayload } from '@/services/payment.service';
import { OrderStatusBadge } from './OrderStatusBadge';
import { getErrorMessage, type OrderDetails } from './types';

interface InitPaymentResponse {
  checkout_url?: string;
}

interface OrderDetailsModalProps {
  orderNumber: string | null;
  onClose: () => void;
}

export function OrderDetailsModal({ orderNumber, onClose }: OrderDetailsModalProps) {
  const detailsQuery = useQuery({
    queryKey: ['orders', 'detail', orderNumber],
    queryFn: async (): Promise<OrderDetails> => orderService.getOrderDetail(orderNumber ?? ''),
    enabled: Boolean(orderNumber),
  });

  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const details = detailsQuery.data;
  const isPendingOrder = details?.status === 'pending';

  const handlePayNow = async () => {
    if (!details) return;
    setIsInitiatingPayment(true);
    setPaymentError(null);

    const payload: InitPaymentPayload = {
      order_id: details.order_number,
      gateway_code: 'stripe',
    };

    try {
      const response = (await paymentService.initPayment(payload)) as InitPaymentResponse;
      if (response.checkout_url) {
        if (typeof window !== 'undefined' && details.order_number) {
          sessionStorage.setItem('last_order_number', details.order_number);
        }
        window.location.href = response.checkout_url;
      } else {
        setPaymentError('No checkout URL returned. Please contact support.');
      }
    } catch {
      setPaymentError('Failed to initiate payment. Please try again.');
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  return (
    <Dialog open={Boolean(orderNumber)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {detailsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading details...</p>
        )}
        {detailsQuery.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(detailsQuery.error, 'Failed to load order details')}
          </p>
        )}
        {!detailsQuery.isLoading && !detailsQuery.isError && !details && (
          <p className="text-sm text-muted-foreground">No order details found.</p>
        )}

        {details && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Order ID: {details.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(details.created_at).toLocaleString()}
                </p>
              </div>
              <OrderStatusBadge status={details.status} />
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Subtotal</p>
                <p>
                  {details.currency} {details.subtotal}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Tax</p>
                <p>
                  {details.currency} {details.tax}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Discount Total</p>
                <p>
                  {details.currency} {details.discount_total}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Coupon Code</p>
                <p>{details.coupon_code ?? 'No coupon'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-3 sm:col-span-2">
                <p className="mb-1 text-xs text-muted-foreground">Total Price</p>
                <p className="font-semibold text-primary">
                  {details.currency} {details.total_price}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/60 p-4">
              <p className="mb-2 text-sm font-semibold">Payment Details</p>
              {details.payment_details ? (
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <p>Gateway ID: {details.payment_details.gateway_id}</p>
                  <p>Gateway Name: {details.payment_details.gateway_name}</p>
                  <p>Status: {details.payment_details.status}</p>
                  <p>
                    Amount: {details.payment_details.amount} {details.payment_details.currency}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payment details available.</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Order Items ({details.items.length})</p>
              {details.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card/60 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Item ID: {item.id}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: {item.currency} {item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {isPendingOrder && (
              <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-sm font-semibold">Complete Payment</p>
                <p className="text-xs text-muted-foreground mb-2">
                  This order is awaiting payment. Click below to pay via Stripe.
                </p>
                <Button
                  onClick={handlePayNow}
                  disabled={isInitiatingPayment}
                  className="w-full sm:w-auto">
                  {isInitiatingPayment ? 'Redirecting…' : 'Pay Now with Stripe'}
                </Button>
                {paymentError && <p className="text-xs text-destructive mt-1">{paymentError}</p>}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
