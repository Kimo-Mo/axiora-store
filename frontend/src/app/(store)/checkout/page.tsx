'use client';

import { useCartStore } from '@/lib/stores/useCartStore';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator, RadioGroup, RadioGroupItem, Label } from '@/components/ui';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { SiStripe } from 'react-icons/si';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Loading from '@/app/loading';
import type { ApiResponse } from '@/types';
import { useRouter } from 'next/navigation';

interface CheckoutOrderResponse {
  order_number: string;
  total_price: string;
}

interface InitPaymentResponse {
  client_secret?: string;
  payment_intent_id?: string;
  checkout_url?: string;
  gateway_order_id?: string;
}

interface Gateway {
  id: number;
  name: string;
  tax_rate: string;
  description: string;
  icon: string | null;
  fixed_fee?: string;
}

interface CartSummaryResponse {
  subtotal: string;
  discount: string;
  total_after_discount: string;
  exchange_rate?: string;
}

const extractResponseData = <T,>(response: T | ApiResponse<T>): T =>
  response && typeof response === 'object' && 'data' in response
    ? (response.data as T)
    : (response as T);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, _hasHydrated, syncWithServer, resetCartState } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModal();
  const [subtotal, setSubtotal] = useState(getTotal());
  const [discount, setDiscount] = useState(0);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(getTotal());
  const [exchangeRate, setExchangeRate] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const autoPayTriggeredRef = useRef(false);

  const selectedGateway = useMemo(() => {
    return gateways.find(g => g.name.toLowerCase() === paymentMethod) || null;
  }, [gateways, paymentMethod]);

  const paymentFee = useMemo(() => {
    if (!selectedGateway) return 0;
    const taxRate = parseFloat(selectedGateway.tax_rate || '0');
    const flatFeeUsd = parseFloat(selectedGateway.fixed_fee || '0');
    const flatFeeLocal = flatFeeUsd * exchangeRate;
    return (totalAfterDiscount * taxRate) + flatFeeLocal;
  }, [selectedGateway, totalAfterDiscount, exchangeRate]);

  const finalTotal = totalAfterDiscount + paymentFee;

  const currencySymbol = useMemo(() => {
    const currency = items[0]?.product?.currency || 'USD';
    return currency === 'USD' ? '$' : currency;
  }, [items]);

  const loadCartSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setError(null);
    try {
      await syncWithServer();
      const cartResponse = await cartService.getCart();
      const cartData = extractResponseData<CartSummaryResponse>(
        cartResponse as CartSummaryResponse | ApiResponse<CartSummaryResponse>
      );
      setSubtotal(Number(cartData.subtotal || 0));
      setDiscount(Number(cartData.discount || 0));
      setTotalAfterDiscount(Number(cartData.total_after_discount || 0));
      setExchangeRate(Number(cartData.exchange_rate || 1));
    } catch {
      setSubtotal(getTotal());
      setDiscount(0);
      setTotalAfterDiscount(getTotal());
      setError('Failed to load latest totals');
    } finally {
      setIsLoadingSummary(false);
    }
  }, [getTotal, syncWithServer]);

  const processPayment = useCallback(async () => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('pendingCheckoutPay', '1');
      }
      openModal('login');
      setInfo('Please login to continue payment');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);
    setInfo(null);

    let orderNumber: string | undefined;

    try {
      const checkoutResponse = await orderService.checkout();
      const checkoutData = extractResponseData<CheckoutOrderResponse>(
        checkoutResponse as CheckoutOrderResponse | ApiResponse<CheckoutOrderResponse>
      );
      orderNumber = checkoutData.order_number;

      const paymentResponse = (await paymentService.initPayment({
        order_id: orderNumber,
        gateway_code: paymentMethod,
      })) as InitPaymentResponse;

      if (paymentResponse.checkout_url) {
        if (typeof window !== 'undefined' && orderNumber) {
          window.sessionStorage.setItem('last_order_number', orderNumber);
        }
        // Cart was converted to an order on the backend — clear the local store
        // immediately so the user sees an empty cart when they return.
        resetCartState();
        window.location.href = paymentResponse.checkout_url;
        return;
      }

      // Stripe returned no checkout_url — treat as unexpected but order exists
      setInfo('Order created. Redirecting to your orders…');
      resetCartState();
      await syncWithServer();
      router.push('/orders');
    } catch (err) {
      if (orderNumber) {
        // Order was created but payment init failed — clear cart and redirect
        try {
          await syncWithServer();
        } catch {
          // best-effort cart sync
        }
        router.push(`/orders?error=payment_failed&order=${orderNumber}`);
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      setError(message);
    } finally {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('pendingCheckoutPay');
      }
      setIsProcessingPayment(false);
    }
  }, [isAuthenticated, openModal, syncWithServer, router]);

  const loadGateways = useCallback(async () => {
    setIsLoadingGateways(true);
    try {
      const data = await paymentService.getGateways();
      const results = data.results || [];
      setGateways(results);
      if (results.length > 0) {
        setPaymentMethod((prev) => {
          if (!results.find((g: Gateway) => g.name.toLowerCase() === prev)) {
             return results[0].name.toLowerCase();
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to load gateways', err);
    } finally {
      setIsLoadingGateways(false);
    }
  }, []);

  useEffect(() => {
    loadCartSummary();
  }, [loadCartSummary]);

  useEffect(() => {
    loadGateways();
  }, [loadGateways]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasPendingPay = window.sessionStorage.getItem('pendingCheckoutPay') === '1';
    if (isAuthenticated && hasPendingPay && !autoPayTriggeredRef.current) {
      autoPayTriggeredRef.current = true;
      processPayment();
    }
  }, [isAuthenticated, processPayment]);

  if (!_hasHydrated) return <Loading />;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-12 pb-12">
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Review your order details and choose a payment method to complete your purchase.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Payment Method</h2>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={setPaymentMethod}
            className="grid grid-cols-1 gap-4"
          >
            {isLoadingGateways ? (
              <div className="text-center py-6 text-muted-foreground text-sm">Loading payment methods...</div>
            ) : gateways.length === 0 ? (
               <div className="text-center py-6 text-muted-foreground text-sm">No payment methods available.</div>
            ) : (
              gateways.map((gateway) => {
                const gatewayCode = gateway.name.toLowerCase();
                const isSelected = paymentMethod === gatewayCode;
                const taxRate = parseFloat(gateway.tax_rate || '0');
                const flatFeeUsd = parseFloat(gateway.fixed_fee || '0');
                const feeAmount = (totalAfterDiscount * taxRate) + (flatFeeUsd * exchangeRate);
                
                return (
                  <Label
                    key={gateway.id}
                    htmlFor={gatewayCode}
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={gatewayCode} id={gatewayCode} className="h-5 w-5 ml-1" />
                      <div className="w-16 h-10 bg-white border border-gray-100 rounded-md shadow-sm flex items-center justify-center p-2 shrink-0">
                        {gateway.icon ? (
                          <img src={gateway.icon} alt={gateway.name} className="max-w-full max-h-full object-contain" />
                        ) : gatewayCode === 'stripe' ? (
                          <SiStripe className="text-[#635BFF] w-full h-full" />
                        ) : (
                          <CreditCard className="text-gray-600 w-full h-full" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{gateway.name}</div>
                        {gatewayCode === 'stripe' && (
                           <div className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1 font-medium tracking-wide uppercase">Recommended</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        {currencySymbol}{(totalAfterDiscount + feeAmount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        Included fee: {currencySymbol}{feeAmount.toFixed(2)}
                      </div>
                    </div>
                  </Label>
                );
              })
            )}
          </RadioGroup>
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <Card className="sticky top-24 shadow-sm border-muted/60">
          <CardHeader className="bg-muted/20 border-b border-muted/40 pb-4">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-emerald-600">
                  - {currencySymbol}
                  {discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment method fee</span>
                <span className="font-medium">
                  {currencySymbol}
                  {paymentFee.toFixed(2)}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                {currencySymbol}
                {finalTotal.toFixed(2)}
              </span>
            </div>

            {isLoadingSummary && (
              <p className="text-sm text-muted-foreground animate-pulse">Loading summary…</p>
            )}
            {info && <p className="text-sm text-primary font-medium">{info}</p>}
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <Button
              onClick={processPayment}
              disabled={isProcessingPayment || !paymentMethod || isLoadingGateways}
              size="lg"
              className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg h-12">
              {isProcessingPayment 
                ? 'Processing…' 
                : `Confirm and Pay ${currencySymbol}${finalTotal.toFixed(2)}`
              }
            </Button>

            <div className="text-center pt-2">
               <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                 <CreditCard className="w-3.5 h-3.5" />
                 Secure encrypted checkout
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

