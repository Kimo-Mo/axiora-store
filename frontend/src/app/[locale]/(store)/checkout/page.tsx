'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import Loading from '@/app/loading';
import { useCart } from '@/hooks/useCart';
import { useCheckoutQuote } from '@/hooks/useCheckoutQuote';
import { usePaymentMethods, preferredMethod } from '@/hooks/usePaymentMethods';
import { usePlaceOrder } from '@/hooks/usePlaceOrder';
import { useUser } from '@/hooks/useUser';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { userService } from '@/services/user.service';
import { Link, useRouter } from '@/i18n/navigation';
import { canonicalizePhone, isEgyptianMobile } from '@/lib/phone';
import type { CheckoutNewAddress, UnavailableItemDto } from '@/types/checkout';
import type { StorePaymentMethod } from '@/types/payment';
import { PhoneVerification } from '@/components/features/verification/PhoneVerification';
import { CheckoutAccountSection } from '@/components/features/checkout/CheckoutAccountSection';
import { CheckoutAddressSection } from '@/components/features/checkout/CheckoutAddressSection';
import { CheckoutPaymentSection } from '@/components/features/checkout/CheckoutPaymentSection';
import { CheckoutSummary } from '@/components/features/checkout/CheckoutSummary';

/** Extract the machine-readable error code from an axios failure. */
function errorInfo(err: unknown): { status?: number; code?: string; details?: unknown } {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: { code?: string; details?: unknown } }
      | undefined;
    return {
      status: err.response?.status,
      code: data?.error?.code,
      details: data?.error?.details,
    };
  }
  return {};
}

/**
 * Generate an RFC 4122 v4 UUID string.
 * Guaranteed to satisfy the backend's `z.string().uuid()` validation across all browser environments.
 */
function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, isHydrated, isAuthenticated } = useCart();
  const { openModal } = useAuthModal();
  const { data: user } = useUser();

  // Payment methods come from the server so the step can never offer a method the
  // store has disabled. Selection is page state because both branches (COD fee,
  // phone gate) and the quote depend on it.
  const {
    methods: enabledMethods,
    isLoading: methodsLoading,
  } = usePaymentMethods();

  const [selectedMethod, setSelectedMethod] = useState<StorePaymentMethod | null>(null);

  // Derived rather than stored in an effect: before the list loads there is
  // nothing valid to select, and the fallback (COD, else the sole method) only
  // applies once the server has actually answered.
  const paymentMethod: StorePaymentMethod | null =
    enabledMethods.includes(selectedMethod as StorePaymentMethod)
      ? (selectedMethod as StorePaymentMethod)
      : preferredMethod(enabledMethods);

  // Address book (server state — TanStack Query owns it).
  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userService.listAddresses(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
  const addresses = addressesQuery.data;
  const hasSavedAddresses = Boolean(addresses && addresses.length > 0);

  const [mode, setMode] = useState<'saved' | 'new'>('saved');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<CheckoutNewAddress | null>(null);
  const [newAddressDraftGovernorate, setNewAddressDraftGovernorate] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [insufficientItems, setInsufficientItems] = useState<UnavailableItemDto[] | null>(null);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);

  // No saved book yet → the new-address form is the only option.
  const addressMode = hasSavedAddresses ? mode : 'new';

  // Derived default selection: the default (or first) saved address until the
  // customer picks one — no effect needed (react-hooks/set-state-in-effect).
  const selectedAddress = useMemo(() => {
    if (!addresses || addresses.length === 0) return null;
    if (selectedAddressId && addresses.some((a) => a.id === selectedAddressId)) {
      return addresses.find((a) => a.id === selectedAddressId) ?? null;
    }
    return addresses.find((a) => a.isDefault) ?? addresses[0];
  }, [addresses, selectedAddressId]);
  const effectiveSelectedAddressId = selectedAddress?.id ?? null;

  // The confirmed delivery phone defaults to the shipping address's recipient
  // phone (clarification Q4); the customer's edit wins until the address
  // changes, which resets the draft.
  const addressPhone =
    addressMode === 'saved' ? selectedAddress?.phone ?? null : newAddress?.phone ?? null;
  const customerPhone = phoneDraft ?? addressPhone ?? '';

  const phoneValid = isEgyptianMobile(customerPhone);
  const addressReady = addressMode === 'saved' ? Boolean(effectiveSelectedAddressId) : Boolean(newAddress);

  // FR-012: COD requires the DELIVERY phone to be the verified account phone
  // — the server enforces the same canonical comparison; this only gates the
  // button and the panel early. Online payments are never phone-gated
  // (spec 008 FR-017), so this is scoped to COD.
  const isCodSelected = paymentMethod === 'COD';
  const phoneVerifiedForOrder = Boolean(
    isCodSelected &&
      user &&
      user.phoneVerified === true &&
      user.phone !== null &&
      canonicalizePhone(user.phone) === canonicalizePhone(customerPhone),
  );

  const governorate =
    addressMode === 'saved'
      ? selectedAddress?.governorate ?? null
      : newAddress?.governorate ?? newAddressDraftGovernorate ?? null;

  const { quote, isLoading: quoteLoading, isError: quoteError } = useCheckoutQuote(governorate, paymentMethod);
  const { placeOrder, isPlacing } = usePlaceOrder();

  // One panel surfaces both stale-quote items and 409 conflict items.
  const summaryUnavailableItems =
    insufficientItems ??
    (quote && !quote.isOrderable && quote.unavailableItems.length > 0 ? quote.unavailableItems : null);

  const canPlaceOrder = Boolean(
    isAuthenticated &&
      items.length > 0 &&
      addressReady &&
      phoneValid &&
      paymentMethod !== null &&
      quote?.isOrderable &&
      !summaryUnavailableItems &&
      phoneVerifiedForOrder,
  );

  // Idempotency key: generated once per deliberate checkout attempt and
  // retained across network errors and 409 retries; regenerated only after a
  // definitive (400) failure (research.md D-3).
  const idempotencyKeyRef = useRef<string>('');
  const getIdempotencyKey = (): string => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateIdempotencyKey();
    }
    return idempotencyKeyRef.current;
  };

  const handlePlaceOrder = async (): Promise<void> => {
    setInsufficientItems(null);
    setPlaceOrderError(null);

    // The button is disabled without a resolved method, so this is a type guard
    // rather than a real branch.
    if (paymentMethod === null) return;

    const payload =
      addressMode === 'saved'
        ? {
            idempotencyKey: getIdempotencyKey(),
            paymentMethod,
            customerPhone: customerPhone.trim(),
            notes: notes.trim() || null,
            shippingAddressId: effectiveSelectedAddressId as string,
          }
        : {
            idempotencyKey: getIdempotencyKey(),
            paymentMethod,
            customerPhone: customerPhone.trim(),
            notes: notes.trim() || null,
            newAddress: newAddress as CheckoutNewAddress,
            saveNewAddress,
          };

    try {
      await placeOrder(payload);
    } catch (err) {
      const { status, code, details } = errorInfo(err);
      if (code === 'INSUFFICIENT_STOCK') {
        const items =
          (details as { items?: UnavailableItemDto[] } | undefined)?.items ?? [];
        setInsufficientItems(items);
        // The same idempotency key is retained — retrying is safe (D-3).
      } else if (code === 'PHONE_NOT_VERIFIED' || code === 'PHONE_MISMATCH') {
        // Defense in depth: the inline panel is shown above and the button is
        // gated; these 403s only surface on a direct bypass attempt.
        setPlaceOrderError(
          code === 'PHONE_MISMATCH' ? t('errors.codPhoneMismatch') : t('errors.codPhoneRequired'),
        );
      } else if (status === 400) {
        idempotencyKeyRef.current = '';
        setPlaceOrderError(
          code === 'DELIVERY_UNAVAILABLE' ? t('errors.deliveryUnavailable') : t('errors.placeOrderFailed'),
        );
      } else if (code !== 'UNAUTHORIZED') {
        setPlaceOrderError(t('errors.placeOrderFailed'));
      }
    }
  };

  if (!isHydrated) return <Loading />;

  // FR-001: unauthenticated visitors are prompted to sign in; the guest cart
  // is preserved and merged by the auth forms, and this page re-renders
  // authenticated once the session exists.
  if (!isAuthenticated) {
    return (
      <div className="main_container py-16 md:py-24 flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('authGate.title')}</h1>
        <p className="text-sm text-muted-foreground max-w-md">{t('authGate.description')}</p>
        <Button size="lg" onClick={() => openModal('login')}>
          {t('authGate.title')}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="main_container py-16 md:py-24 flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('emptyCart.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('emptyCart.hint')}</p>
        <Button asChild variant="outline">
          <Link href="/store">{t('emptyCart.backToStore')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="main_container py-6 md:py-10">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start mt-8">
        <div className="lg:col-span-3 space-y-8">
          <CheckoutAccountSection
            phone={customerPhone}
            onPhoneChange={setPhoneDraft}
            phoneError={customerPhone && !phoneValid ? t('errors.generic') : undefined}
          />

          <CheckoutAddressSection
            addresses={addresses}
            addressesLoading={addressesQuery.isLoading}
            mode={addressMode}
            selectedAddressId={effectiveSelectedAddressId}
            onModeChange={(next) => {
              setMode(next);
              setPhoneDraft(null);
              if (next === 'saved') {
                setNewAddressDraftGovernorate(null);
              }
            }}
            onSelectAddress={(addressId) => {
              setSelectedAddressId(addressId);
              setPhoneDraft(null);
            }}
            onNewAddressChange={setNewAddress}
            onGovernorateDraftChange={setNewAddressDraftGovernorate}
            saveNewAddress={saveNewAddress}
            onSaveNewAddressChange={setSaveNewAddress}
          />

          <CheckoutPaymentSection
            notes={notes}
            onNotesChange={setNotes}
            methods={enabledMethods}
            selected={paymentMethod ?? 'COD'}
            onSelect={setSelectedMethod}
            isLoading={methodsLoading}
          />

          {isCodSelected && user && !phoneVerifiedForOrder && (
            <PhoneVerification key={customerPhone} initialPhone={customerPhone} />
          )}
        </div>

        <div className="lg:col-span-2">
          <CheckoutSummary
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
            insufficientItems={summaryUnavailableItems}
            isPlacing={isPlacing}
            canPlaceOrder={canPlaceOrder}
            onPlaceOrder={() => void handlePlaceOrder()}
            onBackToCart={() => router.push('/cart')}
            placeOrderError={placeOrderError}
            paymentMethod={paymentMethod}
          />
        </div>
      </div>
    </div>
  );
}
